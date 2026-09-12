import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdapterRegistry } from '../src/workers/adapter-registry.mjs';
import { createAdapterContext, executeAdapter, inspectAdapter } from '../src/workers/adapter-contract.mjs';
import { createConnectionState } from '../src/workers/connection-state.mjs';

function mockAdapter() {
  return {
    async discover() { return { available: true }; },
    async healthCheck() { return { healthy: true }; },
    async capabilities() { return ['research']; },
    async execute(task) { return { ok: true, task }; },
  };
}

test('adapter lifecycle is inspectable', async () => {
  const context = createAdapterContext({ workerId: 'test:worker' });
  const result = await inspectAdapter(mockAdapter(), context);
  assert.deepEqual(result.capabilities, ['research']);
  assert.equal(result.health.healthy, true);
});

test('adapter execution delegates an approved task', async () => {
  const result = await executeAdapter(mockAdapter(), { id: 'task-1' }, createAdapterContext({ workerId: 'test:worker' }));
  assert.equal(result.ok, true);
  assert.equal(result.task.id, 'task-1');
});

test('registry rejects adapters missing lifecycle methods', () => {
  const registry = createAdapterRegistry();
  assert.throws(() => registry.register('bad', {}), /must implement discover/);
});

test('registry prevents duplicate worker adapters', () => {
  const registry = createAdapterRegistry();
  registry.register('test:worker', mockAdapter());
  assert.throws(() => registry.register('test:worker', mockAdapter()), /already registered/);
});

test('connection state rejects unknown states', () => {
  assert.throws(() => createConnectionState('test:worker', { state: 'wat' }), /invalid connection state/);
});
