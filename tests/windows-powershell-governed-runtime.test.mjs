import test from 'node:test';
import assert from 'node:assert/strict';

import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { createWindowsPowerShellGovernedRuntime } from '../runtime/windows-powershell-governed-runtime.mjs';

const hostIdentity = Object.freeze({ host_id: 'host:runtime:win' });
const actorContext = Object.freeze({ actor_id: 'agentos:overseer' });

function task() {
  return {
    delivery_id: 'delivery:runtime:1',
    request_id: 'request:runtime:1',
    project_id: 'agentos-local',
    mission_id: 'mission:runtime:1',
    task_id: 'task:runtime:1',
    wake_trace_id: 'wake:runtime:1',
    issuer: 'agentos:overseer',
    admitted_by: 'agentos:overseer',
    authority_admitted: true,
    authority_evidence_id: 'authority-evidence:runtime:1',
    authority: { granted_capabilities: ['shell.powershell.repo.read'] },
    required_capabilities: ['shell.powershell.repo.read'],
    environment: 'DRY_RUN',
    pickup_state: 'QUEUED',
    target_host_id: hostIdentity.host_id,
    created_at: new Date().toISOString(),
    execution: { adapter: 'windows-powershell', operation: 'repo.status', cwd: 'C:/agentos/AgentOS' },
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

function dependencies({ runtimeExecutionEnabled = false } = {}) {
  let reserveCalls = 0;
  const budget = {
    async reserve() {
      reserveCalls += 1;
      return { reservation_id: 'reservation:runtime:1', status: 'RESERVED' };
    },
    async reconcile({ reservation_id, actual_units }) {
      return { reservation_id, actual_units, status: 'RECONCILED' };
    },
  };
  const boundary = createWindowsPowerShellGovernedRuntime({
    canonicalContext: { missions: [{ id: 'mission:runtime:1' }], decisions: [] },
    authorityPolicy: createAuthorityPolicy({ issuers: ['agentos:overseer'], capabilities: ['shell.powershell.repo.read'] }),
    consentGate: { async assertAllowed() { return { state: 'PRE_AUTHORIZED' }; } },
    hostIdentity,
    workspaceRoot: 'C:/agentos/AgentOS',
    hostProbe: hostProbe(),
    runtimeExecutionEnabled,
    toolPolicy: { assertAllowed(name) { if (name !== 'repo.status') throw new Error('TOOL_NOT_ALLOWED'); return { allowed: true }; } },
    riskPolicy: { async evaluate() { return { level: 'A0', approvalRequired: false, reason: 'read only', evidence: [] }; } },
    budget,
    humanGate: { get() { return null; } },
    codeIdentity: 'fixture:exact-head',
    createdAt: '2026-09-13T11:20:00.000Z',
    async recordReceipt() { return { persisted: true }; },
    async resolveBudgetStatus() { return 'RECONCILED'; },
    verificationRouter: { async selectVerifier() { return { id: 'verifier:runtime:fixture' }; } },
    async runVerifier() { return { passed: true, evidence: ['fixture:verified'] }; },
  });
  return { boundary, getReserveCalls: () => reserveCalls };
}

test('governed runtime composition remains execution-disabled by default before budget or invoke', async () => {
  const { boundary, getReserveCalls } = dependencies();
  let invokeCalls = 0;
  await assert.rejects(
    boundary.execute({
      actorContext,
      task: task(),
      async invoke() { invokeCalls += 1; return { success: true }; },
    }),
    (error) => error?.code === 'POWERSHELL_CAPABILITY_EXECUTION_NOT_AUTHORIZED',
  );
  assert.equal(getReserveCalls(), 0);
  assert.equal(invokeCalls, 0);
});

test('explicitly enabled composition reaches the existing boundary and remains below assurance completion', async () => {
  const { boundary, getReserveCalls } = dependencies({ runtimeExecutionEnabled: true });
  let invokeCalls = 0;
  const result = await boundary.execute({
    actorContext,
    task: task(),
    actualUnits: 1,
    async invoke() {
      invokeCalls += 1;
      return {
        success: true,
        operation: 'repo.status',
        cwd: 'C:\\agentos\\AgentOS',
        exit_code: 0,
        started_at: '2026-09-13T11:20:00.000Z',
        finished_at: '2026-09-13T11:20:01.000Z',
        duration_ms: 1000,
        stdout: 'clean',
        stderr: '',
        timed_out: false,
        truncated: false,
        resolved_executables: {},
      };
    },
  });
  assert.equal(invokeCalls, 1);
  assert.equal(getReserveCalls(), 1);
  assert.equal(result.status, 'VERIFIED');
  assert.equal(result.verification_scope, 'execution-boundary');
  assert.equal(result.assurance_complete, false);
  assert.equal(result.completion_eligible, false);
  assert.equal(result.receipt.status, 'AWAITING_GREEN');
  assert.equal(result.receipt.delivery_id, 'delivery:runtime:1');
  assert.equal(result.receipt.task_id, 'task:runtime:1');
  assert.equal(result.receipt.wake_trace_id, 'wake:runtime:1');
  assert.equal(result.receipt.authority_evidence_id, 'authority-evidence:runtime:1');
  assert.equal(result.budget.status, 'RECONCILED');
});
