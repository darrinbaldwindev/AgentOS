// Fail-closed pickup gate for an already-authorised remote delivery.
// This module does not authenticate callers, grant authority, claim deliveries,
// or execute workers. It is the local-host recheck before an existing scheduler
// may hand an admitted task to the canonical AgentOS dispatch path.

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

function hasProductionIntent(values = []) {
  return values.some((value) => /\bproduction\b|prod(?:uction)?\s+write|live\s+(?:write|deploy|credential)/i.test(value));
}

export function evaluateRemotePickupEligibility({
  admittedTask,
  hostIdentity,
  hostCapabilities = [],
  now = () => new Date(),
  maxQueueAgeMs = 30 * 60 * 1000,
} = {}) {
  if (!Number.isFinite(maxQueueAgeMs) || maxQueueAgeMs <= 0) throw new TypeError('maxQueueAgeMs must be > 0');
  const nowMs = now().getTime();
  if (!Number.isFinite(nowMs)) throw new TypeError('now must return a valid Date');
  if (!admittedTask || typeof admittedTask !== 'object' || Array.isArray(admittedTask)) {
    throw new TypeError('admittedTask is required');
  }
  if (!hostIdentity || typeof hostIdentity !== 'object') throw new TypeError('hostIdentity is required');

  const taskId = requiredString(admittedTask.task_id, 'admittedTask.task_id');
  const missionId = requiredString(admittedTask.mission_id, 'admittedTask.mission_id');
  const deliveryId = requiredString(admittedTask.delivery_id, 'admittedTask.delivery_id');
  const requestId = requiredString(admittedTask.request_id, 'admittedTask.request_id');
  const projectId = requiredString(admittedTask.project_id, 'admittedTask.project_id');
  const targetHostId = requiredString(admittedTask.target_host_id, 'admittedTask.target_host_id');
  const hostId = requiredString(hostIdentity.host_id, 'hostIdentity.host_id');
  const admittedBy = requiredString(admittedTask.admitted_by, 'admittedTask.admitted_by');
  const environment = requiredString(admittedTask.environment, 'admittedTask.environment');
  const pickupState = requiredString(admittedTask.pickup_state, 'admittedTask.pickup_state');
  const createdAt = requiredString(admittedTask.created_at, 'admittedTask.created_at');
  const requiredCapabilities = stringArray(admittedTask.required_capabilities ?? [], 'admittedTask.required_capabilities');
  const localCapabilities = stringArray(hostCapabilities, 'hostCapabilities');
  const scope = stringArray(admittedTask.scope ?? [], 'admittedTask.scope');
  const constraints = stringArray(admittedTask.constraints ?? [], 'admittedTask.constraints');

  const base = {
    task_id: taskId,
    mission_id: missionId,
    delivery_id: deliveryId,
    request_id: requestId,
    project_id: projectId,
    host_id: hostId,
    admitted_by: admittedBy,
  };

  if (admittedTask.authority_admitted !== true) {
    return Object.freeze({ ...base, eligible: false, disposition: 'AUTHORITY_NOT_ADMITTED' });
  }
  if (pickupState === 'SUPERSEDED') {
    return Object.freeze({ ...base, eligible: false, disposition: 'SUPERSEDED' });
  }
  if (pickupState !== 'QUEUED') {
    return Object.freeze({ ...base, eligible: false, disposition: 'PICKUP_STATE_NOT_QUEUED' });
  }
  if (environment !== 'DRY_RUN') {
    return Object.freeze({ ...base, eligible: false, disposition: 'ENVIRONMENT_NOT_SAFE' });
  }
  if (targetHostId !== hostId) {
    return Object.freeze({ ...base, eligible: false, disposition: 'HOST_MISMATCH' });
  }
  if (!requiredCapabilities.length) {
    return Object.freeze({ ...base, eligible: false, disposition: 'CAPABILITY_REQUIRED' });
  }
  if (!requiredCapabilities.every((capability) => localCapabilities.includes(capability))) {
    return Object.freeze({ ...base, eligible: false, disposition: 'HOST_CAPABILITY_MISMATCH' });
  }
  if (hasProductionIntent([...scope, ...constraints])) {
    return Object.freeze({ ...base, eligible: false, disposition: 'PRODUCTION_SCOPE_PROHIBITED' });
  }

  const createdMs = Date.parse(createdAt);
  if (!Number.isFinite(createdMs)) {
    return Object.freeze({ ...base, eligible: false, disposition: 'CREATED_AT_INVALID' });
  }
  const ageMs = nowMs - createdMs;
  if (ageMs < -60_000) {
    return Object.freeze({ ...base, eligible: false, disposition: 'CREATED_AT_IN_FUTURE' });
  }
  if (ageMs > maxQueueAgeMs) {
    return Object.freeze({ ...base, eligible: false, disposition: 'QUEUE_ENTRY_STALE' });
  }

  return Object.freeze({
    ...base,
    eligible: true,
    disposition: 'ELIGIBLE_FOR_PICKUP',
    required_capabilities: Object.freeze([...requiredCapabilities]),
    environment,
  });
}
