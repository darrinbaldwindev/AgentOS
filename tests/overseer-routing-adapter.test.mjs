import test from 'node:test';
import assert from 'node:assert/strict';
import { createOverseerRoutingAdapter } from '../runtime/overseer-routing-adapter.mjs';

const workers = [
  { id: 'cheap', name: 'Cheap', capabilities: ['research'], quality: { floor: 0.8 }, estimated_cost: 0.01, estimated_latency_ms: 500 },
  { id: 'capable', name: 'Capable', capabilities: ['research'], quality: { floor: 0.95 }, estimated_cost: 0.05, estimated_latency_ms: 1000 },
  { id: 'fast', name: 'Fast', capabilities: ['research'], quality: { floor: 0.95 }, estimated_cost: 0.08, estimated_latency_ms: 100 },
];

test('adapter satisfies Overseer router contract and preserves quality floor', async () => {
  const router = createOverseerRoutingAdapter({ workers });
  const result = await router.select({ task: { capabilities: ['research'], quality: { required: 0.9 }, preference: 'cost' } });
  assert.equal(result.selected.id, 'capable');
});

test('adapter honours speed preference after quality gate', async () => {
  const router = createOverseerRoutingAdapter({ workers });
  const result = await router.select({ task: { capabilities: ['research'], quality: { required: 0.9 }, preference: 'speed' } });
  assert.equal(result.selected.id, 'fast');
});
