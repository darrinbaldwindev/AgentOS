// Profile-scoped resource access boundary.
// This validator does not authenticate a profile or move data. It only rejects
// access when a resource is not explicitly scoped to the active profile.

const RESOURCE_KINDS = Object.freeze([
  'memory',
  'file',
  'credential',
  'browser-session',
  'connection',
  'project',
]);

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

export function evaluateProfileResourceAccess({
  activeProfileId,
  resourceProfileId,
  resourceKind,
} = {}) {
  activeProfileId = requiredString(activeProfileId, 'activeProfileId');
  resourceProfileId = requiredString(resourceProfileId, 'resourceProfileId');
  resourceKind = requiredString(resourceKind, 'resourceKind');

  if (!RESOURCE_KINDS.includes(resourceKind)) {
    const error = new Error(`unsupported profile resource kind: ${resourceKind}`);
    error.code = 'PROFILE_RESOURCE_KIND_INVALID';
    throw error;
  }

  const allowed = activeProfileId === resourceProfileId;
  return Object.freeze({
    activeProfileId,
    resourceProfileId,
    resourceKind,
    allowed,
    reason: allowed ? 'PROFILE_MATCH' : 'CROSS_PROFILE_RESOURCE_DENIED',
  });
}

export function assertProfileResourceAccess(input) {
  const decision = evaluateProfileResourceAccess(input);
  if (!decision.allowed) {
    const error = new Error(`cross-profile ${decision.resourceKind} access denied`);
    error.code = 'CROSS_PROFILE_RESOURCE_DENIED';
    error.decision = decision;
    throw error;
  }
  return decision;
}

export function partitionProfileResources({ activeProfileId, resources = [] } = {}) {
  activeProfileId = requiredString(activeProfileId, 'activeProfileId');
  if (!Array.isArray(resources)) throw new TypeError('resources must be an array');

  const allowed = [];
  const denied = [];

  for (const resource of resources) {
    if (!resource || typeof resource !== 'object') throw new TypeError('resources must contain objects');
    const decision = evaluateProfileResourceAccess({
      activeProfileId,
      resourceProfileId: resource.profileId,
      resourceKind: resource.kind,
    });
    (decision.allowed ? allowed : denied).push(Object.freeze({ resource, decision }));
  }

  return Object.freeze({
    activeProfileId,
    allowed: Object.freeze(allowed),
    denied: Object.freeze(denied),
  });
}

export const PROFILE_RESOURCE_KINDS = RESOURCE_KINDS;
