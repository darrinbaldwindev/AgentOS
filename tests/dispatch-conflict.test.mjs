import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyWriteResult, conflictOutcome } from '../src/dispatch/conflict.mjs';

test('version conflicts are recoverable reconciliation events', () => {
  const result = { written: false, reason: 'version_conflict', current: { status: 'claimed', claim: { id: 'other-run' } } };
  assert.deepEqual(classifyWriteResult(result), { kind: 'conflict', recoverable: true, current: result.current });
  const outcome = conflictOutcome({ task_id: 'conflict-001' }, result, Date.parse('2026-08-28T05:00:00Z'));
  assert.equal(outcome.action, 'reconcile');
  assert.equal(outcome.reason, 'repository_version_changed');
  assert.equal(outcome.task_id, 'conflict-001');
});

test('ordinary persistence failures are not treated as conflicts', () => {
  assert.deepEqual(classifyWriteResult({ written: false, error: 'network unavailable' }), {
    kind: 'failure', recoverable: false, error: 'network unavailable',
  });
});
