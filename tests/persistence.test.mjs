import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPersistenceAdapter, completionKey } from '../src/dispatch/persistence.mjs';

test('valid persistence adapter is accepted', () => {
  const adapter = Object.fromEntries(['acquireLease','renewLease','releaseLease','getCompletion','putCompletion'].map((key) => [key, () => {}]));
  assert.equal(assertPersistenceAdapter(adapter), adapter);
});

test('incomplete persistence adapter fails closed', () => {
  assert.throws(() => assertPersistenceAdapter({ acquireLease() {} }), /missing:/);
});

test('completion key is stable', () => {
  assert.equal(completionKey('task-1'), 'dispatch:completion:task-1');
});
