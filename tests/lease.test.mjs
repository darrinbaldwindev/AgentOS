import test from 'node:test';
import assert from 'node:assert/strict';
import { acquireTaskLease, renewTaskLease, releaseTaskLease } from '../src/dispatch/lease.mjs';

const task = { task_id: 'lease-001', status: 'queued' };
const now = Date.parse('2026-09-01T00:00:00Z');

test('acquires an unleased queued task', () => {
  const result = acquireTaskLease(task, 'runner-a', now, 60000);
  assert.equal(result.acquired, true);
  assert.equal(result.task.lease.owner, 'runner-a');
});

test('rejects an active lease', () => {
  const leased = acquireTaskLease(task, 'runner-a', now, 60000).task;
  const result = acquireTaskLease(leased, 'runner-b', now + 1000, 60000);
  assert.equal(result.acquired, false);
  assert.equal(result.reason, 'lease_active');
});

test('allows renewal only to the current owner', () => {
  const leased = acquireTaskLease(task, 'runner-a', now, 60000).task;
  assert.equal(renewTaskLease(leased, 'runner-b', now + 1000).renewed, false);
  assert.equal(renewTaskLease(leased, 'runner-a', now + 1000).renewed, true);
});

test('requires the current owner to release', () => {
  const leased = acquireTaskLease(task, 'runner-a', now, 60000).task;
  assert.equal(releaseTaskLease(leased, 'runner-b').released, false);
  assert.equal(releaseTaskLease(leased, 'runner-a').released, true);
});
