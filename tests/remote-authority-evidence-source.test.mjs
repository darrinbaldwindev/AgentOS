import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRemoteAuthorityEvidenceSource,
  REMOTE_AUTHORITY_EVIDENCE_TYPES,
} from '../runtime/remote-authority-evidence-source.mjs';

const NOW = new Date('2026-09-19T04:30:00.000Z');
const sessionId = 'session-evidence-1';
const grantId = 'grant-evidence-1';

function request(overrides = {}) {
  return {
    delivery_id: 'delivery-1',
    request_id: 'request-1',
    actor_id: 'owner-1',
    issuer: 'agentos:overseer',
    project_id: 'agentos',
    objective: 'update bounded project documentation',
    requested_capabilities: ['project.file.write'],
    ...overrides,
  };
}

function candidate(overrides = {}) {
  return {
    ...request(),
    admission_state: 'AWAITING_AUTHORITY',
    ...overrides,
  };
}

function sessionPayload(overrides = {}) {
  return {
    evidence_id: sessionId,
    status: 'AUTHENTICATED',
    actor_id: 'owner-1',
    issuer: 'agentos:overseer',
    session_id: 'transport-session-1',
    transport_id: 'remote-channel-1',
    authentication_method: 'trusted-local-test-fixture',
    request_id: 'request-1',
    delivery_id: 'delivery-1',
    issued_at: '2026-09-19T04:29:00.000Z',
    expires_at: '2026-09-19T04:40:00.000Z',
    revoked_at: null,
    ...overrides,
  };
}

function grantPayload(overrides = {}) {
  return {
    evidence_id: grantId,
    status: 'GRANTED',
    actor_id: 'owner-1',
    issuer: 'agentos:overseer',
    project_id: 'agentos',
    mission_id: 'mission-1',
    request_id: 'request-1',
    delivery_id: 'delivery-1',
    objective: 'update bounded project documentation',
    granted_capabilities: ['project.file.write'],
    target: 'docs/level2.md',
    acceptance_criteria: ['exact requested file changed', 'tests remain green'],
    consent_mode: 'PRE_AUTHORIZED',
    consent_evidence_id: 'consent-evidence-1',
    issued_at: '2026-09-19T04:29:10.000Z',
    expires_at: '2026-09-19T04:40:00.000Z',
    revoked_at: null,
    ...overrides,
  };
}

function harness({ session = sessionPayload(), grant = grantPayload() } = {}) {
  const artifacts = new Map();
  if (session) artifacts.set(sessionId, { id: sessionId, artifactType: REMOTE_AUTHORITY_EVIDENCE_TYPES.session, payload: session });
  if (grant) artifacts.set(grantId, { id: grantId, artifactType: REMOTE_AUTHORITY_EVIDENCE_TYPES.grant, payload: grant });
  let reads = 0;
  const persistence = {
    async get(type, id) {
      assert.equal(type, 'artifact');
      reads += 1;
      return artifacts.get(id) ?? null;
    },
  };
  return {
    source: createRemoteAuthorityEvidenceSource({ persistence, now: () => NOW }),
    artifacts,
    reads: () => reads,
  };
}

async function actor(source, inputRequest = request()) {
  return source.authenticatedActorContext({ sessionEvidenceId: sessionId, request: inputRequest });
}

async function grant(source, actorContext, inputCandidate = candidate(), requestedCapabilities = ['project.file.write']) {
  return source.resolveGrant({ grantEvidenceId: grantId, candidate: inputCandidate, actorContext, requestedCapabilities });
}

test('durable session and grant evidence reconstruct bounded immutable authority inputs', async () => {
  const { source, reads } = harness();
  const actorContext = await actor(source);
  assert.equal(actorContext.authenticated, true);
  assert.equal(actorContext.actor_id, 'owner-1');
  assert.equal(actorContext.authentication_evidence_id, sessionId);

  const resolved = await grant(source, actorContext);
  assert.equal(resolved.status, 'GRANTED');
  assert.equal(resolved.evidence_id, grantId);
  assert.equal(resolved.mission_id, 'mission-1');
  assert.equal(resolved.target, 'docs/level2.md');
  assert.deepEqual(resolved.acceptance_criteria, ['exact requested file changed', 'tests remain green']);
  assert.equal(resolved.consent_mode, 'PRE_AUTHORIZED');
  assert.equal(resolved.consent_evidence_id, 'consent-evidence-1');
  assert.equal(Object.isFrozen(actorContext), true);
  assert.equal(Object.isFrozen(resolved), true);
  assert.equal(reads(), 2);
});

test('caller authentication boolean without durable session evidence cannot authenticate', async () => {
  const { source } = harness({ session: null });
  await assert.rejects(actor(source), /REMOTE_SESSION_EVIDENCE_REQUIRED/);
});

test('session evidence cannot be borrowed across request or delivery correlation', async () => {
  const { source } = harness();
  await assert.rejects(actor(source, request({ request_id: 'request-other' })), /REMOTE_SESSION_EVIDENCE_CORRELATION_MISMATCH/);
  await assert.rejects(actor(source, request({ delivery_id: 'delivery-other' })), /REMOTE_SESSION_EVIDENCE_CORRELATION_MISMATCH/);
});

test('expired revoked or non-authenticated session evidence fails closed', async () => {
  await assert.rejects(actor(harness({ session: sessionPayload({ expires_at: '2026-09-19T04:29:59.000Z' }) }).source), /REMOTE_SESSION_EVIDENCE_EXPIRED/);
  await assert.rejects(actor(harness({ session: sessionPayload({ revoked_at: '2026-09-19T04:29:30.000Z' }) }).source), /REMOTE_SESSION_EVIDENCE_REVOKED/);
  await assert.rejects(actor(harness({ session: sessionPayload({ status: 'PENDING' }) }).source), /REMOTE_SESSION_NOT_AUTHENTICATED/);
});

test('grant must exist durably and remain exact-correlated to actor issuer project request delivery and objective', async () => {
  const missing = harness({ grant: null });
  const missingActor = await actor(missing.source);
  await assert.rejects(grant(missing.source, missingActor), /REMOTE_AUTHORITY_GRANT_REQUIRED/);

  for (const overrides of [
    { actor_id: 'other-owner' },
    { issuer: 'other-issuer' },
    { project_id: 'other-project' },
    { request_id: 'other-request' },
    { delivery_id: 'other-delivery' },
    { objective: 'different intent' },
  ]) {
    const h = harness({ grant: grantPayload(overrides) });
    const a = await actor(h.source);
    await assert.rejects(grant(h.source, a), /REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH/);
  }
});

test('grant replay under a different candidate intent fails closed', async () => {
  const { source } = harness();
  const a = await actor(source);
  await assert.rejects(grant(source, a, candidate({ objective: 'delete unrelated project files' })), /REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH/);
});

test('requested capability drift or incomplete grant cannot borrow authority', async () => {
  const { source } = harness();
  const a = await actor(source);
  await assert.rejects(
    grant(source, a, candidate({ requested_capabilities: ['project.file.write', 'shell.powershell.dev.execute'] }), ['project.file.write']),
    /REMOTE_AUTHORITY_REQUESTED_CAPABILITY_MISMATCH/
  );

  const incomplete = harness({ grant: grantPayload({ granted_capabilities: ['project.file.read'] }) });
  const incompleteActor = await actor(incomplete.source);
  await assert.rejects(grant(incomplete.source, incompleteActor), /REMOTE_AUTHORITY_GRANT_INCOMPLETE/);
});

test('grant target acceptance criteria and consent provenance are mandatory', async () => {
  for (const [overrides, pattern] of [
    [{ target: '' }, /grant.target is required/],
    [{ acceptance_criteria: [] }, /grant.acceptance_criteria must be a non-empty array/],
    [{ consent_mode: '' }, /grant.consent_mode is required/],
    [{ consent_mode: 'UNKNOWN' }, /REMOTE_AUTHORITY_CONSENT_MODE_INVALID/],
    [{ consent_evidence_id: '' }, /grant.consent_evidence_id is required/],
    [{ consent_evidence_id: grantId }, /REMOTE_AUTHORITY_CONSENT_PROVENANCE_INVALID/],
  ]) {
    const h = harness({ grant: grantPayload(overrides) });
    const a = await actor(h.source);
    await assert.rejects(grant(h.source, a), pattern);
  }
});

test('expired revoked or non-granted authority evidence fails closed', async () => {
  for (const [overrides, pattern] of [
    [{ expires_at: '2026-09-19T04:29:59.000Z' }, /REMOTE_AUTHORITY_GRANT_EVIDENCE_EXPIRED/],
    [{ revoked_at: '2026-09-19T04:29:30.000Z' }, /REMOTE_AUTHORITY_GRANT_EVIDENCE_REVOKED/],
    [{ status: 'REVOKED' }, /REMOTE_AUTHORITY_GRANT_REQUIRED/],
  ]) {
    const h = harness({ grant: grantPayload(overrides) });
    const a = await actor(h.source);
    await assert.rejects(grant(h.source, a), pattern);
  }
});

test('evidence artifact type and embedded id must match exactly', async () => {
  const wrongType = harness();
  wrongType.artifacts.set(sessionId, { id: sessionId, artifactType: 'remote.execution.receipt', payload: sessionPayload() });
  await assert.rejects(actor(wrongType.source), /REMOTE_SESSION_EVIDENCE_TYPE_MISMATCH/);

  const wrongEmbeddedId = harness();
  wrongEmbeddedId.artifacts.set(grantId, { id: grantId, artifactType: REMOTE_AUTHORITY_EVIDENCE_TYPES.grant, payload: grantPayload({ evidence_id: 'grant-other' }) });
  const a = await actor(wrongEmbeddedId.source);
  await assert.rejects(grant(wrongEmbeddedId.source, a), /REMOTE_AUTHORITY_GRANT_TYPE_MISMATCH_ID_MISMATCH/);
});
