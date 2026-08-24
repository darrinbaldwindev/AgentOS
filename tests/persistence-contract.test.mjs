import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createPersistenceBridge } from '../runtime/persistence-bridge.mjs';

test('canonical persistence bridge exposes one durable-state vocabulary', async () => {
  const persistence = createPersistenceBridge(createStateStore());
  const agent = await persistence.create('agent', { id: 'agentos:test', role: 'test' });
  assert.equal((await persistence.get('agent', agent.id)).id, agent.id);
  assert.equal((await persistence.list('agent')).length, 1);
  const updated = await persistence.update('agent', agent.id, { status: 'online' });
  assert.equal(updated.status, 'online');
});
