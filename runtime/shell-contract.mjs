// CORE-001 runtime shell compatibility/integration contract.
// Integration adapters implement probes; canonical eligibility evaluation lives in runtime-shell.mjs.

import { assertCapabilityResults } from './runtime-shell.mjs';
import { normalizeCapabilities } from './capability-contract.mjs';

function capabilityResults(probe = {}) {
  const candidates = [
    probe.evaluation?.results,
    probe.evaluation?.capabilities,
    probe.results,
    probe.capabilities,
  ].filter((candidate) => candidate && typeof candidate === 'object');

  if (candidates.length === 0) return probe;

  const combined = {};
  for (const candidate of candidates) {
    const normalized = normalizeCapabilities(candidate);
    for (const [key, value] of Object.entries(normalized)) {
      if (
        Object.prototype.hasOwnProperty.call(combined, key)
        && combined[key] !== value
      ) {
        const error = new Error(`conflicting capability evidence: ${key}`);
        error.code = 'CAPABILITY_EVIDENCE_CONFLICT';
        error.capability = key;
        throw error;
      }
      combined[key] = value;
    }
  }
  return combined;
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
