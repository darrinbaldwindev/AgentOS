import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateWindowsPowerShellRemotePickup } from '../runtime/windows-powershell-remote-gate.mjs';
import { executeWindowsPowerShellGovernedCandidate } from '../runtime/windows-powershell-governed-candidate.mjs';

const identities = Object.freeze({
  'powershell.exe': Object.freeze({ available: true, path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', version: '5.1.26100.33296' }),
  'git.exe': Object.freeze({ available: true, path: 'C:\\Program Files\\Git\\bin\\git.exe', version: 'git version 2.55.0.windows.5' }),
  'npm.cmd': Object.freeze({ available: true, path: 'C:\\Program Files\\nodejs\\npm.cmd', version: null }),
});

function admittedTask(hostId) {
  return {
    task_id: 'task-runtime-enable-1',
    mission_id: 'mission-runtime-enable-1',
    delivery_id: 'delivery-runtime-enable-1',
    request_id: 'request-runtime-enable-1',
    wake_trace_id: 'wake-runtime-enable-1',
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
    execution: { adapter: 'windows-powershell', operation: 'repo.status', cwd: 'C:/agentos/AgentOS' },
  };
}

function hostProbe({ withIdentity = true } = {}) {
  return {
    async probe(agentId) {
      return {
        agent_id: agentId,
        mode: 'DRY_RUN',
        evaluation: {
          windows: true,
          eligible: true,
          ...(withIdentity ? { tool_evidence: identities } : {}),
        },
        capabilities: ['shell.powershell.repo.read'],
      };
    },
  };
}

test('runtime execution remains disabled by default after canonical pickup eligibility', async () => {
  const hostIdentity = { host_id: 'host-runtime-default' };
  const result = await evaluateWindowsPowerShellRemotePickup({
    admittedTask: admittedTask(hostIdentity.host_id),
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(),
  });
  assert.equal(result.pickup_eligible, true);
  assert.equal(result.runtime_execution_enabled, false);
  assert.equal(result.execution_authorized, false);
  assert.equal(result.disposition, 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED');
});

test('explicit runtime enablement authorizes only an already eligible bounded candidate', async () => {
  const hostIdentity = { host_id: 'host-runtime-enabled' };
  const result = await evaluateWindowsPowerShellRemotePickup({
    admittedTask: admittedTask(hostIdentity.host_id),
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(),
    runtimeExecutionEnabled: true,
  });
  assert.equal(result.pickup_eligible, true);
  assert.equal(result.runtime_execution_enabled, true);
  assert.equal(result.execution_authorized, true);
  assert.equal(result.disposition, 'ELIGIBLE_FOR_BOUNDED_POWERSHELL_EXECUTION');
});

test('enabled governed candidate forwards probe-time executable identity into adapter', async () => {
  const hostIdentity = { host_id: 'host-runtime-candidate' };
  const task = admittedTask(hostIdentity.host_id);
  let adapterCalls = 0;
  let boundaryCalls = 0;
  let observedExpected = null;
  const adapter = {
    describe: () => ({ capability: 'shell.powershell.repo.read' }),
    execute: async ({ expectedExecutables }) => {
      adapterCalls += 1;
      observedExpected = expectedExecutables;
      return { success: true, operation: 'repo.status', cwd: task.execution.cwd, exit_code: 0 };
    },
  };
  const boundary = {
    execute: async ({ invoke }) => {
      boundaryCalls += 1;
      const result = await invoke();
      return { status: 'VERIFIED', result, receipt: { receipt_id: 'runtime-enabled-receipt' }, verification: { passed: true } };
    },
  };

  const result = await executeWindowsPowerShellGovernedCandidate({
    admittedTask: task,
    actorContext: { actor_id: 'agentos:overseer' },
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(),
    powerShellAdapter: adapter,
    executionBoundary: boundary,
    runtimeExecutionEnabled: true,
  });

  assert.equal(result.status, 'VERIFIED');
  assert.equal(result.pickup.execution_authorized, true);
  assert.equal(boundaryCalls, 1);
  assert.equal(adapterCalls, 1);
  assert.deepEqual(observedExpected, identities);
});

test('enabled candidate without executable identity evidence fails before governed execution', async () => {
  const hostIdentity = { host_id: 'host-runtime-no-identity' };
  let adapterCalls = 0;
  let boundaryCalls = 0;
  await assert.rejects(executeWindowsPowerShellGovernedCandidate({
    admittedTask: admittedTask(hostIdentity.host_id),
    actorContext: { actor_id: 'agentos:overseer' },
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe({ withIdentity: false }),
    powerShellAdapter: {
      describe: () => ({ capability: 'shell.powershell.repo.read' }),
      execute: async () => { adapterCalls += 1; },
    },
    executionBoundary: {
      execute: async () => { boundaryCalls += 1; },
    },
    runtimeExecutionEnabled: true,
  }), /POWERSHELL_EXECUTABLE_IDENTITY_EVIDENCE_REQUIRED/);
  assert.equal(boundaryCalls, 0);
  assert.equal(adapterCalls, 0);
});

test('explicit runtime enablement cannot override canonical host capability mismatch', async () => {
  const hostIdentity = { host_id: 'host-runtime-mismatch' };
  const probe = {
    async probe(agentId) {
      return { agent_id: agentId, mode: 'DRY_RUN', evaluation: { windows: true, eligible: true, tool_evidence: identities }, capabilities: ['shell.powershell.system.read'] };
    },
  };
  const result = await evaluateWindowsPowerShellRemotePickup({
    admittedTask: admittedTask(hostIdentity.host_id),
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: probe,
    runtimeExecutionEnabled: true,
  });
  assert.equal(result.pickup_eligible, false);
  assert.equal(result.execution_authorized, false);
  assert.equal(result.disposition, 'HOST_CAPABILITY_MISMATCH');
});
