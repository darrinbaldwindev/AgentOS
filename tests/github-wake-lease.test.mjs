import test from 'node:test';
import assert from 'node:assert/strict';
import { acquireTaskLease } from '../src/dispatch/lease.mjs';

const task = { task_id: 'wake-lease-001', status: 'queued' };

test('second runner cannot acquire an active task lease', () => {
  const now = Date.parse('2026-09-01T00:00:00Z');
  const first = acquireTaskLease(task, 'runner-a', now, 60000);
  const second = acquireTaskLease(first.task, 'runner-b', now + 1, 60000);
  assert.equal(first.acquired, true);
  assert.equal(second.acquired, false);
  assert.equal(second.reason, 'lease_active');
});
