import test from 'node:test';
import assert from 'node:assert/strict';
import { safeWriteTask } from '../src/dispatch/safe-write.mjs';

test('safe write succeeds normally', async () => {
  const result = await safeWriteTask({
    store: { writeTask: async () => ({ written: true }) },
    task: { task_id: 'safe-001' },
  });
  assert.equal(result.ok, true);
});

test('safe write converts version conflict into reconciliation outcome', async () => {
  const result = await safeWriteTask({
    store: { writeTask: async () => ({ written: false, reason: 'version_conflict', current: { status: 'claimed' } }) },
    task: { task_id: 'safe-002' }, now: Date.parse('2026-08-28T05:00:00Z'),
  });
  assert.equal(result.ok, false);
  assert.equal(result.outcome.action, 'reconcile');
  assert.equal(result.outcome.task_id, 'safe-002');
});

test('safe write escalates non-conflict persistence failures', async () => {
  const result = await safeWriteTask({
    store: { writeTask: async () => ({ written: false, error: 'storage unavailable' }) },
    task: { task_id: 'safe-003' },
  });
  assert.equal(result.ok, false);
  assert.equal(result.outcome.action, 'escalate');
});
