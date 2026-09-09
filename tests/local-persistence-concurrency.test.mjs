import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
import { createLocalDispatchStore } from '../runtime/local-dispatch-store.mjs';
test('independent state handles preserve every concurrent write and reject stale CAS', async (t) => {
  const root = await fs.mkdtemp(join(tmpdir(), 'state-concurrent-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const filePath = join(root, 'state.json');
  const stores = await Promise.all(Array.from({ length: 12 }, () => createLocalPersistence({ filePath })));
  await Promise.all(stores.map((s, i) => s.create('event', { id: `writer-${i}` })));
  assert.equal((await stores[0].list('event')).length, 12);
  await stores[0].create('artifact', { id: 'task', artifactType: 'dispatch.task', payload: { task_id: 'task', status: 'queued' } });
  const adapters = stores.map(createLocalDispatchStore);
  const task = (await adapters[0].list())[0];
  const writes = await Promise.all(adapters.map((a) => a.writeTask({ ...task, status: 'claimed' }, task.dispatch_sha)));
  assert.equal(writes.filter((w) => w.written).length, 1);
  assert.equal(writes.filter((w) => w.reason === 'version_conflict').length, 11);
});
test('failed atomic batch is not visible to a later successful write', async (t) => {
  const root = await fs.mkdtemp(join(tmpdir(), 'state-batch-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const store = await createLocalPersistence({ filePath: join(root, 'state.json') });
  await assert.rejects(store.createMany([
    { type: 'artifact', input: { id: 'duplicate' } },
    { type: 'artifact', input: { id: 'duplicate' } },
  ]), /Duplicate/);
  await store.create('event', { id: 'later' });
  assert.equal((await store.list('artifact')).length, 0);
});
test('abandoned state lock is not stolen', async (t) => {
  const root = await fs.mkdtemp(join(tmpdir(), 'state-lock-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const filePath = join(root, 'state.json');
  const store = await createLocalPersistence({ filePath });
  await fs.mkdir(`${filePath}.lock`);
  await assert.rejects(store.create('event', { id: 'unsafe' }), /LOCAL_STATE_LOCK_RECOVERY_REQUIRED/);
  assert.equal((await store.list('event')).length, 0);
  assert.ok((await fs.stat(`${filePath}.lock`)).isDirectory());
});
