import test from 'node:test';
import assert from 'node:assert/strict';

import { createGovernedExecutionBoundary } from '../runtime/governed-execution-boundary.mjs';

test('governed execution VERIFIED result is explicitly scoped below Green/PRS completion', async () => {
  const boundary = createGovernedExecutionBoundary({
    context: { assertValid: async () => undefined },
    authority: { assertAllowed: async () => undefined },
    consent: { assertAllowed: async () => undefined },
    capability: { assertExecutionEligible: async () => ({ eligible: true }) },
    policy: { assertAllowed: async () => undefined },
    risk: { evaluate: async () => ({ level: 'A0', approvalRequired: false, reason: 'test' }) },
    budget: {
      reserve: async () => ({ reservation_id: 'reservation-1' }),
      reconcile: async () => ({ status: 'RECONCILED' }),
    },
    approval: { assertApproved: async () => { throw new Error('approval should not be called'); } },
    receipts: { record: async () => ({ receipt_id: 'receipt-1' }) },
    verification: { verify: async () => ({ passed: true }) },
  });

  const result = await boundary.execute({
    actorContext: { actor_id: 'worker-1' },
    task: { project_id: 'AgentOS', mission_id: 'level2-scope-test' },
    invoke: async () => ({ success: true }),
  });

  assert.equal(result.status, 'VERIFIED');
  assert.equal(result.verification_scope, 'execution-boundary');
  assert.equal(result.assurance_complete, false);
  assert.equal(result.completion_eligible, false);
  assert.equal(result.verification.passed, true);
});
