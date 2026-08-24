// AgentOS provider/agent eligibility contract.
// An agent is not execution-eligible until canonical project state is reachable.

export const CAPABILITIES = Object.freeze([
  'github.read',
  'github.write',
  'workspace.read',
  'workspace.write',
  'continuity.read',
  'continuity.write',
  'handoff',
]);

export function evaluateAgentCapability(probe = {}) {
  const required = ['github.read', 'continuity.read', 'handoff'];
  const results = Object.freeze(Object.fromEntries(CAPABILITIES.map((capability) => [capability, probe[capability] === true])));
  const missingRequired = Object.freeze(required.filter((capability) => !results[capability]));
  return Object.freeze({
    eligible: missingRequired.length === 0,
    results,
    missingRequired,
    localPreferred: results['workspace.read'] === true && results['workspace.write'] === true,
  });
}

export function assertAgentEligible(evaluation) {
  if (!evaluation?.eligible) {
    const error = new Error(`agent is not AgentOS execution-eligible: ${(evaluation?.missingRequired ?? []).join(', ')}`);
    error.code = 'AGENT_NOT_ELIGIBLE';
    throw error;
  }
  return evaluation;
}
