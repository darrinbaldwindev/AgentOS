import test from 'node:test';
import assert from 'node:assert/strict';
import { atomicClaim, releaseClaim } from '../src/dispatch/atomic-claim.mjs';

const task = { task_id: 'claim-001', target: 'agentos:worker', status: 'queued' };
const now = Date.parse('2026-08-27T05:00:00Z');

test('only queued tasks addressed to the receiver can be claimed', () => {
  const result = atomicClaim(task, 'agentos:worker', { now, claimId: 'run-1' });
  assert.equal(result.claimed, true);
  assert.equal(result.task.status, 'claimed');
  assert.equal(result.task.claim.id, 'run-1');
  assert.equal(result.task.updated_at, '2026-08-27T05:00:00.000Z');
  assert.equal(atomicClaim(result.task, 'agentos:worker', { now, claimId: 'run-2' }).claimed, false);
});

test('wrong receiver cannot claim', () => {
  assert.equal(atomicClaim(task, 'other-worker', { now, claimId: 'run-3' }).claimed, false);
});

test('claimed work can be explicitly released for recovery', () => {
  const claimed = atomicClaim(task, 'agentos:worker', { now, claimId: 'run-4' }).task;
  const released = releaseClaim(claimed, 'worker_shutdown', now + 1000);
  assert.equal(released.status, 'queued');
  assert.equal(released.claim, null);
  assert.equal(released.recovery.reason, 'worker_shutdown');
});
