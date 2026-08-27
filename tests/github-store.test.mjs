import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepositoryDispatchAdapter, serialiseTask, taskFingerprint, taskPath } from '../src/dispatch/github-store.mjs';

test('repository adapter maps task IDs to durable dispatch paths', async () => {
  assert.equal(taskPath('abc-123'), '.agentos/dispatch/tasks/abc-123.json');
  const task = { task_id: 'abc-123', status: 'queued' };
  const calls = [];
  const adapter = createRepositoryDispatchAdapter({
    read: async path => ({ path }),
    write: async (path, content, metadata) => { calls.push({ path, content, metadata }); return 'ok'; },
  });
  assert.deepEqual(await adapter.readTask('abc-123'), { path: '.agentos/dispatch/tasks/abc-123.json' });
  assert.equal(await adapter.writeTask(task), 'ok');
  assert.equal(calls[0].path, taskPath(task.task_id));
  assert.equal(calls[0].content, serialiseTask(task));
  assert.equal(calls[0].metadata.fingerprint, taskFingerprint(task));
});

test('serialisation and fingerprint are deterministic', () => {
  const task = { task_id: 'abc-123', status: 'queued' };
  assert.equal(serialiseTask(task), '{\n  "task_id": "abc-123",\n  "status": "queued"\n}\n');
  assert.equal(taskFingerprint(task), taskFingerprint({ task_id: 'abc-123', status: 'queued' }));
});
