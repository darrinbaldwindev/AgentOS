import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { createLocalChat } from '../runtime/local-chat.mjs';

test('Basic Chat snapshot exposes bounded canonical Jobs without private objective data', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-chat-jobs-'));
  await installLocal({ root });
  const chat = await createLocalChat({ root });
  try {
    const snapshot = await chat.send('private objective that must not appear in jobs');
    assert.ok(Array.isArray(snapshot.jobs));
    assert.ok(snapshot.jobs.length >= 1 && snapshot.jobs.length <= 5);
    assert.equal(snapshot.jobs[0].taskId, snapshot.lastTaskId);
    assert.equal(snapshot.jobs[0].missionId, `mission:${snapshot.lastTaskId}`);
    assert.deepEqual(Object.keys(snapshot.jobs[0]).sort(), ['createdAt', 'missionId', 'priority', 'schemaVersion', 'status', 'taskId', 'updatedAt'].sort());
    assert.doesNotMatch(JSON.stringify(snapshot.jobs), /private objective that must not appear in jobs/i);
  } finally {
    await chat.close();
    await rm(root, { recursive: true, force: true });
  }
});
