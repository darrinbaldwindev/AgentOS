import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRemotePickupEligibility } from '../runtime/remote-pickup-eligibility.mjs';

const NOW = new Date('2026-09-09T10:00:00.000Z');

function task(overrides = {}) {
  return {
    task_id: 'task-001',
    mission_id: 'mission-001',
    delivery_id: 'delivery-001',
    request_id: 'request-001',
    project_id: 'agentos-local',
    target_host_id: 'host-win-001',
    admitted_by: 'agentos:authority',
    authority_admitted: true,
    environment: 'DRY_RUN',
    pickup_state: 'QUEUED',
    required_capabilities: ['repository:read'],
    scope: ['local-runtime'],
    constraints: ['read-only execution boundary'],
    created_at: '2026-09-09T09:59:00.000Z',
    ...overrides,
  };
}

function evaluate(admittedTask = task(), overrides = {}) {
  return evaluateRemotePickupEligibility({
    admittedTask,
    hostIdentity: { host_id: 'host-win-001' },
    hostCapabilities: ['repository:read'],
    now: () => NOW,
    ...overrides,
  });
}

test('authorised safe queued task for exact host is pickup eligible', () => {
  const result = evaluate();
  assert.equal(result.eligible, true);
  assert.equal(result.disposition, 'ELIGIBLE_FOR_PICKUP');
  assert.equal(result.task_id, 'task-001');
  assert.equal(result.delivery_id, 'delivery-001');
  assert.deepEqual(result.required_capabilities, ['repository:read']);
});

test('task cannot self-promote without authority admission', () => {
  const result = evaluate(task({ authority_admitted: false }));
  assert.equal(result.eligible, false);
  assert.equal(result.disposition, 'AUTHORITY_NOT_ADMITTED');
});

test('superseded and non-queued work is never pickup eligible', () => {
  assert.equal(evaluate(task({ pickup_state: 'SUPERSEDED' })).disposition, 'SUPERSEDED');
  assert.equal(evaluate(task({ pickup_state: 'CLAIMED' })).disposition, 'PICKUP_STATE_NOT_QUEUED');
});

test('wrong host and host capability mismatch fail closed', () => {
  assert.equal(evaluate(task({ target_host_id: 'host-other' })).disposition, 'HOST_MISMATCH');
  const mismatch = evaluate(task({ required_capabilities: ['repository:read', 'filesystem:write'] }));
  assert.equal(mismatch.eligible, false);
  assert.equal(mismatch.disposition, 'HOST_CAPABILITY_MISMATCH');
});

test('non-DRY_RUN and production-shaped constraints are prohibited', () => {
  assert.equal(evaluate(task({ environment: 'LIVE' })).disposition, 'ENVIRONMENT_NOT_SAFE');
  assert.equal(
    evaluate(task({ constraints: ['perform production write'] })).disposition,
    'PRODUCTION_SCOPE_PROHIBITED',
  );
});

test('stale or materially future queue entries fail closed', () => {
  assert.equal(
    evaluate(task({ created_at: '2026-09-09T09:00:00.000Z' })).disposition,
    'QUEUE_ENTRY_STALE',
  );
  assert.equal(
    evaluate(task({ created_at: '2026-09-09T10:02:00.000Z' })).disposition,
    'CREATED_AT_IN_FUTURE',
  );
});

test('invalid timestamp and empty required capabilities fail closed', () => {
  assert.equal(evaluate(task({ created_at: 'not-a-date' })).disposition, 'CREATED_AT_INVALID');
  assert.equal(evaluate(task({ required_capabilities: [] })).disposition, 'CAPABILITY_REQUIRED');
});
