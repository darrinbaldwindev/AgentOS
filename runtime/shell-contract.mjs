// CORE-001 runtime shell compatibility/integration contract.
// Integration adapters implement probes; canonical eligibility evaluation lives in runtime-shell.mjs.

import { assertCapabilityResults } from './runtime-shell.mjs';

function capabilityResults(probe = {}) {
  return probe.evaluation?.results
    ?? probe.evaluation?.capabilities
    ?? probe.results
    ?? probe.capabilities
    ?? probe;
}

export function createRuntimeShell({ capabilityProbe, workspaceAdapter = null, githubAdapter = null }) {
  if (!capabilityProbe || typeof capabilityProbe.probe !== 'function') throw new TypeError('capabilityProbe.probe is required');

  async function inspectAgent(agentId) {
    const probe = await capabilityProbe.probe(agentId);
    return Object.freeze({ agentId, probe: Object.freeze({ ...probe }) });
  }

  async function authorize(agentId) {
    const inspection = await inspectAgent(agentId);
    const evaluation = assertCapabilityResults(capabilityResults(inspection.probe));
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
