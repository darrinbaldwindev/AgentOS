import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWindowsPowerShellLocalWorker,
  WINDOWS_POWERSHELL_WORKER_ID,
} from '../runtime/windows-powershell-local-worker.mjs';

const identities = Object.freeze({
  'powershell.exe': Object.freeze({ available: true, path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', version: '5.1.26100.33296' }),
  'git.exe': Object.freeze({ available: true, path: 'C:\\Program Files\\Git\\bin\\git.exe', version: 'git version 2.55.0.windows.5' }),
  'npm.cmd': Object.freeze({ available: true, path: 'C:\\Program Files\\nodejs\\npm.cmd', version: null }),
});

function task(hostId, {
  capability = 'shell.powershell.repo.read',
  operation = 'repo.status',
  targetHostId = hostId,
} = {}) {
  return {
    task_id: 'task-local-worker-1',
    mission_id: 'mission-local-worker-1',
    delivery_id: 'delivery-local-worker-1',
    request_id: 'request-local-worker-1',
    wake_trace_id: 'wake-local-worker-1',
    project_id: 'agentos-local',
    actor_id: 'agentos:overseer',
    target_host_id: targetHostId,
    admitted_by: 'agentos:overseer',
    authority_admitted: true,
    environment: 'DRY_RUN',
    pickup_state: 'QUEUED',
    required_capabilities: [capability],
    scope: ['local-runtime'],
    constraints: ['bounded-command-catalogue'],
    created_at: new Date().toISOString(),
    execution: { adapter: 'windows-powershell', operation, cwd: 'C:/agentos/AgentOS' },
  };
}

function probe(capabilities = ['shell.powershell.repo.read'], { withIdentity = true } = {}) {
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
        capabilities,
      };
    },
  };
}

function adapterHarness() {
  let executeCalls = 0;
  const capabilityByOperation = Object.freeze({
    'repo.status': 'shell.powershell.repo.read',
    'test.run': 'shell.powershell.dev.execute',
    'process.list': 'shell.powershell.system.read',
  });
  const adapter = {
    operations: Object.freeze(Object.keys(capabilityByOperation)),
    describe(operation) {
      const capability = capabilityByOperation[operation];
      if (!capability) throw new Error('POWERSHELL_OPERATION_NOT_ALLOWED');
      return Object.freeze({ operation, capability, elevated: false, interactive: false });
    },
    async execute({ operation, cwd, expectedExecutables }) {
      executeCalls += 1;
      return Object.freeze({
        success: true,
        operation,
        capability: capabilityByOperation[operation],
        cwd,
        exit_code: 0,
        stdout: 'ok',
        stderr: '',
        timed_out: false,
        truncated: false,
        started_at: '2026-09-12T11:00:00.000Z',
        finished_at: '2026-09-12T11:00:00.010Z',
        duration_ms: 10,
        resolved_executables: expectedExecutables,
      });
    },
  };
  return { adapter, executeCalls: () => executeCalls };
}

function boundaryHarness({ afterInvokeError = null } = {}) {
  let executeCalls = 0;
  const boundary = {
    async execute({ invoke }) {
      executeCalls += 1;
      const result = await invoke();
      if (afterInvokeError) throw new Error(afterInvokeError);
      return Object.freeze({
        status: 'VERIFIED',
        result,
        receipt: Object.freeze({ receipt_id: 'receipt-local-worker-1' }),
        verification: Object.freeze({ passed: true }),
        budget: Object.freeze({ status: 'RECONCILED' }),
      });
    },
  };
  return { boundary, executeCalls: () => executeCalls };
}

function makeWorker({
  hostId = 'host-local-worker-1',
  hostProbe = probe(),
  runtimeExecutionEnabled = false,
  boundaryOptions = {},
} = {}) {
  const a = adapterHarness();
  const b = boundaryHarness(boundaryOptions);
  const local = createWindowsPowerShellLocalWorker({
    hostIdentity: { host_id: hostId },
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe,
    powerShellAdapter: a.adapter,
    executionBoundary: b.boundary,
    runtimeExecutionEnabled,
  });
  return { local, adapterCalls: a.executeCalls, boundaryCalls: b.executeCalls, hostId };
}

test('worker exposes only capabilities derived from bounded adapter catalogue', () => {
  const { local } = makeWorker();
  assert.equal(local.worker.id, WINDOWS_POWERSHELL_WORKER_ID);
  assert.deepEqual(local.worker.capabilities, [
    'shell.powershell.dev.execute',
    'shell.powershell.repo.read',
    'shell.powershell.system.read',
  ]);
});

test('runtime execution disabled by default fails closed before boundary or adapter', async () => {
  const h = makeWorker();
  const result = await h.local.execute(task(h.hostId));
  assert.equal(result.success, false);
  assert.match(result.error, /POWERSHELL_EXECUTION_NOT_AUTHORIZED/);
  assert.equal(h.boundaryCalls(), 0);
  assert.equal(h.adapterCalls(), 0);
});

test('eligible enabled task invokes exactly one governed boundary and adapter and preserves correlation', async () => {
  const h = makeWorker({ runtimeExecutionEnabled: true });
  const input = task(h.hostId);
  const result = await h.local.execute(input);
  assert.equal(result.success, true);
  assert.equal(result.workerId, WINDOWS_POWERSHELL_WORKER_ID);
  assert.equal(h.boundaryCalls(), 1);
  assert.equal(h.adapterCalls(), 1);
  assert.equal(result.output.status, 'VERIFIED');
  assert.equal(result.output.task_id, input.task_id);
  assert.equal(result.output.mission_id, input.mission_id);
  assert.equal(result.output.delivery_id, input.delivery_id);
  assert.equal(result.output.request_id, input.request_id);
  assert.equal(result.output.wake_trace_id, input.wake_trace_id);
  assert.equal(result.output.host_id, h.hostId);
  assert.equal(result.output.operation, input.execution.operation);
});

test('host capability mismatch fails before boundary and adapter', async () => {
  const h = makeWorker({
    runtimeExecutionEnabled: true,
    hostProbe: probe(['shell.powershell.system.read']),
  });
  const result = await h.local.execute(task(h.hostId));
  assert.equal(result.success, false);
  assert.match(result.error, /POWERSHELL_PICKUP_BLOCKED:HOST_CAPABILITY_MISMATCH/);
  assert.equal(h.boundaryCalls(), 0);
  assert.equal(h.adapterCalls(), 0);
});

test('host identity mismatch fails before boundary and adapter', async () => {
  const h = makeWorker({ runtimeExecutionEnabled: true });
  const result = await h.local.execute(task(h.hostId, { targetHostId: 'other-host' }));
  assert.equal(result.success, false);
  assert.match(result.error, /POWERSHELL_PICKUP_BLOCKED:HOST_MISMATCH/);
  assert.equal(h.boundaryCalls(), 0);
  assert.equal(h.adapterCalls(), 0);
});

test('missing executable identity evidence fails before boundary and adapter', async () => {
  const h = makeWorker({
    runtimeExecutionEnabled: true,
    hostProbe: probe(['shell.powershell.repo.read'], { withIdentity: false }),
  });
  const result = await h.local.execute(task(h.hostId));
  assert.equal(result.success, false);
  assert.match(result.error, /POWERSHELL_EXECUTABLE_IDENTITY_EVIDENCE_REQUIRED/);
  assert.equal(h.boundaryCalls(), 0);
  assert.equal(h.adapterCalls(), 0);
});

test('boundary receipt or verification failure after invocation remains worker failure', async () => {
  const h = makeWorker({
    runtimeExecutionEnabled: true,
    boundaryOptions: { afterInvokeError: 'EXECUTION_VERIFICATION_FAILED' },
  });
  const result = await h.local.execute(task(h.hostId));
  assert.equal(result.success, false);
  assert.match(result.error, /EXECUTION_VERIFICATION_FAILED/);
  assert.equal(h.boundaryCalls(), 1);
  assert.equal(h.adapterCalls(), 1);
});

test('adapter exception remains worker failure and cannot become success', async () => {
  const hostId = 'host-adapter-failure';
  let adapterCalls = 0;
  let boundaryCalls = 0;
  const adapter = {
    operations: ['repo.status'],
    describe: () => ({ capability: 'shell.powershell.repo.read' }),
    execute: async () => { adapterCalls += 1; throw new Error('POWERSHELL_ADAPTER_FAILED'); },
  };
  const boundary = {
    execute: async ({ invoke }) => { boundaryCalls += 1; return await invoke(); },
  };
  const local = createWindowsPowerShellLocalWorker({
    hostIdentity: { host_id: hostId },
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: probe(),
    powerShellAdapter: adapter,
    executionBoundary: boundary,
    runtimeExecutionEnabled: true,
  });
  const result = await local.execute(task(hostId));
  assert.equal(result.success, false);
  assert.match(result.error, /POWERSHELL_ADAPTER_FAILED/);
  assert.equal(boundaryCalls, 1);
  assert.equal(adapterCalls, 1);
});
