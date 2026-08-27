// CORE-003: canonical machine-state contract.
// The runtime reads one explicit state location; other coordination documents are history/specification.

const REQUIRED = ['schemaVersion', 'system', 'stateAuthority', 'status'];

export function validateCanonicalState(state) {
  if (!state || typeof state !== 'object') throw new TypeError('state must be an object');
  for (const key of REQUIRED) {
    if (state[key] === undefined || state[key] === null || state[key] === '') {
      throw new Error(`CANONICAL_STATE_MISSING:${key}`);
    }
  }
  if (state.system !== 'AgentOS') throw new Error('CANONICAL_STATE_SYSTEM_MISMATCH');
  if (state.stateAuthority !== '.agentos/state') throw new Error('CANONICAL_STATE_AUTHORITY_MISMATCH');
  return Object.freeze({ ...state });
}

export function createCanonicalStateReader({ read }) {
  if (typeof read !== 'function') throw new TypeError('read function is required');
  return Object.freeze({
    async current() {
      const state = await read('.agentos/state/current.json');
      return validateCanonicalState(state);
    },
    async agents() {
      return read('.agentos/state/agents.json');
    },
    async missions() {
      return read('.agentos/state/missions.json');
    },
    async decisions() {
      return read('.agentos/state/decisions.json');
    },
  });
}
