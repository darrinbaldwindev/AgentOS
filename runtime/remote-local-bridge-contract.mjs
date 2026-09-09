// P0 remote-local bridge admission contract.
// This module deliberately does not execute work or grant authority.
// It normalizes untrusted remote requests into an authority-free candidate that
// must still pass the existing AgentOS authority/policy/dispatch path locally.

const SAFE_SCOPE = 'local-runtime';
const SAFE_ENVIRONMENT = 'DRY_RUN';

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function stringArray(value, name) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new TypeError(`${name} must be an array of non-empty strings`);
  }
  return value.map((item) => item.trim());
}

function containsProductionIntent(values = []) {
  return values.some((value) => /\bproduction\b|prod(?:uction)?\s+write|live\s+(?:write|deploy|credential)/i.test(value));
}

export function normalizeRemoteBridgeRequest({
  request,
  actorContext,
  allowedProjects = [],
  allowedCapabilities = [],
  now = () => new Date(),
  maxAgeMs = 15 * 60 * 1000,
} = {}) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) throw new TypeError('request is required');
  if (!actorContext || typeof actorContext !== 'object') throw new TypeError('actorContext is required');

  // Untrusted remote content must never supply fields that imply permission.
  for (const forbidden of ['authority', 'consent_mode', 'granted_capabilities', 'autonomy', 'budget_override']) {
    if (Object.hasOwn(request, forbidden)) throw new Error(`REMOTE_AUTHORITY_FIELD_FORBIDDEN:${forbidden}`);
  }

  const actorId = requiredString(actorContext.actor_id, 'actorContext.actor_id');
  const issuer = requiredString(actorContext.issuer, 'actorContext.issuer');
  if (actorContext.authenticated !== true) throw new Error('REMOTE_ACTOR_NOT_AUTHENTICATED');

  const deliveryId = requiredString(request.delivery_id, 'request.delivery_id');
  const requestId = requiredString(request.request_id, 'request.request_id');
  const projectId = requiredString(request.project_id, 'request.project_id');
  const objective = requiredString(request.objective, 'request.objective');
  const createdAt = requiredString(request.created_at, 'request.created_at');
  const requestedCapabilities = stringArray(request.requested_capabilities ?? [], 'request.requested_capabilities');
  const scope = stringArray(request.scope ?? [SAFE_SCOPE], 'request.scope');
  const constraints = stringArray(request.constraints ?? [], 'request.constraints');

  if (!allowedProjects.includes(projectId)) throw new Error('REMOTE_PROJECT_NOT_ALLOWED');
  if (!requestedCapabilities.length) throw new Error('REMOTE_CAPABILITY_REQUIRED');
  if (!requestedCapabilities.every((capability) => allowedCapabilities.includes(capability))) {
    throw new Error('REMOTE_CAPABILITY_NOT_ALLOWED');
  }
  if (scope.some((item) => item !== SAFE_SCOPE)) throw new Error('REMOTE_SCOPE_NOT_ALLOWED');
  if (containsProductionIntent([...scope, ...constraints, objective])) throw new Error('REMOTE_PRODUCTION_INTENT_PROHIBITED');

  const createdMs = Date.parse(createdAt);
  if (!Number.isFinite(createdMs)) throw new Error('REMOTE_CREATED_AT_INVALID');
  const ageMs = now().getTime() - createdMs;
  if (ageMs < -60_000) throw new Error('REMOTE_CREATED_AT_IN_FUTURE');
  if (ageMs > maxAgeMs) throw new Error('REMOTE_REQUEST_STALE');

  return Object.freeze({
    schema_version: 1,
    delivery_id: deliveryId,
    request_id: requestId,
    actor_id: actorId,
    issuer,
    project_id: projectId,
    objective,
    requested_capabilities: Object.freeze([...requestedCapabilities]),
    scope: Object.freeze([...scope]),
    constraints: Object.freeze([
      'DRY_RUN only',
      'autonomy disabled',
      'no production credentials',
      'no external side effects unless separately authorised by existing AgentOS policy',
      ...constraints,
    ]),
    environment: SAFE_ENVIRONMENT,
    created_at: new Date(createdMs).toISOString(),
    // Deliberately absent: authority, consent, granted capabilities, execution status.
    admission_state: 'AWAITING_AUTHORITY',
  });
}

export function claimRemoteDelivery({ candidate, claimedDeliveryIds } = {}) {
  if (!candidate?.delivery_id) throw new TypeError('candidate.delivery_id is required');
  if (!(claimedDeliveryIds instanceof Set)) throw new TypeError('claimedDeliveryIds must be a Set');
  if (claimedDeliveryIds.has(candidate.delivery_id)) {
    return Object.freeze({ claimed: false, disposition: 'DUPLICATE_DELIVERY', delivery_id: candidate.delivery_id });
  }
  claimedDeliveryIds.add(candidate.delivery_id);
  return Object.freeze({ claimed: true, disposition: 'CLAIMED', delivery_id: candidate.delivery_id });
}

export function createRemoteExecutionReceipt({
  candidate,
  missionId,
  taskId,
  wakeTraceId,
  hostId,
  workerId,
  status,
  evidence = [],
  budgetStatus,
  codeIdentity,
  createdAt = new Date().toISOString(),
} = {}) {
  if (!candidate?.delivery_id || !candidate?.request_id) throw new TypeError('candidate identifiers are required');
  for (const [name, value] of Object.entries({ missionId, taskId, wakeTraceId, hostId, workerId, status, budgetStatus, codeIdentity })) {
    requiredString(value, name);
  }
  if (!['AWAITING_GREEN', 'GREEN_BLOCKED', 'COMPLETED', 'FAILED', 'BLOCKED'].includes(status)) {
    throw new Error('REMOTE_RECEIPT_STATUS_INVALID');
  }
  if (!Array.isArray(evidence) || evidence.some((item) => typeof item !== 'string' || !item)) {
    throw new TypeError('evidence must be an array of non-empty strings');
  }
  if (status === 'COMPLETED' && !evidence.length) throw new Error('REMOTE_COMPLETED_REQUIRES_EVIDENCE');

  return Object.freeze({
    schema_version: 1,
    delivery_id: candidate.delivery_id,
    request_id: candidate.request_id,
    project_id: candidate.project_id,
    mission_id: missionId,
    task_id: taskId,
    wake_trace_id: wakeTraceId,
    host_id: hostId,
    worker_id: workerId,
    status,
    budget_status: budgetStatus,
    code_identity: codeIdentity,
    evidence: Object.freeze([...evidence]),
    created_at: requiredString(createdAt, 'createdAt'),
  });
}
