// AGENTOS-P0-REMOTE-AUTHORITY-EVIDENCE-001
// Read-only loader/validator for canonical remote authentication, grant and consent evidence.
// This module does not authenticate transports, issue grants/consent, mutate evidence, or execute work.
// It consumes typed artifacts from the existing AgentOS persistence vocabulary and fails closed.

const SESSION_ARTIFACT_TYPE = 'remote.authenticated.session';
const GRANT_ARTIFACT_TYPE = 'remote.authority.grant';
const CONSENT_ARTIFACT_TYPE = 'remote.consent.decision';
const SESSION_STATUS = 'AUTHENTICATED';
const GRANT_STATUS = 'GRANTED';
const CONSENT_STATUS = 'ACTIVE';
const CONSENT_MODES = new Set(['PRE_AUTHORIZED', 'CONFIRMATION_REQUIRED', 'PROHIBITED']);

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} is required`);
  return value;
}

function requireText(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function requireStringArray(value, name) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new TypeError(`${name} must be a non-empty array of strings`);
  }
  return Object.freeze([...new Set(value.map((item) => item.trim()))]);
}

function requireInstant(value, name) {
  const text = requireText(value, name);
  const ms = Date.parse(text);
  if (!Number.isFinite(ms)) throw new Error(`${name.toUpperCase().replaceAll('.', '_')}_INVALID`);
  return Object.freeze({ text: new Date(ms).toISOString(), ms });
}

function assertActiveWindow(payload, nowMs, prefix) {
  const issued = requireInstant(payload.issued_at, `${prefix}.issued_at`);
  const expires = requireInstant(payload.expires_at, `${prefix}.expires_at`);
  if (issued.ms > nowMs + 60_000) throw new Error(`${prefix.toUpperCase()}_EVIDENCE_NOT_YET_VALID`);
  if (expires.ms <= issued.ms || expires.ms <= nowMs) throw new Error(`${prefix.toUpperCase()}_EVIDENCE_EXPIRED`);
  if (payload.revoked_at != null) {
    requireInstant(payload.revoked_at, `${prefix}.revoked_at`);
    throw new Error(`${prefix.toUpperCase()}_EVIDENCE_REVOKED`);
  }
  return Object.freeze({ issued_at: issued.text, expires_at: expires.text });
}

async function loadExactArtifact(persistence, id, artifactType, missingCode, typeCode) {
  const expectedId = requireText(id, 'evidenceId');
  const artifact = await persistence.get('artifact', expectedId);
  if (!artifact) throw new Error(missingCode);
  if (artifact.id !== expectedId || artifact.artifactType !== artifactType) throw new Error(typeCode);
  requireObject(artifact.payload, 'artifact.payload');
  if (artifact.payload.evidence_id !== expectedId) throw new Error(`${typeCode}_ID_MISMATCH`);
  return artifact.payload;
}

function assertSame(value, expected, code) {
  if (value !== expected) throw new Error(code);
}

export function createRemoteAuthorityEvidenceSource({ persistence, now = () => new Date() } = {}) {
  requireObject(persistence, 'persistence');
  if (typeof persistence.get !== 'function') throw new TypeError('persistence.get is required');
  if (typeof now !== 'function') throw new TypeError('now must be a function');

  function nowMs() {
    const value = now();
    const ms = value instanceof Date ? value.getTime() : NaN;
    if (!Number.isFinite(ms)) throw new TypeError('now must return a valid Date');
    return ms;
  }

  async function authenticatedActorContext({ sessionEvidenceId, request } = {}) {
    requireObject(request, 'request');
    const evidenceId = requireText(sessionEvidenceId, 'sessionEvidenceId');
    const payload = await loadExactArtifact(
      persistence,
      evidenceId,
      SESSION_ARTIFACT_TYPE,
      'REMOTE_SESSION_EVIDENCE_REQUIRED',
      'REMOTE_SESSION_EVIDENCE_TYPE_MISMATCH'
    );
    if (payload.status !== SESSION_STATUS) throw new Error('REMOTE_SESSION_NOT_AUTHENTICATED');
    const actorId = requireText(payload.actor_id, 'session.actor_id');
    const issuer = requireText(payload.issuer, 'session.issuer');
    const sessionId = requireText(payload.session_id, 'session.session_id');
    const transportId = requireText(payload.transport_id, 'session.transport_id');
    const authenticationMethod = requireText(payload.authentication_method, 'session.authentication_method');
    const requestId = requireText(request.request_id, 'request.request_id');
    const deliveryId = requireText(request.delivery_id, 'request.delivery_id');
    if (requireText(payload.request_id, 'session.request_id') !== requestId || requireText(payload.delivery_id, 'session.delivery_id') !== deliveryId) {
      throw new Error('REMOTE_SESSION_EVIDENCE_CORRELATION_MISMATCH');
    }
    const window = assertActiveWindow(payload, nowMs(), 'REMOTE_SESSION');
    return Object.freeze({
      actor_id: actorId,
      issuer,
      authenticated: true,
      authentication_evidence_id: evidenceId,
      session_id: sessionId,
      transport_id: transportId,
      authentication_method: authenticationMethod,
      authenticated_at: window.issued_at,
      expires_at: window.expires_at,
    });
  }

  async function validatedConsent({ consentEvidenceId, expected } = {}) {
    requireObject(expected, 'expected');
    const evidenceId = requireText(consentEvidenceId, 'consentEvidenceId');
    const payload = await loadExactArtifact(
      persistence,
      evidenceId,
      CONSENT_ARTIFACT_TYPE,
      'REMOTE_CONSENT_EVIDENCE_REQUIRED',
      'REMOTE_CONSENT_EVIDENCE_TYPE_MISMATCH'
    );
    if (payload.status !== CONSENT_STATUS) throw new Error('REMOTE_CONSENT_EVIDENCE_INACTIVE');
    const mode = requireText(payload.consent_mode, 'consent.consent_mode');
    if (!CONSENT_MODES.has(mode)) throw new Error('REMOTE_CONSENT_MODE_INVALID');
    assertActiveWindow(payload, nowMs(), 'REMOTE_CONSENT');

    const checks = [
      ['actor_id', 'REMOTE_CONSENT_ACTOR_MISMATCH'],
      ['issuer', 'REMOTE_CONSENT_ISSUER_MISMATCH'],
      ['project_id', 'REMOTE_CONSENT_PROJECT_MISMATCH'],
      ['mission_id', 'REMOTE_CONSENT_MISSION_MISMATCH'],
      ['request_id', 'REMOTE_CONSENT_REQUEST_MISMATCH'],
      ['delivery_id', 'REMOTE_CONSENT_DELIVERY_MISMATCH'],
      ['objective', 'REMOTE_CONSENT_INTENT_MISMATCH'],
      ['target', 'REMOTE_CONSENT_TARGET_MISMATCH'],
    ];
    for (const [field, code] of checks) assertSame(requireText(payload[field], `consent.${field}`), expected[field], code);
    assertSame(mode, expected.consent_mode, 'REMOTE_CONSENT_MODE_MISMATCH');

    return Object.freeze({ evidence_id: evidenceId, consent_mode: mode, status: CONSENT_STATUS });
  }

  async function resolveGrant({ grantEvidenceId, candidate, actorContext, requestedCapabilities } = {}) {
    requireObject(candidate, 'candidate');
    requireObject(actorContext, 'actorContext');
    const evidenceId = requireText(grantEvidenceId, 'grantEvidenceId');
    const payload = await loadExactArtifact(
      persistence,
      evidenceId,
      GRANT_ARTIFACT_TYPE,
      'REMOTE_AUTHORITY_GRANT_REQUIRED',
      'REMOTE_AUTHORITY_GRANT_TYPE_MISMATCH'
    );
    if (payload.status !== GRANT_STATUS) throw new Error('REMOTE_AUTHORITY_GRANT_REQUIRED');
    assertActiveWindow(payload, nowMs(), 'REMOTE_AUTHORITY_GRANT');

    const actorId = requireText(payload.actor_id, 'grant.actor_id');
    const issuer = requireText(payload.issuer, 'grant.issuer');
    const projectId = requireText(payload.project_id, 'grant.project_id');
    const missionId = requireText(payload.mission_id, 'grant.mission_id');
    const requestId = requireText(payload.request_id, 'grant.request_id');
    const deliveryId = requireText(payload.delivery_id, 'grant.delivery_id');
    const objective = requireText(payload.objective, 'grant.objective');
    const target = requireText(payload.target, 'grant.target');
    const acceptanceCriteria = requireStringArray(payload.acceptance_criteria, 'grant.acceptance_criteria');
    const consentMode = requireText(payload.consent_mode, 'grant.consent_mode');
    const consentEvidenceId = requireText(payload.consent_evidence_id, 'grant.consent_evidence_id');
    if (!CONSENT_MODES.has(consentMode)) throw new Error('REMOTE_AUTHORITY_CONSENT_MODE_INVALID');

    const granted = requireStringArray(payload.granted_capabilities, 'grant.granted_capabilities');
    const requested = requireStringArray(requestedCapabilities, 'requestedCapabilities');
    const candidateRequested = requireStringArray(candidate.requested_capabilities, 'candidate.requested_capabilities');
    if (
      actorId !== actorContext.actor_id ||
      issuer !== actorContext.issuer ||
      projectId !== candidate.project_id ||
      requestId !== candidate.request_id ||
      deliveryId !== candidate.delivery_id ||
      objective !== candidate.objective
    ) {
      throw new Error('REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH');
    }
    if (requested.length !== candidateRequested.length || !requested.every((capability) => candidateRequested.includes(capability))) {
      throw new Error('REMOTE_AUTHORITY_REQUESTED_CAPABILITY_MISMATCH');
    }
    if (!requested.every((capability) => granted.includes(capability))) throw new Error('REMOTE_AUTHORITY_GRANT_INCOMPLETE');

    await validatedConsent({
      consentEvidenceId,
      expected: {
        actor_id: actorId,
        issuer,
        project_id: projectId,
        mission_id: missionId,
        request_id: requestId,
        delivery_id: deliveryId,
        objective,
        target,
        consent_mode: consentMode,
      },
    });

    return Object.freeze({
      status: GRANT_STATUS,
      evidence_id: evidenceId,
      actor_id: actorId,
      issuer,
      project_id: projectId,
      mission_id: missionId,
      granted_capabilities: granted,
      request_id: requestId,
      delivery_id: deliveryId,
      objective,
      target,
      acceptance_criteria: acceptanceCriteria,
      consent_mode: consentMode,
      consent_evidence_id: consentEvidenceId,
    });
  }

  return Object.freeze({ authenticatedActorContext, resolveGrant });
}

export const REMOTE_AUTHORITY_EVIDENCE_TYPES = Object.freeze({
  session: SESSION_ARTIFACT_TYPE,
  grant: GRANT_ARTIFACT_TYPE,
  consent: CONSENT_ARTIFACT_TYPE,
});
