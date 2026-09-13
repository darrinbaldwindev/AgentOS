import test from 'node:test';
import assert from 'node:assert/strict';

import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { createWindowsPowerShellClaimedLocalRuntime } from '../runtime/windows-powershell-local-runtime.mjs';

const hostIdentity = Object.freeze({ host_id: 'host:claimed:win' });

function task() {
  return {
    delivery_id: 'delivery:claimed:1',
    request_id: 'request:claimed:1',
    project_id: 'agentos-local',
    mission_id: 'mission:claimed:1',
    task_id: 'task:claimed:1',
    wake_trace_id: 'wake:claimed:1',
    actor_id: 'agentos:overseer',
    issuer: 'agentos:overseer',
    admitted_by: 'agentos:overseer',
    authority_admitted: true,
    authority: { granted_capabilities: ['shell.powershell.repo.read'] },
    required_capabilities: ['shell.powershell.repo.read'],
    scope: [],
    constraints: [],
    environment: 'DRY_RUN',
    pickup_state: 'QUEUED',
    target_host_id: hostIdentity.host_id,
    created_at: new Date().toISOString(),
    execution: { adapter: 'windows-powershell', operation: 'repo.status', cwd: 'C:/agentos/AgentOS' },
  };
}

function createClaims() {
  const records = new Map();
  return {
    async get(deliveryId) { return records.get(deliveryId) ?? null; },
    async claim({ deliveryId, requestId, hostId }) {
      const existing = records.get(deliveryId);
      if (existing) return { claimed: false, disposition: 'DUPLICATE_DELIVERY', record: existing };
      const record = {
        schema_version: 1,
        delivery_id: deliveryId,
        request_id: requestId,
        host_id: hostId,
        claimed_at: new Date().toISOString(),
        state: 'CLAIMED',
      };
      records.set(deliveryId, record);
      return { claimed: true, disposition: 'CLAIMED', record };
    },
    size() { return records.size; },
  };
}

function hostProbe() {
  return {
    async probe(agentId) {
      return {
        agent_id: agentId,
        mode: 'DRY_RUN',
        evaluation: {
          windows: true,
          eligible: true,
          tool_evidence: {
            'powershell.exe': { available: true, path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', version: '5.1' },
            'git.exe': { available: true, path: 'C:\\Program Files\\Git\\cmd\\git.exe', version: 'git version fixture' },
          },
        },
        capabilities: ['shell.powershell.repo.read'],
      };
    },
  };
}

function successfulExecutionResult() {
  return {
    success: true,
    operation: 'repo.status',
    cwd: 'C:\\agentos\\AgentOS',
    exit_code: 0,
    started_at: '2026-09-13T11:30:00.000Z',
    finished_at: '2026-09-13T11:30:01.000Z',
    duration_ms: 1000,
    stdout: 'clean',
    stderr: '',
    timed_out: false,
    truncated: false,
    resolved_executables: {},
  };
}

function fixture({
  runtimeExecutionEnabled = false,
  executePowerShell = async () => successfulExecutionResult(),
  recordReceipt = async () => ({ persisted: true }),
  runVerifier = async () => ({ passed: true, evidence: ['fixture:verified'] }),
} = {}) {
  const claims = createClaims();
  let adapterCalls = 0;
  let reserveCalls = 0;
  let reconcileCalls = 0;
  let receiptCalls = 0;
  let verifierCalls = 0;
  const powerShellAdapter = {
    operations: ['repo.status'],
    describe(operation) {
      if (operation !== 'repo.status') throw new Error('unknown operation');
      return { capability: 'shell.powershell.repo.read', elevated: false, interactive: false };
    },
    async execute(request) {
      adapterCalls += 1;
      return executePowerShell(request);
    },
  };
  const runtime = createWindowsPowerShellClaimedLocalRuntime({
    claims,
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(),
    powerShellAdapter,
    runtimeExecutionEnabled,
    canonicalContext: { missions: [{ id: 'mission:claimed:1' }], decisions: [] },
    authorityPolicy: createAuthorityPolicy({ issuers: ['agentos:overseer'], capabilities: ['shell.powershell.repo.read'] }),
    consentGate: { async assertAllowed() { return { state: 'PRE_AUTHORIZED' }; } },
    toolPolicy: { assertAllowed(name) { if (name !== 'repo.status') throw new Error('TOOL_NOT_ALLOWED'); return { allowed: true }; } },
    riskPolicy: { async evaluate() { return { level: 'A0', approvalRequired: false, reason: 'read only', evidence: [] }; } },
    budget: {
      async reserve() { reserveCalls += 1; return { reservation_id: 'reservation:claimed:1', status: 'RESERVED' }; },
      async reconcile({ reservation_id, actual_units }) {
        reconcileCalls += 1;
        return { reservation_id, actual_units, status: 'RECONCILED' };
      },
    },
    humanGate: { get() { return null; } },
    codeIdentity: 'fixture:exact-head',
    createdAt: '2026-09-13T11:30:00.000Z',
    async recordReceipt(receipt) {
      receiptCalls += 1;
      return recordReceipt(receipt);
    },
    async resolveBudgetStatus() { return 'RECONCILED'; },
    verificationRouter: { async selectVerifier() { return { id: 'verifier:fixture' }; } },
    async runVerifier(input) {
      verifierCalls += 1;
      return runVerifier(input);
    },
  });
  return {
    runtime,
    claims,
    getAdapterCalls: () => adapterCalls,
    getReserveCalls: () => reserveCalls,
    getReconcileCalls: () => reconcileCalls,
    getReceiptCalls: () => receiptCalls,
    getVerifierCalls: () => verifierCalls,
  };
}

test('disabled claimed runtime reaches neither claim, budget nor PowerShell', async () => {
  const { runtime, claims, getAdapterCalls, getReserveCalls } = fixture();
  await assert.rejects(runtime.worker.execute(task()), /POWERSHELL_EXECUTION_NOT_AUTHORIZED/);
  assert.equal(claims.size(), 0);
  assert.equal(getReserveCalls(), 0);
  assert.equal(getAdapterCalls(), 0);
});

test('enabled claimed runtime invokes once and a replay cannot invoke twice', async () => {
  const { runtime, claims, getAdapterCalls, getReserveCalls } = fixture({ runtimeExecutionEnabled: true });
  const first = await runtime.worker.execute(task());
  assert.equal(first.status, 'VERIFIED');
  assert.equal(first.delivery_id, 'delivery:claimed:1');
  assert.equal(first.task_id, 'task:claimed:1');
  assert.equal(first.wake_trace_id, 'wake:claimed:1');
  assert.equal(first.governed.assurance_complete, false);
  assert.equal(first.governed.completion_eligible, false);
  assert.equal(claims.size(), 1);
  assert.equal(getReserveCalls(), 1);
  assert.equal(getAdapterCalls(), 1);

  await assert.rejects(runtime.worker.execute(task()), /GOVERNED_EXECUTION_DUPLICATE_DELIVERY/);
  assert.equal(getReserveCalls(), 1);
  assert.equal(getAdapterCalls(), 1);
});

test('post-invoke exception retains claim, reconciles charged budget and blocks blind replay', async () => {
  const state = fixture({
    runtimeExecutionEnabled: true,
    executePowerShell: async () => { throw new Error('CRASH_AFTER_SIDE_EFFECT_BOUNDARY'); },
  });
  await assert.rejects(state.runtime.worker.execute(task()), /CRASH_AFTER_SIDE_EFFECT_BOUNDARY/);
  assert.equal(state.claims.size(), 1);
  assert.equal(state.getAdapterCalls(), 1);
  assert.equal(state.getReserveCalls(), 1);
  assert.equal(state.getReconcileCalls(), 1);
  assert.equal(state.getReceiptCalls(), 0);
  assert.equal(state.getVerifierCalls(), 0);

  await assert.rejects(state.runtime.worker.execute(task()), /GOVERNED_EXECUTION_DUPLICATE_DELIVERY/);
  assert.equal(state.getAdapterCalls(), 1);
  assert.equal(state.getReserveCalls(), 1);
  assert.equal(state.getReconcileCalls(), 1);
});

test('receipt persistence failure after PowerShell side effect retains claim and blocks blind replay', async () => {
  const state = fixture({
    runtimeExecutionEnabled: true,
    recordReceipt: async () => { throw new Error('RECEIPT_PERSISTENCE_FAILED'); },
  });
  await assert.rejects(state.runtime.worker.execute(task()), /RECEIPT_PERSISTENCE_FAILED/);
  assert.equal(state.claims.size(), 1);
  assert.equal(state.getAdapterCalls(), 1);
  assert.equal(state.getReserveCalls(), 1);
  assert.equal(state.getReceiptCalls(), 1);
  assert.equal(state.getVerifierCalls(), 0);

  await assert.rejects(state.runtime.worker.execute(task()), /GOVERNED_EXECUTION_DUPLICATE_DELIVERY/);
  assert.equal(state.getAdapterCalls(), 1);
  assert.equal(state.getReserveCalls(), 1);
  assert.equal(state.getReceiptCalls(), 1);
});

test('verification failure after receipted side effect reconciles budget, retains claim and cannot replay', async () => {
  const state = fixture({
    runtimeExecutionEnabled: true,
    runVerifier: async () => ({ passed: false, evidence: ['fixture:forced-negative'] }),
  });
  await assert.rejects(state.runtime.worker.execute(task()), /VERIFICATION_FAILED/);
  assert.equal(state.claims.size(), 1);
  assert.equal(state.getAdapterCalls(), 1);
  assert.equal(state.getReserveCalls(), 1);
  assert.equal(state.getReceiptCalls(), 1);
  assert.equal(state.getVerifierCalls(), 1);
  assert.equal(state.getReconcileCalls(), 1);

  await assert.rejects(state.runtime.worker.execute(task()), /GOVERNED_EXECUTION_DUPLICATE_DELIVERY/);
  assert.equal(state.getAdapterCalls(), 1);
  assert.equal(state.getVerifierCalls(), 1);
  assert.equal(state.getReconcileCalls(), 1);
});