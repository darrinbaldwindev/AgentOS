import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
import { bootAgentOS } from '../runtime/agentos-boot.mjs';
import { OVERSEER_ID } from '../runtime/overseer-bootstrap.mjs';
import { promises as fs } from 'node:fs';

for (const operation of ['writeFile', 'rename']) {
  test(`failed ${operation} preserves records and generated IDs until durable success`, async t => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-persistence-failure-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    const filePath = join(root, 'state.json');
    const persistence = await createLocalPersistence({ filePath });
    const initial = await persistence.create('artifact', { status: 'paused' });
    const before = await fs.readFile(filePath, 'utf8');
    const failure = Object.assign(new Error(`injected ${operation} failure`), { code: 'EIO' });
    const original = fs[operation];
    const fault = t.mock.method(fs, operation, async (path, ...args) => {
      if (path === `${filePath}.tmp-${process.pid}`) throw failure;
      return original(path, ...args);
    });
    await assert.rejects(persistence.create('artifact', { status: 'new' }), error => error === failure);
    await assert.rejects(persistence.update('artifact', initial.id, { status: 'ready' }), error => error === failure);
    assert.deepEqual(await persistence.list('artifact'), [initial]);
    assert.equal(await fs.readFile(filePath, 'utf8'), before);
    assert.deepEqual(await (await createLocalPersistence({ filePath })).get('artifact', initial.id), initial);
    fault.mock.restore();
    const next = await persistence.create('artifact', { status: 'new' });
    assert.equal(next.id, 'artifact_2');
    await persistence.update('artifact', initial.id, { status: 'ready' });
    const reopened = await createLocalPersistence({ filePath });
    assert.deepEqual(await reopened.list('artifact'), await persistence.list('artifact'));
  });
}

test('concurrent durable mutations retain all records and unique sequence IDs', async t => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-persistence-concurrent-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const filePath = join(root, 'state.json');
  const persistence = await createLocalPersistence({ filePath });
  const records = await Promise.all(Array.from({ length: 5 }, () => persistence.create('artifact')));
  assert.equal(new Set(records.map(record => record.id)).size, 5);
  await Promise.all(records.map(record => persistence.update('artifact', record.id, { status: 'saved' })));
  const reopened = await createLocalPersistence({ filePath });
  assert.equal((await reopened.list('artifact')).length, 5);
  assert.ok((await reopened.list('artifact')).every(record => record.status === 'saved'));
});

test('local persistence survives reopening and boot reuses the Overseer', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-persistence-test-'));
  const filePath = join(root, 'state', 'agentos-runtime.json');
  const makeDeps = (persistence) => ({
    persistence,
    continuityCheck: async () => ({ ok: true }),
    capabilityProbe: { probe: async () => ({ evaluation: { eligible: true } }) },
    modelRegistry: { listAvailable: async () => [] },
    now: () => '2026-09-02T00:00:00.000Z',
  });

  const first = await createLocalPersistence({ filePath });
  const boot1 = await bootAgentOS(makeDeps(first));
  assert.equal(boot1.status, 'online');
  assert.equal(boot1.overseer.id, OVERSEER_ID);
  assert.equal(boot1.overseer.status, 'online');

  const second = await createLocalPersistence({ filePath });
  const boot2 = await bootAgentOS(makeDeps(second));
  assert.equal(boot2.status, 'online');
  assert.equal(boot2.overseer.id, OVERSEER_ID);
  assert.equal((await second.list('agent')).length, 1);
  assert.equal((await second.list('event')).filter((e) => e.eventType === 'agentos.boot.completed').length, 2);
});

test('local persistence fails closed on invalid state schema', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-persistence-invalid-'));
  const filePath = join(root, 'state', 'agentos-runtime.json');
  const { writeFile, mkdir } = await import('node:fs/promises');
  await mkdir(join(root, 'state'), { recursive: true });
  await writeFile(filePath, JSON.stringify({ schemaVersion: 999, records: {} }));
  await assert.rejects(() => createLocalPersistence({ filePath }), /LOCAL_STATE_SCHEMA_INVALID/);
});
