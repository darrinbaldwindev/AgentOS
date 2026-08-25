import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFilePersistence } from '../runtime/file-persistence.mjs';

test('file persistence survives adapter restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agentos-'));
  const filePath = join(dir, 'state.json');
  try {
    const first = createFilePersistence({ filePath });
    const agent = await first.create('agent', { id: 'agentos:restart-test', status: 'online' });
    await first.create('event', { agentId: agent.id, eventType: 'test.created' });

    const second = createFilePersistence({ filePath });
    const restoredAgent = await second.get('agent', agent.id);
    const events = await second.list('event');

    assert.deepEqual(restoredAgent, agent);
    assert.equal(events.length, 1);
    assert.equal(events[0].eventType, 'test.created');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
