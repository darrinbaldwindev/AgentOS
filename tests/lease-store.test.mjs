import test from 'node:test';
import assert from 'node:assert/strict';
import { LeaseStore } from '../src/dispatch/lease-store.mjs';

test('second owner cannot acquire an active lease', () => {
  const store = new LeaseStore();
  assert.equal(store.acquire('task-1', 'runner-a', 1000, 10000).acquired, true);
  const second = store.acquire('task-1', 'runner-b', 1001, 10000);
  assert.equal(second.acquired, false);
  assert.equal(second.reason, 'lease_active');
});

test('expired lease can be acquired by a new owner', () => {
  const store = new LeaseStore();
  store.acquire('task-1', 'runner-a', 1000, 1000);
  const second = store.acquire('task-1', 'runner-b', 2000, 1000);
  assert.equal(second.acquired, true);
  assert.equal(second.lease.owner, 'runner-b');
});

test('only current owner can renew or release', () => {
  const store = new LeaseStore();
  store.acquire('task-1', 'runner-a', 1000, 10000);
  assert.equal(store.renew('task-1', 'runner-b', 2000).renewed, false);
  assert.equal(store.renew('task-1', 'runner-a', 2000).renewed, true);
  assert.equal(store.release('task-1', 'runner-b').released, false);
  assert.equal(store.release('task-1', 'runner-a').released, true);
});
