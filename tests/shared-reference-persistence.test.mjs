import test from 'node:test';
import assert from 'node:assert/strict';
import { SharedReferencePersistence } from '../src/dispatch/shared-reference-persistence.mjs';
import { completionKey } from '../src/dispatch/persistence.mjs';

const makeAdapter = () => new SharedReferencePersistence();

test('shared reference persistence exposes the required production adapter surface', async () => {
  const adapter = makeAdapter();
  for (const method of ['acquireLease', 'renewLease', 'releaseLease', 'getCompletion', 'putCompletion']) {
    assert.equal(typeof adapter[method], 'function');
  }
});

test('shared reference persistence preserves lease time semantics and prevents competing owners', async () => {
  const adapter = makeAdapter();
  const first = await adapter.acquireLease('task-1', 'runner-a', 60_000, 1_000);
  const second = await adapter.acquireLease('task-1', 'runner-b', 60_000, 1_001);
  assert.equal(first.acquired, true);
  assert.equal(first.lease.acquired_at, 1_000);
  assert.equal(first.lease.expires_at, 61_000);
  assert.equal(second.acquired, false);
});

test('shared reference persistence uses the canonical completion key and supports replay', async () => {
  const adapter = makeAdapter();
  const completion = { task_id: 'task-2', status: 'completed' };
  const result = await adapter.putCompletion('task-2', completion);
  assert.equal(result.completed, true);
  assert.equal(result.record.task_id, completionKey('task-2'));
  assert.deepEqual((await adapter.getCompletion('task-2')).response, completion);
});
