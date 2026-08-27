// CORE-003: normalize adapter results into the canonical capability contract.
// Kept separate from provider adapters so independently developed adapters can evolve safely.

const ALIASES = Object.freeze({
  githubRead: 'github.read',
  continuityRead: 'continuity.read',
  workspaceRead: 'workspace.read',
  workspaceWrite: 'workspace.write',
  handoff: 'handoff',
});

export function normalizeCapabilities(probeResults = {}) {
  const normalized = {};
  for (const [key, value] of Object.entries(probeResults)) {
    normalized[ALIASES[key] ?? key] = value === true;
  }
  return Object.freeze(normalized);
}
