import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeObservedPerformance, shouldUseObservation } from '../src/dispatch/adaptive-worker-profile.mjs';

function approx(actual, expected, epsilon = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} is not approximately ${expected}`);
}

test('blends observed performance without replacing profile abruptly', () => {
  const result = mergeObservedPerformance(
    { estimated_cost: 0.10, estimated_latency_ms: 1000, quality: { floor: 0.9, confidence: 0.9 } },
    { cost: 0.02, latencyMs: 200, quality: 0.96, confidence: 0.95 },
    0.25,
  );
  approx(result.estimated_cost, 0.08);
  assert.equal(result.estimated_latency_ms, 800);
  approx(result.quality.floor, 0.915);
});

test('does not trust observations below the task quality floor', () => {
  assert.equal(shouldUseObservation({ observedQuality: 0.89, requiredQuality: 0.9, confidence: 0.99 }), false);
  assert.equal(shouldUseObservation({ observedQuality: 0.95, requiredQuality: 0.9, confidence: 0.9 }), true);
});
