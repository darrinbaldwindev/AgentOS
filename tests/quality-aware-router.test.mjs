import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseQualityAwareWorker } from '../src/dispatch/quality-aware-router.mjs';

const workers = [
  { id: 'cheap', capabilities: ['research'], quality: { floor: 0.8 }, estimated_cost: 0.01, estimated_latency_ms: 1000 },
  { id: 'premium', capabilities: ['research'], quality: { floor: 0.95 }, estimated_cost: 0.10, estimated_latency_ms: 1500 },
  { id: 'fast', capabilities: ['research'], quality: { floor: 0.95 }, estimated_cost: 0.12, estimated_latency_ms: 300 },
];

test('quality floor excludes insufficient workers before cost optimisation', () => {
  const result = chooseQualityAwareWorker({ workers, task: { capabilities: ['research'], quality: { required: 0.9 }, preference: 'cost' } });
  assert.equal(result.worker.id, 'premium');
});

test('speed preference selects fastest worker among quality-qualified options', () => {
  const result = chooseQualityAwareWorker({ workers, task: { capabilities: ['research'], quality: { required: 0.9 }, preference: 'speed' } });
  assert.equal(result.worker.id, 'fast');
});

test('reports when required quality is unavailable', () => {
  const result = chooseQualityAwareWorker({ workers, task: { capabilities: ['research'], quality: { required: 0.99 } } });
  assert.equal(result.worker, null);
  assert.equal(result.reason, 'quality_or_capability_unavailable');
});
