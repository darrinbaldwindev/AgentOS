import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createGovernedExecutionBoundary } from '../runtime/governed-execution-boundary.mjs';
import { createGovernedExecutionClaimGuard } from '../runtime/governed-execution-claim-guard.mjs';
import { createRemoteDeliveryClaimStore } from '../runtime/remote-delivery-claim-store.mjs';
import { createWorkerConsentGate, WORKER_CONSENT_STATES } from '../runtime/worker-consent-gate.mjs';
import { classifyWindowsPowerShellOperationRisk, createExecutionRiskPolicy } from '../runtime/execution-risk-policy.mjs';
import { createMissionBudget } from '../runtime/mission-budget.mjs';
import { createToolPolicy } from '../runtime/tool-policy.mjs';
import { createHumanGate } from '../runtime/overseer-human-gate.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import {
  createCanonicalContextGate,
  createCanonicalAuthorityGate,
  createCanonicalPowerShellCapabilityGate,
  createCanonicalToolPolicyGate,
  createCanonicalHumanApprovalGate,
  createCanonicalPowerShellReceiptGate,
  createCanonicalVerificationGate,
} from '../runtime/governed-execution-canonical-adapters.mjs';

const actorContext = Object.freeze({ actor_id: 'agentos:overseer' });

function candidate(overrides = {}) {
  return {
    delivery_id: 'delivery:ps:1',
    request_id: 'request:ps:1',
    project_id: 'agentos-local',
    mission_id: 'mission:ps:1',
    task_id: 'task:ps:1',
    wake_trace_id: 'wake:ps:1',
    issuer: 'agentos:overseer',
    authority: { granted_capabilities: ['shell.powershell.dev.execute'] },
    required_capabilities: ['shell.powershell.dev.execute'],
    execution: { adapter: 'windows-powershell', operation: 'test.run', cwd: 'C:/agentos/AgentOS' },
    ...overrides,
  };
}

function executionResult(overrides = {}) {
  return {
    success: true,
    operation: 'test.run',
    cwd: 'C:\\agentos\\AgentOS',
    exit_code: 0,
    started_at: '2026-09-13T02:00:00.000Z',
    finished_at: '2026-09-13T02:00:01.000Z',
    duration_ms: 1000,
    stdout: 'ok\n',
    stderr: '',
    timed_out: false,
    truncated: false,
    resolved_executables: {
      pwsh: {
        path: 'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
        version: '7.5.2',
      },
    },
    ...overrides,
  };
}

async function buildBoundary({
  consentState = WORKER_CONSENT_STATES.PRE_AUTHORIZED,
  consentConfirmed = false,
  capabilityEligible = true,
  executionAuthorized = true,
  operation = 'test.run',
  riskLevel = null,
  approvalRequired = false,
  approveHuman = false,
  recordReceipt = async () => ({ persisted: true }),
  verify = async () => ({ passed: true, evidence: ['fixture:verification'] }),
} = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'agentos-governed-composition-'));
  const budget = await createMissionBudget({ filePath: join(dir, 'budget.sqlite') });
  const humanGate = createHumanGate();
  if (approveHuman) {
    humanGate.request({ missionId: 'mission:ps:1', reason: 'fixture A4 approval' });
    humanGate.resolve({ missionId: 'mission:ps:1', decision: 'approved' });
  }

  const riskClassifier = riskLevel == null
    ? classifyWindowsPowerShellOperationRisk
    : async () => ({
      level: riskLevel,
      approvalRequired,
      reason: `fixture risk ${riskLevel}`,
      evidence: ['fixture:risk'],
    });

  const boundary = createGovernedExecutionBoundary({
    context: createCanonicalContextGate({ canonicalContext: { missions: [{ id: 'mission:ps:1' }], decisions: [] } }),
    authority: createCanonicalAuthorityGate({
      authorityPolicy: createAuthorityPolicy({
        issuers: ['agentos:overseer'],
        capabilities: ['shell.powershell.dev.execute'],
      }),
    }),
    consent: createWorkerConsentGate({
      async resolveConsent() {
        return {
          state: consentState,
          confirmed: consentConfirmed,
          decision_id: 'consent:fixture:1',
          reason: 'deterministic integration fixture',
        };
      },
    }),
    capability: createCanonicalPowerShellCapabilityGate({
      hostIdentity: { host_id: 'host:fixture:win' },
      workspaceRoot: 'C:/agentos',
      runtimeExecutionEnabled: executionAuthorized,
      async evaluatePickup() {
        return {
          pickup_eligible: capabilityEligible,
          execution_authorized: executionAuthorized,
          disposition: capabilityEligible && executionAuthorized ? 'ELIGIBLE_FOR_BOUNDED_POWERSHELL_EXECUTION' : 'BLOCKED',
        };
      },
    }),
    policy: createCanonicalToolPolicyGate({ toolPolicy: createToolPolicy({ allow: ['test.run'] }) }),
    risk: createExecutionRiskPolicy({ classify: riskClassifier }),
    budget,
    approval: createCanonicalHumanApprovalGate({ humanGate }),
    receipts: createCanonicalPowerShellReceiptGate({
      hostId: 'host:fixture:win',
      workerId: 'agentos:windows-powershell-worker',
      codeIdentity: 'fixture:exact-head',
      createdAt: '2026-09-13T02:00:02.000Z',
      async resolveBudgetStatus({ reservation }) { return reservation.status; },
      recordReceipt,
    }),
    verification: createCanonicalVerificationGate({
      verificationRouter: {
        async selectVerifier() { return { id: 'verifier:fixture:independent' }; },
      },
      async runVerifier(input) { return verify(input); },
    }),
  });

  return {
    boundary,
    budget,
    dir,
    task: candidate({ execution: { adapter: 'windows-powershell', operation, cwd: 'C:/agentos/AgentOS' } }),
    async createClaimGuard() {
      const claims = await createRemoteDeliveryClaimStore({ root: join(dir, 'claims') });
      return {
        claims,
        guarded: createGovernedExecutionClaimGuard({
          boundary,
          claims,
          hostId: 'host:fixture:win',
        }),
      };
    },
    async cleanup() {
      budget.close();
      await rm(dir, { recursive: true, force: true });
    },
  };
}

test('full canonical composition verifies bounded PowerShell result with exact correlation', async () => {
  const fixture = await buildBoundary();
  let invokeCalls = 0;
  try {
    const outcome = await fixture.boundary.execute({
      actorContext,
      task: fixture.task,
      actualUnits: 1,
      async invoke({ task, capabilityEvaluation, riskDecision, reservation }) {
        invokeCalls += 1;
        assert.equal(task.task_id, 'task:ps:1');
        assert.equal(task.wake_trace_id, 'wake:ps:1');
        assert.equal(capabilityEvaluation.execution_authorized, true);
        assert.equal(riskDecision.level, 'A2');
        assert.deepEqual(riskDecision.evidence, [
          'policy:agentos-security-control-plane',
          'adapter:windows-powershell',
          'operation:test.run',
        ]);
        assert.equal(reservation.status, 'RESERVED');
        return executionResult();
      },
    });
    assert.equal(invokeCalls, 1);
    assert.equal(outcome.status, 'VERIFIED');
    assert.equal(outcome.receipt.status, 'AWAITING_GREEN');
    assert.equal(outcome.receipt.task_id, 'task:ps:1');
    assert.equal(outcome.receipt.delivery_id, 'delivery:ps:1');
    assert.equal(outcome.receipt.request_id, 'request:ps:1');
    assert.equal(outcome.receipt.wake_trace_id, 'wake:ps:1');
    assert.equal(outcome.verification.passed, true);
    assert.equal(outcome.verification.verifier_id, 'verifier:fixture:independent');
    assert.equal(outcome.budget.status, 'RECONCILED');
  } finally {
    await fixture.cleanup();
  }
});

test('claim guard blocks duplicate PowerShell delivery after one verified invocation', async () => {
  const fixture = await buildBoundary();
  let invokeCalls = 0;
  try {
    const { guarded } = await fixture.createClaimGuard();
    const first = await guarded.execute({
      actorContext,
      task: fixture.task,
      actualUnits: 1,
      async invoke() { invokeCalls += 1; return executionResult(); },
    });
    assert.equal(first.status, 'VERIFIED');
    assert.equal(invokeCalls, 1);

    await assert.rejects(
      guarded.execute({
        actorContext,
        task: fixture.task,
        actualUnits: 1,
        async invoke() { invokeCalls += 1; return executionResult(); },
      }),
      (error) => error?.code === 'GOVERNED_EXECUTION_DUPLICATE_DELIVERY',
    );
    assert.equal(invokeCalls, 1);
  } finally {
    await fixture.cleanup();
  }
});

test('receipt-loss after PowerShell side effect retains claim and blocks blind replay', async () => {
  const fixture = await buildBoundary({ recordReceipt: async () => null });
  let invokeCalls = 0;
  try {
    const { guarded, claims } = await fixture.createClaimGuard();
    await assert.rejects(
      guarded.execute({
        actorContext,
        task: fixture.task,
        actualUnits: 1,
        async invoke() { invokeCalls += 1; return executionResult(); },
      }),
      (error) => error?.code === 'EXECUTION_RECEIPT_PERSISTENCE_REQUIRED'
        && error?.claim_retained === true
        && error?.replay_safe_to_invoke === false,
    );
    assert.equal(invokeCalls, 1);
    assert.equal((await claims.get(fixture.task.delivery_id))?.state, 'CLAIMED');

    await assert.rejects(
      guarded.execute({
        actorContext,
        task: fixture.task,
        actualUnits: 1,
        async invoke() { invokeCalls += 1; return executionResult(); },
      }),
      (error) => error?.code === 'GOVERNED_EXECUTION_DUPLICATE_DELIVERY',
    );
    assert.equal(invokeCalls, 1);
  } finally {
    await fixture.cleanup();
  }
});

test('consent denial blocks before budget reservation and invoke', async () => {
  const fixture = await buildBoundary({ consentState: WORKER_CONSENT_STATES.PROHIBITED });
  let invokeCalls = 0;
  try {
    await assert.rejects(
      fixture.boundary.execute({ actorContext, task: fixture.task, async invoke() { invokeCalls += 1; return executionResult(); } }),
      (error) => error?.code === 'WORKER_CONSENT_PROHIBITED',
    );
    assert.equal(invokeCalls, 0);
  } finally {
    await fixture.cleanup();
  }
});

test('capability denial blocks before invoke', async () => {
  const fixture = await buildBoundary({ capabilityEligible: false, executionAuthorized: false });
  let invokeCalls = 0;
  try {
    await assert.rejects(
      fixture.boundary.execute({ actorContext, task: fixture.task, async invoke() { invokeCalls += 1; return executionResult(); } }),
      (error) => error?.code === 'POWERSHELL_CAPABILITY_NOT_ELIGIBLE',
    );
    assert.equal(invokeCalls, 0);
  } finally {
    await fixture.cleanup();
  }
});

test('tool policy denial blocks before risk, budget and invoke', async () => {
  const fixture = await buildBoundary({ operation: 'service.list' });
  let invokeCalls = 0;
  try {
    await assert.rejects(
      fixture.boundary.execute({ actorContext, task: fixture.task, async invoke() { invokeCalls += 1; return executionResult(); } }),
      (error) => error?.code === 'TOOL_POLICY_DENIED',
    );
    assert.equal(invokeCalls, 0);
  } finally {
    await fixture.cleanup();
  }
});

test('A4 risk requires explicit human approval before invoke', async () => {
  const denied = await buildBoundary({ riskLevel: 'A4', approvalRequired: true, approveHuman: false });
  let deniedInvokes = 0;
  try {
    await assert.rejects(
      denied.boundary.execute({ actorContext, task: denied.task, async invoke() { deniedInvokes += 1; return executionResult(); } }),
      (error) => error?.code === 'HUMAN_APPROVAL_RECORD_REQUIRED',
    );
    assert.equal(deniedInvokes, 0);
  } finally {
    await denied.cleanup();
  }

  const approved = await buildBoundary({ riskLevel: 'A4', approvalRequired: true, approveHuman: true });
  let approvedInvokes = 0;
  try {
    const outcome = await approved.boundary.execute({ actorContext, task: approved.task, async invoke() { approvedInvokes += 1; return executionResult(); } });
    assert.equal(approvedInvokes, 1);
    assert.equal(outcome.status, 'VERIFIED');
    assert.equal(outcome.risk.level, 'A4');
    assert.equal(outcome.risk.approvalRequired, true);
  } finally {
    await approved.cleanup();
  }
});

test('receipt persistence failure occurs after side effect but can never return VERIFIED', async () => {
  const fixture = await buildBoundary({ recordReceipt: async () => null });
  let invokeCalls = 0;
  try {
    await assert.rejects(
      fixture.boundary.execute({ actorContext, task: fixture.task, actualUnits: 1, async invoke() { invokeCalls += 1; return executionResult(); } }),
      (error) => error?.code === 'EXECUTION_RECEIPT_PERSISTENCE_REQUIRED',
    );
    assert.equal(invokeCalls, 1);
  } finally {
    await fixture.cleanup();
  }
});

test('verification failure after side effect can never return VERIFIED', async () => {
  const fixture = await buildBoundary({ verify: async () => ({ passed: false, evidence: ['fixture:rejected'] }) });
  let invokeCalls = 0;
  try {
    await assert.rejects(
      fixture.boundary.execute({ actorContext, task: fixture.task, actualUnits: 1, async invoke() { invokeCalls += 1; return executionResult(); } }),
      (error) => error?.code === 'EXECUTION_VERIFICATION_FAILED' && error?.receipt?.status === 'AWAITING_GREEN',
    );
    assert.equal(invokeCalls, 1);
  } finally {
    await fixture.cleanup();
  }
});
