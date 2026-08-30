import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdaptiveOverseerLoop } from '../runtime/overseer-decision-loop-adaptive.mjs';
import { createWorkerPerformanceStore } from '../src/dispatch/worker-performance.mjs';

function approx(actual, expected, epsilon = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} is not approximately ${expected}`);
}

test('execution observations update the local worker profile', async () => {
  const performanceStore = createWorkerPerformanceStore();
  const loop = createAdaptiveOverseerLoop({
    workers: [{ id: 'chatgpt', capabilities: ['research'], quality: { floor: 0.9, confidence: 0.9 }, estimated_cost: 0.1, estimated_latency_ms: 1000 }],
    router: { select: async ({ workers }) => ({ selected: workers[0], reason: 'selected' }) },
    execute: async () => ({ output: 'ok' }),
    observe: async () => ({ quality: 0.96, confidence: 0.95, cost: 0.03, latencyMs: 400, tokens: 900, retries: 0, success: true }),
    performanceStore,
  });
  await loop.run({ task: { capabilities: ['research'] }, message: 'test' });
  assert.equal(performanceStore.summary('chatgpt').runs, 1);
  approx(loop.profiles.get('chatgpt').estimated_cost, 0.0825);
  assert.equal(loop.profiles.get('chatgpt').estimated_latency_ms, 850);
});
