// CORE-001 runtime shell contract.
// Integration adapters implement the probes; the core only consumes results.

import { assertAgentEligible } from './agent-capability.mjs';

export function createRuntimeShell({ capabilityProbe, workspaceAdapter = null, githubAdapter = null }) {
  if (!capabilityProbe || typeof capabilityProbe.probe !== 'function') throw new TypeError('capabilityProbe.probe is required');

  async function inspectAgent(agentId) {
    const probe = await capabilityProbe.probe(agentId);
    return Object.freeze({ agentId, probe: Object.freeze({ ...probe }) });
  }

  async function authorize(agentId) {
    const inspection = await inspectAgent(agentId);
    const evaluation = assertAgentEligible(inspection.probe.evaluation ?? inspection.probe);
    return Object.freeze({
      agentId,
      mode: evaluation.localPreferred ? 'local-preferred' : 'github',
      evaluation,
    });
  }

  function adapters() {
    return Object.freeze({
      workspace: workspaceAdapter,
      github: githubAdapter,
    });
  }

  return Object.freeze({ inspectAgent, authorize, adapters });
}
