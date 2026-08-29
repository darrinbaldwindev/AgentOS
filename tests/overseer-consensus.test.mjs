import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDisagreement } from '../runtime/overseer-consensus.mjs';

test('agreed high-quality results are accepted', () => {
  const r = resolveDisagreement({ original: { decision: 'yes', quality: 0.96, confidence: 0.95 }, verification: { decision: 'yes', quality: 0.94, confidence: 0.93 }, task: {} });
  assert.equal(r.decision, 'accept');
});

test('qualified verification can override a weaker original', () => {
  const r = resolveDisagreement({ original: { decision: 'no', quality: 0.7, confidence: 0.6 }, verification: { decision: 'yes', quality: 0.96, confidence: 0.95 }, task: {} });
  assert.equal(r.decision, 'accept_verification');
});

test('unresolved disagreement escalates', () => {
  const r = resolveDisagreement({ original: { decision: 'yes', quality: 0.91, confidence: 0.81 }, verification: { decision: 'no', quality: 0.89, confidence: 0.82 }, task: {} });
  assert.equal(r.decision, 'escalate');
});
