import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRecoveryDecision, evaluateRecovery } from '../src/dispatch/recovery.mjs';

test('recovery retries while budget remains', () => {
  assert.deepEqual(evaluateRecovery({ health: { consecutive_errors: 1 }, attempts: 0, maxAttempts: 2 }), { action: 'retry', reason: 'recovery_budget_available', attempts: 1 });
});

test('recovery escalates after budget exhaustion', () => {
  assert.deepEqual(evaluateRecovery({ health: { consecutive_errors: 3 }, attempts: 2, maxAttempts: 2 }), { action: 'escalate', reason: 'recovery_budget_exhausted', attempts: 2 });
});

test('escalation pauses through authoritative control', () => {
  let action;
  const control = {};
  const next = applyRecoveryDecision({ control, decision: { action: 'escalate' }, applyControl: (value, requested) => { action = requested; return { ...value, paused: true }; } });
  assert.equal(action, 'pause');
  assert.equal(next.paused, true);
});
