import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveLocalHostStatus } from '../runtime/local-host-status.mjs';

const observedAt = '2026-09-10T04:00:00.000Z';
const fresh = '2026-09-10T03:59:30.000Z';
const old = '2026-09-10T03:00:00.000Z';
const hostIdentity = { host_id: 'host-a' };
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

test('fresh idle host reports idle', () => {
  const result = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [receipt()],
    events: [],
    observedAt,
  });
  assert.equal(result.lifecycle_state, 'idle');
  assert.equal(result.evidence_freshness, 'fresh');
  assert.equal(result.scheduler_enabled, true);
});

test('correlated in-flight task reports working', () => {
  const result = deriveLocalHostStatus({ hostIdentity, config, artifacts: [task()], observedAt });
  assert.equal(result.lifecycle_state, 'working');
  assert.deepEqual(result.current, {
    task_id: 'task-1',
    mission_id: 'mission-1',
    wake_trace_id: 'wake-1',
  });
});

test('blocked task reports blocked with blocker', () => {
  const result = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [task({ status: 'queued', pickup_state: 'BLOCKED', pickup_blocker: 'CAPABILITY_MATCH_FAILED' })],
    observedAt,
  });
  assert.equal(result.lifecycle_state, 'blocked');
  assert.equal(result.reason, 'CAPABILITY_MATCH_FAILED');
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

test('stale evidence reports offline_or_stale', () => {
  const result = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [receipt({ completed_at: old })].map((r) => ({ ...r, updatedAt: old })),
    observedAt,
    staleAfterMs: 5 * 60 * 1000,
  });
  assert.equal(result.lifecycle_state, 'offline_or_stale');
  assert.equal(result.evidence_freshness, 'stale');
});

test('conflicting host identity fails closed', () => {
  const result = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [receipt({ host_id: 'host-b' })],
    observedAt,
  });
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

  const invalid = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [receipt({ code_identity: '' })],
    observedAt,
  });
  assert.equal(invalid.last_result, null);
  assert.deepEqual(invalid.assurance, { green: 'unknown', prs: 'unknown' });
});

test('multiple active tasks fail closed rather than guessing working', () => {
  const result = deriveLocalHostStatus({
    hostIdentity,
    config,
    artifacts: [task(), { ...task({ task_id: 'task-2', mission_id: 'mission-2', wake_trace_id: 'wake-2' }), id: 'artifact-task-2' }],
    observedAt,
  });
  assert.equal(result.lifecycle_state, 'blocked');
  assert.equal(result.reason, 'MULTIPLE_ACTIVE_TASKS');
});
