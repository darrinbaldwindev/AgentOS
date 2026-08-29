import test from 'node:test';
import assert from 'node:assert/strict';
import { meetsQuality, normaliseIntelligenceProfile } from '../src/dispatch/intelligence-profile.mjs';

test('normalises worker profile and capabilities', () => {
  const worker = normaliseIntelligenceProfile({ id: 'chatgpt', capabilities: ['research', 'research'], quality: { floor: 0.95 }, estimated_cost: 0.02 });
  assert.deepEqual(worker.capabilities, ['research']);
  assert.equal(worker.quality.floor, 0.95);
  assert.equal(worker.estimated_cost, 0.02);
});

test('quality floor is independent of cost and latency', () => {
  const cheap = normaliseIntelligenceProfile({ quality: { floor: 0.9 }, estimated_cost: 0.01, estimated_latency_ms: 5000 });
  const expensive = normaliseIntelligenceProfile({ quality: { floor: 0.98 }, estimated_cost: 0.2, estimated_latency_ms: 1000 });
  assert.equal(meetsQuality(cheap, 0.9), true);
  assert.equal(meetsQuality(cheap, 0.95), false);
  assert.equal(meetsQuality(expensive, 0.95), true);
});
