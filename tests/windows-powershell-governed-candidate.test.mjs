import test from 'node:test';
import assert from 'node:assert/strict';
import { createGovernedExecutionBoundary } from '../runtime/governed-execution-boundary.mjs';
import { createWindowsPowerShellAdapter } from '../runtime/windows-powershell-adapter.mjs';
import { executeWindowsPowerShellGovernedCandidate } from '../runtime/windows-powershell-governed-candidate.mjs';

function admittedTask(hostId, overrides = {}) {
  return {
    task_id: 'task-pwsh-governed-1',
    mission_id: 'mission-pwsh-governed-1',
    delivery_id: 'delivery-pwsh-governed-1',
    request_id: 'request-pwsh-governed-1',
    project_id: 'agentos-local',
    target_host_id: hostId,
    admitted_by: 'agentos:overseer',
    authority_admitted: true,
    environment: 'DRY_RUN',
    pickup_state: 'QUEUED',
    required_capabilities: ['shell.powershell.repo.read'],
    scope: ['local-runtime'],
    constraints: ['bounded-command-catalogue'],
    created_at: new Date().toISOString(),
    execution: {
      adapter: 'windows-powershell',
      operation: 'repo.status',
      cwd: 'C:/agentos/AgentOS',
    },
    ...overrides,
  };
}

function hostProbe(capabilities = ['shell.powershell.repo.read']) {
  return {
    async probe(agentId) {
      return {
        agent_id: agentId,
        mode: 'DRY_RUN',
        evaluation: { windows: true, eligible: true },
        capabilities,
      };
    },
  };
}

function harness({ authorityAllowed = true } = {}) {
  let invoked = 0;
  const events = [];
  const adapter = createWindowsPowerShellAdapter({
    allowedRoots: ['C:/agentos'],
    pathResolver: (input) => input,
    executor: async () => {
      invoked += 1;
      events.push('powershell');
      return { stdout: '## main', stderr: '', exitCode: 0 };
    },
  });
  const gate = (name, fn = async () => undefined) => ({ [name]: async (input) => { events.push(name); return fn(input); } });
  const boundary = createGovernedExecutionBoundary({
    context: gate('assertValid'),
    authority: gate('assertAllowed', async () => { if (!authorityAllowed) throw new Error('AUTHORITY_DENIED'); }),
    consent: gate('assertAllowed'),
    capability: gate('assertExecutionEligible', async ({ task }) => adapter.describe(task.execution.operation)),
    policy: gate('assertAllowed'),
    risk: gate('evaluate', async () => ({ approvalRequired: false })),
    budget: {
      reserve: async () => ({ reservation_id: 'budget-pwsh-1' }),
      reconcile: async ({ actual_units }) => ({ status: 'RECONCILED', actual_units }),
    },
    approval: gate('assertApproved'),
    receipts: {
      record: async ({ task, result }) => ({
        receipt_id: 'receipt-pwsh-1',
        task_id: task.task_id,
        mission_id: task.mission_id,
        operation: result.operation,
        cwd: result.cwd,
        exit_code: result.exit_code,
      }),
    },
    verification: {
      verify: async ({ task, result, receipt }) => ({
        passed: receipt.task_id === task.task_id &&
          receipt.mission_id === task.mission_id &&
          receipt.operation === task.execution.operation &&
          receipt.cwd === result.cwd &&
          receipt.exit_code === result.exit_code &&
          result.success === true,
      }),
    },
  });
  return { adapter, boundary, events, invoked: () => invoked };
}

test('exact admitted PowerShell intent passes host gate then existing governed boundary once', async () => {
  const hostIdentity = { host_id: 'host-win-governed-1' };
  const h = harness();
  const task = admittedTask(hostIdentity.host_id);
  const result = await executeWindowsPowerShellGovernedCandidate({
    admittedTask: task,
    actorContext: { actor_id: 'agentos:overseer' },
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(),
    powerShellAdapter: h.adapter,
    executionBoundary: h.boundary,
  });

  assert.equal(result.status, 'VERIFIED');
  assert.equal(result.pickup.pickup_eligible, true);
  assert.equal(result.pickup.execution_authorized, false);
  assert.equal(result.governed.result.operation, 'repo.status');
  assert.equal(result.governed.result.cwd, 'C:/agentos/AgentOS');
  assert.equal(h.invoked(), 1);
});

test('host capability mismatch blocks before governed boundary and PowerShell invocation', async () => {
  const hostIdentity = { host_id: 'host-win-governed-2' };
  const h = harness();
  await assert.rejects(executeWindowsPowerShellGovernedCandidate({
    admittedTask: admittedTask(hostIdentity.host_id),
    actorContext: { actor_id: 'agentos:overseer' },
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(['shell.powershell.system.read']),
    powerShellAdapter: h.adapter,
    executionBoundary: h.boundary,
  }), /POWERSHELL_PICKUP_BLOCKED:HOST_CAPABILITY_MISMATCH/);
  assert.equal(h.invoked(), 0);
  assert.deepEqual(h.events, []);
});

test('authority denial remains zero-invocation after host eligibility succeeds', async () => {
  const hostIdentity = { host_id: 'host-win-governed-3' };
  const h = harness({ authorityAllowed: false });
  await assert.rejects(executeWindowsPowerShellGovernedCandidate({
    admittedTask: admittedTask(hostIdentity.host_id),
    actorContext: { actor_id: 'agentos:overseer' },
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(),
    powerShellAdapter: h.adapter,
    executionBoundary: h.boundary,
  }), /AUTHORITY_DENIED/);
  assert.equal(h.invoked(), 0);
  assert.deepEqual(h.events, ['assertValid', 'assertAllowed']);
});

test('admitted capability cannot be reused for a different PowerShell operation capability', async () => {
  const hostIdentity = { host_id: 'host-win-governed-4' };
  const h = harness();
  const task = admittedTask(hostIdentity.host_id, {
    execution: { adapter: 'windows-powershell', operation: 'test.run', cwd: 'C:/agentos/AgentOS' },
  });
  await assert.rejects(executeWindowsPowerShellGovernedCandidate({
    admittedTask: task,
    actorContext: { actor_id: 'agentos:overseer' },
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(['shell.powershell.dev.execute']),
    powerShellAdapter: h.adapter,
    executionBoundary: h.boundary,
  }), /POWERSHELL_EXECUTION_CAPABILITY_MISMATCH/);
  assert.equal(h.invoked(), 0);
});

test('runtime caller cannot substitute operation or cwd because invocation is derived only from admitted task', async () => {
  const hostIdentity = { host_id: 'host-win-governed-5' };
  const h = harness();
  const task = admittedTask(hostIdentity.host_id);
  const result = await executeWindowsPowerShellGovernedCandidate({
    admittedTask: task,
    actorContext: { actor_id: 'agentos:overseer' },
    hostIdentity,
    workspaceRoot: 'D:/outside',
    hostProbe: hostProbe(),
    powerShellAdapter: h.adapter,
    executionBoundary: h.boundary,
    operation: 'test.run',
    cwd: 'D:/outside',
  });
  assert.equal(result.governed.result.operation, task.execution.operation);
  assert.equal(result.governed.result.cwd, task.execution.cwd);
  assert.equal(h.invoked(), 1);
});
