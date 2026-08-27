import test from 'node:test';
import assert from 'node:assert/strict';
import { createVersionedStore } from '../src/dispatch/versioned-store.mjs';

test('claim succeeds only when the repository version still matches', async () => {
  let current = { task_id: 'v-001', status: 'queued', sha: 'sha-1' };
  const store = createVersionedStore({
    readVersioned: async () => current,
    writeIfUnchanged: async (id, expectedSha, next) => {
      if (current.sha !== expectedSha) return { written: false, reason: 'version_conflict' };
      current = { ...next, sha: 'sha-2' };
      return { written: true, task: current };
    },
  });
  const result = await store.claimTask(current, { ...current, status: 'claimed' });
  assert.equal(result.written, true);
  assert.equal(current.status, 'claimed');
});

test('stale worker claim is rejected after another writer changes the version', async () => {
  let current = { task_id: 'v-002', status: 'queued', sha: 'sha-1' };
  const store = createVersionedStore({
    readVersioned: async () => current,
    writeIfUnchanged: async (id, expectedSha, next) => {
      if (current.sha !== expectedSha) return { written: false, reason: 'version_conflict', current };
      current = { ...next, sha: 'sha-2' };
      return { written: true, task: current };
    },
  });
  const workerRead = { ...current };
  current = { ...current, status: 'claimed-by-other', sha: 'sha-other' };
  const result = await store.claimTask(workerRead, { ...workerRead, status: 'claimed' });
  assert.equal(result.claimed, false);
  assert.equal(result.reason, 'version_conflict');
});
