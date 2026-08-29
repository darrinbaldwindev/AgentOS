import test from 'node:test';
import assert from 'node:assert/strict';
import { decideVerification } from '../src/dispatch/verification-policy.mjs';

test('high risk requires verification', () => {
  const result = decideVerification({ task: { risk: 'high', quality: { required: 0.9 } }, result: { quality: 0.99, confidence: 0.99 } });
  assert.equal(result.needsReview, true);
  assert.equal(result.reason, 'high_risk');
});

test('low quality or confidence triggers verification', () => {
  assert.equal(decideVerification({ task: { quality: { required: 0.9 } }, result: { quality: 0.85, confidence: 0.95 } }).needsReview, true);
  assert.equal(decideVerification({ task: { quality: { required: 0.9 } }, result: { quality: 0.95, confidence: 0.6 } }).needsReview, true);
});

test('strong normal result does not require review', () => {
  const result = decideVerification({ task: { quality: { required: 0.9 } }, result: { quality: 0.95, confidence: 0.95 } });
  assert.equal(result.needsReview, false);
});
