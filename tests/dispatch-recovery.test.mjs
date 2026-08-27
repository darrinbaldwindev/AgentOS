import test from 'node:test';
import assert from 'node:assert/strict';
import { createRunBudget, isStaleClaim, recoverStaleTask } from '../src/dispatch/recovery.mjs';

test('stale claims can be recovered to queued state', () => {
  const now = Date.parse('2026-08-27T15:00:00Z');
  const task = { task_id: 'recovery-001', status: 'working', updated_at: '2026-08-27T14:00:00Z' };
  assert.equal(isStaleClaim(task, now, 15 * 60 * 1000), true);
  const recovered = recoverStaleTask(task, now, 15 * 60 * 1000);
  assert.equal(recovered.status, 'queued');
  assert.equal(recovered.recovery.reason, 'stale_claim');
});

test('fresh work is not reset', () => {
  const now = Date.parse('2026-08-27T15:00:00Z');
  const task = { task_id: 'recovery-002', status: 'working', updated_at: '2026-08-27T14:55:00Z' };
  assert.equal(isStaleClaim(task, now, 15 * 60 * 1000), false);
  assert.equal(recoverStaleTask(task, now).status, 'working');
});

test('run budget rejects unsafe values', () => {
  assert.deepEqual(createRunBudget({ maxTasks: 3, timeoutMs: 1000 }), { maxTasks: 3, timeoutMs: 1000 });
  assert.throws(() => createRunBudget({ maxTasks: 0 }), /maxTasks/);
  assert.throws(() => createRunBudget({ timeoutMs: 0 }), /timeoutMs/);
});
