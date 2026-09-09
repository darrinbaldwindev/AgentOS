export const INTEGRATION_STATES = Object.freeze([
  'healthy',
  'degraded',
  'auth_required',
  'permission_denied',
  'plan_limited',
  'quota_limited',
  'rate_limited',
  'unavailable',
  'stale',
]);

const STATE_SET = new Set(INTEGRATION_STATES);

export function classifyIntegrationCapability(input = {}) {
  const {
    provider,
    capability,
    installed = false,
    authenticated = false,
    probeOk = false,
    permissionOk = true,
    planOk = true,
    quotaRemaining = null,
    rateLimited = false,
    stale = false,
    evidence = [],
  } = input;

  if (!provider || !capability) throw new TypeError('provider and capability are required');

  let state = 'healthy';
  let usable = true;
  let ownerActionRequired = false;

  if (stale) {
    state = 'stale';
    usable = false;
  } else if (!installed || !probeOk) {
    state = 'unavailable';
    usable = false;
  } else if (!authenticated) {
    state = 'auth_required';
    usable = false;
    ownerActionRequired = true;
  } else if (!permissionOk) {
    state = 'permission_denied';
    usable = false;
    ownerActionRequired = true;
  } else if (!planOk) {
    state = 'plan_limited';
    usable = false;
  } else if (quotaRemaining === 0) {
    state = 'quota_limited';
    usable = false;
  } else if (rateLimited) {
    state = 'rate_limited';
    usable = false;
  }

  return Object.freeze({
    provider,
    capability,
    state,
    usable,
    ownerActionRequired,
    evidence: Object.freeze([...evidence]),
  });
}

export function summarizeIntegrationHealth(capabilities = []) {
  if (!Array.isArray(capabilities)) throw new TypeError('capabilities must be an array');
  for (const item of capabilities) {
    if (!item || !STATE_SET.has(item.state)) throw new TypeError('invalid integration capability state');
  }

  const usable = capabilities.filter((item) => item.usable);
  const blocked = capabilities.filter((item) => !item.usable);
  const ownerActions = blocked.filter((item) => item.ownerActionRequired);

  return Object.freeze({
    total: capabilities.length,
    usable: usable.length,
    blocked: blocked.length,
    ownerActionRequired: ownerActions.length,
    allHealthy: capabilities.length > 0 && blocked.length === 0,
    capabilities: Object.freeze([...capabilities]),
  });
}
