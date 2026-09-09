import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadOrCreateRemoteHostIdentity } from '../runtime/remote-host-identity.mjs';

async function tempIdentityPath() {
  const root = await mkdtemp(join(tmpdir(), 'agentos-host-id-'));
  return join(root, 'remote-host-identity.json');
}

test('creates one deterministic-shaped host identity and persists it', async () => {
  const filePath = await tempIdentityPath();
  const first = await loadOrCreateRemoteHostIdentity({
    filePath,
    now: () => new Date('2026-09-09T10:00:00.000Z'),
    randomId: () => 'fixture-001',
  });
  assert.deepEqual(first, {
    schema_version: 1,
    host_id: 'host-fixture-001',
    created_at: '2026-09-09T10:00:00.000Z',
  });
  const persisted = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(persisted, first);
});

test('reuses exact host identity across later process-shaped loads', async () => {
  const filePath = await tempIdentityPath();
  const first = await loadOrCreateRemoteHostIdentity({
    filePath,
    randomId: () => 'original',
  });
  const second = await loadOrCreateRemoteHostIdentity({
    filePath,
    randomId: () => 'should-not-be-used',
  });
  assert.equal(second.host_id, first.host_id);
  assert.equal(second.created_at, first.created_at);
});

test('concurrent first startup converges on one persisted host identity', async () => {
  const filePath = await tempIdentityPath();
  let sequence = 0;
  const results = await Promise.all(Array.from({ length: 12 }, () => loadOrCreateRemoteHostIdentity({
    filePath,
    randomId: () => `candidate-${++sequence}`,
  })));
  const ids = new Set(results.map((item) => item.host_id));
  assert.equal(ids.size, 1);
  const persisted = JSON.parse(await readFile(filePath, 'utf8'));
  assert.equal(ids.has(persisted.host_id), true);
});

test('invalid existing identity fails closed rather than silently replacing it', async () => {
  const filePath = await tempIdentityPath();
  await writeFile(filePath, JSON.stringify({ schema_version: 1, host_id: '', created_at: 'bad' }));
  await assert.rejects(
    () => loadOrCreateRemoteHostIdentity({ filePath, randomId: () => 'replacement' }),
    /host_id is required/,
  );
});
