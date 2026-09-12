import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createGovernedExecutionBoundary } from '../runtime/governed-execution-boundary.mjs';
import { createWindowsPowerShellAdapter } from '../runtime/windows-powershell-adapter.mjs';
import { executeWindowsPowerShellGovernedCandidate } from '../runtime/windows-powershell-governed-candidate.mjs';

function admittedTask(hostId, overrides = {}) {
  return {
    task_id: 'task-pwsh-governed-1',
    mission_id: 'mission-pwsh-governed-1',
    delivery_id: 'delivery-pwsh-governed-1',
    request_id: 'request-pwsh-governed-1',
    wake_trace_id: 'wake-pwsh-governed-1',
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
    pathModule: path.win32,
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
        wake_trace_id: task.wake_trace_id,
        operation: result.operation,
        cwd: result.cwd,
        exit_code: result.exit_code,
      }),
    },
    verification: {
      verify: async ({ task, result, receipt }) => ({
        passed: receipt.task_id === task.task_id &&
          receipt.mission_id === task.mission_id &&
          receipt.wake_trace_id === task.wake_trace_id &&
          receipt.operation === task.execution.operation &&
          receipt.cwd === result.cwd &&
          receipt.exit_code === result.exit_code &&
          result.success === true,
      }),
    },
  });
  return { adapter, boundary, events, invoked: () => invoked };
}

async function attempt(h, task, hostIdentity, overrides = {}) {
  return executeWindowsPowerShellGovernedCandidate({
    admittedTask: task,
    actorContext: { actor_id: 'agentos:overseer' },
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(),
    powerShellAdapter: h.adapter,
    executionBoundary: h.boundary,
    ...overrides,
  });
}

test('eligible PowerShell pickup remains zero-invocation while runtime execution is not wired', async () => {
  const hostIdentity = { host_id: 'host-win-governed-1' };
  const h = harness();
  const task = admittedTask(hostIdentity.host_id);
  await assert.rejects(attempt(h, task, hostIdentity), (error) => {
    assert.equal(error.code, 'POWERSHELL_EXECUTION_NOT_AUTHORIZED');
    assert.equal(error.pickup.pickup_eligible, true);
    assert.equal(error.pickup.execution_authorized, false);
    assert.equal(error.pickup.disposition, 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED');
    return true;
  });
  assert.equal(h.invoked(), 0);
  assert.deepEqual(h.events, []);
});

test('missing exact wake correlation blocks before host gate, governance and PowerShell invocation', async () => {
  const hostIdentity = { host_id: 'host-win-governed-missing-wake' };
  const h = harness();
  await assert.rejects(attempt(h, admittedTask(hostIdentity.host_id, { wake_trace_id: '' }), hostIdentity), /admittedTask.wake_trace_id is required/);
  assert.equal(h.invoked(), 0);
  assert.deepEqual(h.events, []);
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

test('runtime-disabled gate blocks before governed authority evaluation', async () => {
  const hostIdentity = { host_id: 'host-win-governed-3' };
  const h = harness({ authorityAllowed: false });
  await assert.rejects(attempt(h, admittedTask(hostIdentity.host_id), hostIdentity), /POWERSHELL_EXECUTION_NOT_AUTHORIZED:POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED/);
  assert.equal(h.invoked(), 0);
  assert.deepEqual(h.events, []);
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

test('runtime caller cannot bypass disabled execution by substituting operation or cwd', async () => {
  const hostIdentity = { host_id: 'host-win-governed-5' };
  const h = harness();
  const task = admittedTask(hostIdentity.host_id);
  await assert.rejects(attempt(h, task, hostIdentity, {
    workspaceRoot: 'D:/outside',
    operation: 'test.run',
    cwd: 'D:/outside',
  }), /POWERSHELL_EXECUTION_NOT_AUTHORIZED:POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED/);
  assert.equal(h.invoked(), 0);
  assert.deepEqual(h.events, []);
});
