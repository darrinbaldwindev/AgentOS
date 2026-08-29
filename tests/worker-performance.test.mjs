import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkerPerformanceStore } from '../src/dispatch/worker-performance.mjs';

test('tracks observed quality cost latency success and retries', () => {
  const store = createWorkerPerformanceStore();
  store.record({ workerId: 'chatgpt', quality: 0.95, confidence: 0.9, cost: 0.04, latencyMs: 800, retries: 0, success: true });
  store.record({ workerId: 'chatgpt', quality: 0.85, confidence: 0.8, cost: 0.02, latencyMs: 1200, retries: 1, success: false });
  const summary = store.summary('chatgpt');
  assert.equal(summary.runs, 2);
  assert.equal(summary.successRate, 0.5);
  assert.equal(summary.averageQuality, 0.9);
  assert.equal(summary.averageCost, 0.03);
  assert.equal(summary.averageLatencyMs, 1000);
  assert.equal(summary.averageRetries, 0.5);
});
