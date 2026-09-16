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
    const canonicalKey = ALIASES[key] ?? key;
    const canonicalValue = value === true;
    if (
      Object.prototype.hasOwnProperty.call(normalized, canonicalKey)
      && normalized[canonicalKey] !== canonicalValue
    ) {
      const error = new Error(`conflicting capability evidence: ${canonicalKey}`);
      error.code = 'CAPABILITY_EVIDENCE_CONFLICT';
      error.capability = canonicalKey;
      throw error;
    }
    normalized[canonicalKey] = canonicalValue;
  }
  return Object.freeze(normalized);
}
