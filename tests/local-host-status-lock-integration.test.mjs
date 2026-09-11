import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readLocalHostStatus } from '../runtime/local-host-status.mjs';

const observedAt = '2026-09-11T00:30:00.000Z';
const fresh = '2026-09-11T00:29:30.000Z';

function emptyPersistence() {
  return {
    async list() { return []; },
  };
}

test('canonical host-status read observes retained Basic Chat lock as recovery_required without mutation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-status-lock-integration-'));
  try {
    const path = join(root, 'basic-chat.lock');
    const payload = JSON.stringify({ pid: 999999, startedAt: '2020-01-01T00:00:00.000Z' });
    await writeFile(path, payload, 'utf8');

    const status = await readLocalHostStatus({
      persistence: emptyPersistence(),
      hostIdentity: { host_id: 'host-a', last_seen: fresh },
      config: { scheduler: { enabled: false } },
      root,
      processAlive: () => false,
      observedAt,
    });

    assert.equal(status.lifecycle_state, 'recovery_required');
    assert.equal(status.reason, 'BASIC_CHAT_LOCK_RECOVERY_REQUIRED');
    assert.equal(await readFile(path, 'utf8'), payload);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('canonical host-status read with no Basic Chat lock preserves ordinary idle derivation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-status-lock-integration-'));
  try {
    const status = await readLocalHostStatus({
      persistence: emptyPersistence(),
      hostIdentity: { host_id: 'host-a', last_seen: fresh },
      config: { scheduler: { enabled: false } },
      root,
      processAlive: () => false,
      observedAt,
    });

    assert.equal(status.lifecycle_state, 'idle');
    assert.equal(status.reason, 'FRESH_HOST_EVIDENCE_WITH_NO_ACTIVE_TASK');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
