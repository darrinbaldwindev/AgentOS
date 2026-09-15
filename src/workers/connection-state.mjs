export const CONNECTION_STATES = Object.freeze([
  'unconfigured',
  'discovering',
  'available',
  'authenticated',
  'healthy',
  'degraded',
  'offline',
  'error',
]);

export function createConnectionState(workerId, patch = {}) {
  if (!workerId) throw new TypeError('workerId is required');
  const state = patch.state ?? 'unconfigured';
  if (!CONNECTION_STATES.includes(state)) throw new Error(`invalid connection state: ${state}`);
  return Object.freeze({
    workerId,
    state,
    capabilities: patch.capabilities ?? [],
    checkedAt: patch.checkedAt ?? null,
    errorCode: patch.errorCode ?? null,
  });
}
