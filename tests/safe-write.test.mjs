import test from 'node:test';
import assert from 'node:assert/strict';
import { safeWriteTask } from '../src/dispatch/safe-write.mjs';

test('safe write succeeds normally', async () => {
  const task = { task_id: 'safe-001', mission_id: 'mission:safe-001' };
  const expectedSha = 'expected:safe-001';
  const calls = [];
  const result = await safeWriteTask({
    store: {
      writeTask: async (receivedTask, receivedExpectedSha) => {
        calls.push({ receivedTask, receivedExpectedSha });
        return { written: true };
      },
    },
    task,
    expectedSha,
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.result, { written: true });
  assert.equal('outcome' in result, false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].receivedTask, task);
  assert.equal(calls[0].receivedExpectedSha, expectedSha);
});

test('safe write converts version conflict into reconciliation outcome with exact correlation', async () => {
  const result = await safeWriteTask({
    store: { writeTask: async () => ({ written: false, reason: 'version_conflict', current: { status: 'claimed' } }) },
    task: { task_id: 'safe-002', mission_id: 'mission:safe-002' }, now: Date.parse('2026-08-28T05:00:00Z'),
  });
  assert.equal(result.ok, false);
  assert.equal(result.outcome.action, 'reconcile');
  assert.equal(result.outcome.task_id, 'safe-002');
  assert.equal(result.outcome.mission_id, 'mission:safe-002');
});

test('safe write escalates non-conflict persistence failures with exact correlation', async () => {
  const result = await safeWriteTask({
    store: { writeTask: async () => ({ written: false, error: 'storage unavailable' }) },
    task: { task_id: 'safe-003', mission_id: 'mission:safe-003' },
  });
  assert.equal(result.ok, false);
  assert.equal(result.outcome.action, 'escalate');
  assert.equal(result.outcome.task_id, 'safe-003');
  assert.equal(result.outcome.mission_id, 'mission:safe-003');
});
