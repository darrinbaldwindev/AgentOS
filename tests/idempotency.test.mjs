import test from 'node:test';
import assert from 'node:assert/strict';
import { IdempotencyStore } from '../src/dispatch/idempotency.mjs';

test('completion is accepted once', () => {
  const store = new IdempotencyStore();
  assert.equal(store.begin('task-1').accepted, true);
  assert.equal(store.complete('task-1', { status: 'COMPLETED' }).completed, true);
  const duplicate = store.complete('task-1', { status: 'COMPLETED' });
  assert.equal(duplicate.completed, false);
  assert.equal(duplicate.reason, 'already_completed');
});

test('unknown task IDs are rejected', () => {
  const store = new IdempotencyStore();
  assert.equal(store.begin('').accepted, false);
  assert.equal(store.complete('', {}).completed, false);
});
