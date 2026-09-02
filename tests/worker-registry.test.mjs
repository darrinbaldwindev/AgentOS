import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkerRegistry } from '../src/dispatch/worker-registry.mjs';

test('strict matching selects an enabled executable worker with all capabilities', async () => {
  const registry = createWorkerRegistry();
  registry.register({ id: 'worker:full-match', name: 'Full Match', capabilities: ['repository:read', 'general'], execute: async () => ({ ok: true }) });

  const selected = registry.findMatching({ requiredCapabilities: ['repository:read', 'general'] });
  assert.equal(selected.id, 'worker:full-match');
  const result = await selected.execute({ message: 'ok' });
  assert.equal(result.workerId, 'worker:full-match');
  assert.equal(result.success, true);
});

test('strict matching rejects partial capability matches', () => {
  const registry = createWorkerRegistry();
  registry.register({ id: 'worker:partial', name: 'Partial', capabilities: ['repository:read'], execute: async () => ({ ok: true }) });
  assert.equal(registry.findMatching({ requiredCapabilities: ['repository:read', 'general'] }), null);
});

test('strict matching rejects disabled workers', () => {
  const registry = createWorkerRegistry();
  registry.register({ id: 'worker:disabled', name: 'Disabled', capabilities: ['repository:read'], enabled: false, execute: async () => ({ ok: true }) });
  assert.equal(registry.findMatching({ requiredCapabilities: ['repository:read'] }), null);
});

test('strict matching rejects non-executable workers', () => {
  const registry = createWorkerRegistry();
  assert.throws(() => registry.register({ id: 'worker:catalog-only', name: 'Catalog Only', capabilities: ['repository:read'] }), /worker requires execute/);
});

test('strict matching can constrain selection to a worker id', () => {
  const registry = createWorkerRegistry();
  registry.register({ id: 'worker:a', name: 'A', capabilities: ['repository:read'], execute: async () => 'a' });
  registry.register({ id: 'worker:b', name: 'B', capabilities: ['repository:read'], execute: async () => 'b' });
  assert.equal(registry.findMatching({ requiredCapabilities: ['repository:read'], workerId: 'worker:b' }).id, 'worker:b');
});
