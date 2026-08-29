import test from 'node:test';
import assert from 'node:assert/strict';
import { decideEscalation } from '../runtime/overseer-escalation.mjs';

test('resolved consensus delivers without escalation', () => {
  assert.deepEqual(decideEscalation({ consensus: { decision: 'accept' } }), { action: 'deliver', reason: 'consensus_resolved' });
});

test('high risk unresolved disagreement requires human review', () => {
  assert.deepEqual(decideEscalation({ consensus: { decision: 'escalate' }, task: { risk: 'high' } }), { action: 'human_review', reason: 'high_risk_unresolved' });
});

test('budget exhaustion prevents further review spending', () => {
  assert.deepEqual(decideEscalation({ consensus: { decision: 'escalate' }, budget: { remainingCost: 0 } }), { action: 'defer', reason: 'budget_exhausted' });
});
