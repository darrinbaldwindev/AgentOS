import test from 'node:test';
import assert from 'node:assert/strict';

import { createGovernedExecutionBoundary } from '../runtime/governed-execution-boundary.mjs';

function boundaryWithVerification(verificationResult, counters = {}) {
  counters.reconcileCalls = 0;
  return createGovernedExecutionBoundary({
    context: { assertValid: async () => undefined },
    authority: { assertAllowed: async () => undefined },
    consent: { assertAllowed: async () => undefined },
    capability: { assertExecutionEligible: async () => ({ eligible: true }) },
    policy: { assertAllowed: async () => undefined },
    risk: { evaluate: async () => ({ level: 'A0', approvalRequired: false, reason: 'test' }) },
    budget: {
      reserve: async () => ({ reservation_id: 'reservation-1' }),
      reconcile: async () => { counters.reconcileCalls += 1; return { status: 'RECONCILED' }; },
    },
    approval: { assertApproved: async () => { throw new Error('approval should not be called'); } },
    receipts: { record: async () => ({ receipt_id: 'receipt-1' }) },
    verification: { verify: async () => verificationResult },
  });
}

const invocation = Object.freeze({
  actorContext: { actor_id: 'worker-1' },
  task: { project_id: 'AgentOS', mission_id: 'level2-scope-test' },
  invoke: async () => ({ success: true }),
});

test('governed execution VERIFIED result is explicitly scoped below Green/PRS completion', async () => {
  const boundary = boundaryWithVerification({ passed: true });
  const result = await boundary.execute(invocation);

  assert.equal(result.status, 'VERIFIED');
  assert.equal(result.verification_scope, 'execution-boundary');
  assert.equal(result.assurance_complete, false);
  assert.equal(result.completion_eligible, false);
  assert.equal(result.verification.passed, true);
});

test('execution verifier cannot escalate itself into Green/PRS assurance or completion eligibility', async () => {
  for (const verificationResult of [
    { passed: true, assurance_complete: true, completion_eligible: false },
    { passed: true, assurance_complete: false, completion_eligible: true },
    { passed: true, assurance_complete: true, completion_eligible: true },
  ]) {
    const counters = {};
    const boundary = boundaryWithVerification(verificationResult, counters);
    await assert.rejects(
      boundary.execute(invocation),
      (error) => error?.code === 'EXECUTION_VERIFICATION_SCOPE_ESCALATION' && error?.verification === verificationResult,
    );
    assert.equal(counters.reconcileCalls, 1);
  }
});
