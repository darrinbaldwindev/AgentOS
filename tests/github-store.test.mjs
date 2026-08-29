import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPath, createRepositoryDispatchAdapter, serialiseTask, taskFingerprint, taskPath } from '../src/dispatch/github-store.mjs';

test('repository adapter maps task IDs to durable dispatch paths and forwards expected versions', async () => {
  assert.equal(taskPath('abc-123'), '.agentos/dispatch/tasks/abc-123.json');
  const task = { task_id: 'abc-123', status: 'queued' };
  const calls = [];
  const adapter = createRepositoryDispatchAdapter({
    read: async path => ({ path }),
    write: async (path, content, metadata) => { calls.push({ path, content, metadata }); return 'ok'; },
    append: async () => 'audit-ok',
  });
  assert.deepEqual(await adapter.readTask('abc-123'), { path: taskPath('abc-123') });
  assert.equal(await adapter.writeTask(task, 'sha-old'), 'ok');
  assert.equal(calls[0].path, taskPath(task.task_id));
  assert.equal(calls[0].content, serialiseTask(task));
  assert.equal(calls[0].metadata.fingerprint, taskFingerprint(task));
  assert.equal(calls[0].metadata.expectedSha, 'sha-old');
});

test('repository adapter exposes durable audit path', async () => {
  let path;
  const adapter = createRepositoryDispatchAdapter({
    read: async () => null,
    write: async () => 'ok',
    append: async (...args) => { path = args[0]; return 'audit-ok'; },
  });
  assert.equal(await adapter.appendAuditEvent({ event_id: 'audit-1' }), 'audit-ok');
  assert.equal(path, auditPath());
});

test('serialisation and fingerprint are deterministic', () => {
  const task = { task_id: 'abc-123', status: 'queued' };
  assert.equal(serialiseTask(task), '{\n  "task_id": "abc-123",\n  "status": "queued"\n}\n');
  assert.equal(taskFingerprint(task), taskFingerprint({ task_id: 'abc-123', status: 'queued' }));
});
