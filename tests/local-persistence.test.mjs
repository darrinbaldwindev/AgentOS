import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
import { bootAgentOS } from '../runtime/agentos-boot.mjs';
import { OVERSEER_ID } from '../runtime/overseer-bootstrap.mjs';

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
