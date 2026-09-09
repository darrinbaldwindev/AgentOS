import test from 'node:test';
import assert from 'node:assert/strict';
import {
  claimRemoteDelivery,
  createRemoteExecutionReceipt,
  normalizeRemoteBridgeRequest,
} from '../runtime/remote-local-bridge-contract.mjs';

const NOW = new Date('2026-09-09T03:30:00.000Z');

function baseRequest(overrides = {}) {
  return {
    delivery_id: 'delivery-001',
    request_id: 'request-001',
    project_id: 'agentos-local',
    objective: 'inspect one bounded local repository state',
    requested_capabilities: ['repository:read'],
    scope: ['local-runtime'],
    constraints: ['read-only execution boundary'],
    created_at: '2026-09-09T03:29:00.000Z',
    ...overrides,
  };
}

function actor(overrides = {}) {
  return {
    actor_id: 'owner-mobile',
    issuer: 'agentos:overseer',
    authenticated: true,
    ...overrides,
  };
}

function normalize(request = baseRequest(), actorContext = actor()) {
  return normalizeRemoteBridgeRequest({
    request,
    actorContext,
    allowedProjects: ['agentos-local'],
    allowedCapabilities: ['repository:read'],
    now: () => NOW,
  });
}

test('authorised-shaped remote input becomes authority-free candidate only', () => {
  const candidate = normalize();
  assert.equal(candidate.admission_state, 'AWAITING_AUTHORITY');
  assert.equal(candidate.environment, 'DRY_RUN');
  assert.equal(candidate.project_id, 'agentos-local');
  assert.deepEqual(candidate.requested_capabilities, ['repository:read']);
  assert.equal(Object.hasOwn(candidate, 'authority'), false);
  assert.equal(Object.hasOwn(candidate, 'consent_mode'), false);
  assert.equal(Object.hasOwn(candidate, 'granted_capabilities'), false);
});

test('remote caller cannot self-grant authority, consent or autonomy', () => {
  for (const field of ['authority', 'consent_mode', 'granted_capabilities', 'autonomy', 'budget_override']) {
    assert.throws(
      () => normalize(baseRequest({ [field]: field === 'authority' ? { granted_capabilities: ['repository:read'] } : 'x' })),
      new RegExp(`REMOTE_AUTHORITY_FIELD_FORBIDDEN:${field}`),
    );
  }
});

test('unauthenticated actor is rejected before admission', () => {
  assert.throws(() => normalize(baseRequest(), actor({ authenticated: false })), /REMOTE_ACTOR_NOT_AUTHENTICATED/);
});

test('production scope or production intent fails closed', () => {
  assert.throws(() => normalize(baseRequest({ scope: ['production'] })), /REMOTE_SCOPE_NOT_ALLOWED/);
  assert.throws(
    () => normalize(baseRequest({ objective: 'perform a production write to the live system' })),
    /REMOTE_PRODUCTION_INTENT_PROHIBITED/,
  );
});

test('capability and project must be allowlisted independently from request content', () => {
  assert.throws(() => normalize(baseRequest({ project_id: 'other-project' })), /REMOTE_PROJECT_NOT_ALLOWED/);
  assert.throws(
    () => normalize(baseRequest({ requested_capabilities: ['shell:execute'] })),
    /REMOTE_CAPABILITY_NOT_ALLOWED/,
  );
});

test('stale and materially future-dated requests are rejected', () => {
  assert.throws(
    () => normalize(baseRequest({ created_at: '2026-09-09T03:00:00.000Z' })),
    /REMOTE_REQUEST_STALE/,
  );
  assert.throws(
    () => normalize(baseRequest({ created_at: '2026-09-09T03:32:00.000Z' })),
    /REMOTE_CREATED_AT_IN_FUTURE/,
  );
});

test('duplicate delivery cannot be claimed twice in one claim registry', () => {
  const candidate = normalize();
  const claimed = new Set();
  assert.deepEqual(claimRemoteDelivery({ candidate, claimedDeliveryIds: claimed }), {
    claimed: true,
    disposition: 'CLAIMED',
    delivery_id: 'delivery-001',
  });
  assert.deepEqual(claimRemoteDelivery({ candidate, claimedDeliveryIds: claimed }), {
    claimed: false,
    disposition: 'DUPLICATE_DELIVERY',
    delivery_id: 'delivery-001',
  });
});

test('completion receipt requires exact correlation and evidence', () => {
  const candidate = normalize();
  assert.throws(
    () => createRemoteExecutionReceipt({
      candidate,
      missionId: 'mission:001', taskId: 'task-001', wakeTraceId: 'wake-001',
      hostId: 'host-win-001', workerId: 'worker-001', status: 'COMPLETED',
      evidence: [], budgetStatus: 'reconciled', codeIdentity: 'sha:abc',
    }),
    /REMOTE_COMPLETED_REQUIRES_EVIDENCE/,
  );

  const receipt = createRemoteExecutionReceipt({
    candidate,
    missionId: 'mission:001', taskId: 'task-001', wakeTraceId: 'wake-001',
    hostId: 'host-win-001', workerId: 'worker-001', status: 'COMPLETED',
    evidence: ['green:pass', 'task:task-001'], budgetStatus: 'reconciled', codeIdentity: 'sha:abc',
    createdAt: '2026-09-09T03:30:30.000Z',
  });
  assert.equal(receipt.delivery_id, 'delivery-001');
  assert.equal(receipt.request_id, 'request-001');
  assert.equal(receipt.mission_id, 'mission:001');
  assert.equal(receipt.task_id, 'task-001');
  assert.equal(receipt.host_id, 'host-win-001');
  assert.equal(receipt.status, 'COMPLETED');
  assert.deepEqual(receipt.evidence, ['green:pass', 'task:task-001']);
});

test('receipt cannot invent an unsupported status', () => {
  const candidate = normalize();
  assert.throws(
    () => createRemoteExecutionReceipt({
      candidate,
      missionId: 'mission:001', taskId: 'task-001', wakeTraceId: 'wake-001',
      hostId: 'host-win-001', workerId: 'worker-001', status: 'SUCCESSISH',
      evidence: ['x'], budgetStatus: 'reconciled', codeIdentity: 'sha:abc',
    }),
    /REMOTE_RECEIPT_STATUS_INVALID/,
  );
});
