import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveLocalHostStatus } from '../runtime/local-host-status.mjs';

const observedAt = '2026-09-10T04:00:00.000Z';
const fresh = '2026-09-10T03:59:30.000Z';
const old = '2026-09-10T03:00:00.000Z';
const hostIdentity = { host_id: 'host-a', last_seen: fresh };
const config = { scheduler: { enabled: true } };

function task(overrides = {}) {
  return {
    id: 'artifact-task-1',
    artifactType: 'dispatch.task',
    updatedAt: fresh,
    payload: {
      host_id: 'host-a',
      task_id: 'task-1',
      mission_id: 'mission-1',
      wake_trace_id: 'wake-1',
      delivery_id: 'delivery-1',
      status: 'running',
      ...overrides,
    },
  };
}

function receipt(overrides = {}) {
  return {
    id: 'receipt-1',
    artifactType: 'remote.execution.receipt',
    updatedAt: fresh,
    payload: {
      host_id: 'host-a',
      task_id: 'task-1',
      mission_id: 'mission-1',
      wake_trace_id: 'wake-1',
      status: 'COMPLETED',
      completed_at: fresh,
      code_identity: 'abc123',
      green_disposition: 'pass',
      ...overrides,
    },
  };
}

function claim(overrides = {}) {
  return {
    delivery_id: 'delivery-1',
    request_id: 'request-1',
    host_id: 'host-a',
    claimed_at: fresh,
    state: 'CLAIMED',
    ...overrides,
  };
}

test('fresh explicit host observation with no active task reports idle', () => {
  const result = deriveLocalHostStatus({ hostIdentity, config, artifacts: [receipt()], observedAt });
  assert.equal(result.lifecycle_state, 'idle');
  assert.equal(result.evidence_freshness, 'fresh');
  assert.equal(result.last_seen, fresh);
});

test('recent historical completion without current host observation never proves idle', () => {
  const result = deriveLocalHostStatus({
    hostIdentity: { host_id: 'host-a' },
    config,
    artifacts: [receipt()],
    observedAt,
  });
  assert.equal(result.lifecycle_state, 'offline_or_stale');
  assert.equal(result.last_result.receipt_id, 'receipt-1');
});

test('PR91-shaped queued task plus fresh durable claim reports working', () => {
  const result = deriveLocalHostStatus({
    hostIdentity: { host_id: 'host-a' },
    config,
    artifacts: [task({ status: 'queued', pickup_state: 'QUEUED' })],
    claims: [claim()],
    observedAt,
  });
  assert.equal(result.lifecycle_state, 'working');
  assert.deepEqual(result.current, { task_id: 'task-1', mission_id: 'mission-1', wake_trace_id: 'wake-1' });
});

test('synthetic explicit running state remains supported', () => {
  const result = deriveLocalHostStatus({ hostIdentity, config, artifacts: [task()], observedAt });
  assert.equal(result.lifecycle_state, 'working');
});

test('blocked pickup state outranks queued task status', () => {
  const result = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [task({ status: 'queued', pickup_state: 'BLOCKED', pickup_blocker: 'CAPABILITY_MATCH_FAILED' })],
    observedAt,
  });
  assert.equal(result.lifecycle_state, 'blocked');
  assert.equal(result.reason, 'CAPABILITY_MATCH_FAILED');
});

test('newest blocked task is reported rather than arbitrary historical blocker', () => {
  const historical = task({ task_id: 'old-task', mission_id: 'old-mission', wake_trace_id: 'old-wake', pickup_state: 'BLOCKED', pickup_blocker: 'OLD_BLOCKER' });
  historical.id = 'old-task';
  historical.updatedAt = old;
  const current = task({ pickup_state: 'BLOCKED', pickup_blocker: 'CURRENT_BLOCKER' });
  const result = deriveLocalHostStatus({ hostIdentity, config, artifacts: [historical, current], observedAt });
  assert.equal(result.reason, 'CURRENT_BLOCKER');
});

test('retained uncertain lock reports recovery_required', () => {
  const result = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [receipt()],
    locks: [{ retained: true, reason: 'LOCAL_STATE_LOCK_RECOVERY_REQUIRED' }],
    observedAt,
  });
  assert.equal(result.lifecycle_state, 'recovery_required');
  assert.equal(result.reason, 'LOCAL_STATE_LOCK_RECOVERY_REQUIRED');
});

test('stale explicit last-seen reports offline_or_stale', () => {
  const result = deriveLocalHostStatus({
    hostIdentity: { host_id: 'host-a', last_seen: old },
    config,
    artifacts: [receipt({ completed_at: old })].map((record) => ({ ...record, updatedAt: old })),
    observedAt,
    staleAfterMs: 5 * 60 * 1000,
  });
  assert.equal(result.lifecycle_state, 'offline_or_stale');
  assert.equal(result.evidence_freshness, 'stale');
});

test('unrelated historical record from another host does not create identity conflict', () => {
  const foreign = receipt({ host_id: 'host-b', task_id: 'foreign-task', mission_id: 'foreign-mission', wake_trace_id: 'foreign-wake' });
  const result = deriveLocalHostStatus({ hostIdentity, config, artifacts: [receipt(), foreign], observedAt });
  assert.equal(result.lifecycle_state, 'idle');
});

test('same correlated task claimed by another host fails closed', () => {
  const foreign = receipt({ host_id: 'host-b' });
  const result = deriveLocalHostStatus({ hostIdentity, config, artifacts: [task(), foreign], observedAt });
  assert.equal(result.lifecycle_state, 'blocked');
  assert.equal(result.reason, 'HOST_IDENTITY_CONFLICT');
});

test('active task missing exact correlation fails closed', () => {
  const result = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [task({ wake_trace_id: null })],
    observedAt,
  });
  assert.equal(result.lifecycle_state, 'blocked');
  assert.equal(result.reason, 'ACTIVE_TASK_CORRELATION_INCOMPLETE');
});

test('completed receipt is surfaced only with full correlation and build identity', () => {
  const valid = deriveLocalHostStatus({ hostIdentity, config, artifacts: [receipt()], observedAt });
  assert.equal(valid.last_result.receipt_id, 'receipt-1');
  assert.equal(valid.last_result.code_identity, 'abc123');
  assert.equal(valid.assurance.green, 'pass');
  assert.equal(valid.assurance.prs, 'unknown');

  const invalid = deriveLocalHostStatus({ hostIdentity, config, artifacts: [receipt({ code_identity: '' })], observedAt });
  assert.equal(invalid.last_result, null);
  assert.deepEqual(invalid.assurance, { green: 'unknown', prs: 'unknown' });
});

test('multiple active tasks fail closed rather than guessing working', () => {
  const second = task({ task_id: 'task-2', mission_id: 'mission-2', wake_trace_id: 'wake-2', delivery_id: 'delivery-2' });
  second.id = 'artifact-task-2';
  const result = deriveLocalHostStatus({ hostIdentity, config, artifacts: [task(), second], observedAt });
  assert.equal(result.lifecycle_state, 'blocked');
  assert.equal(result.reason, 'MULTIPLE_ACTIVE_TASKS');
});
