// CORE-001 hardening: explicit, provider-neutral mission context snapshots.
// Snapshots contain operational state only; callers must not place prompts,
// credentials, API keys, private repository contents, or secret tool payloads here.

const FORBIDDEN_KEYS = new Set(['prompt', 'secret', 'password', 'token', 'apiKey', 'credential', 'privateKey']);

function assertSafe(value, path = 'context') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error(`forbidden context field: ${path}.${key}`);
    if (child && typeof child === 'object') assertSafe(child, `${path}.${key}`);
  }
}

export function createContextSnapshot({ runId, mission, providerId, status, completedSteps = [], variables = {} }) {
  if (!runId || !mission || !status) throw new TypeError('runId, mission and status are required');
  const snapshot = {
    version: 1,
    runId,
    mission,
    providerId: providerId ?? null,
    status,
    completedSteps: [...completedSteps],
    variables: { ...variables },
  };
  assertSafe(snapshot);
  return Object.freeze(snapshot);
}

export { assertSafe };
