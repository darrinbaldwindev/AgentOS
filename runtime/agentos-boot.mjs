// CORE-002: first end-to-end AgentOS boot orchestration.
// Overseer is restored/created before model routing or worker execution.

import { bootstrapOverseer, activateOverseer } from './overseer-bootstrap.mjs';
import { assertCapabilityResults } from './runtime-shell.mjs';

function capabilityResults(probe = {}) {
  return probe.evaluation?.results
    ?? probe.evaluation?.capabilities
    ?? probe.results
    ?? probe.capabilities
    ?? null;
}

export function assertBootCapabilities(probe = {}) {
  const results = capabilityResults(probe);
  if (results) return assertCapabilityResults(results);

  // Compatibility is limited to the historical local DRY_RUN fixture. It is not
  // physical capability evidence and must never be accepted for a general boot.
  if (probe.mode === 'DRY_RUN' && probe.evaluation?.eligible === true) {
    return Object.freeze({
      eligible: true,
      results: Object.freeze({}),
      missingRequired: Object.freeze([]),
      localPreferred: false,
      evidenceClass: 'legacy-dry-run-fixture',
    });
  }

  const error = new Error('OVERSEER_CAPABILITY_EVIDENCE_REQUIRED');
  error.code = 'OVERSEER_CAPABILITY_EVIDENCE_REQUIRED';
  throw error;
}

export async function bootAgentOS({ persistence, capabilityProbe, modelRegistry, continuityCheck, now }) {
  if (!persistence || !capabilityProbe || !modelRegistry || !continuityCheck) {
    throw new TypeError('persistence, capabilityProbe, modelRegistry and continuityCheck are required');
  }

  const continuity = await continuityCheck();
  if (!continuity?.ok) throw new Error('CONTINUITY_CHECK_FAILED');

  const boot = await bootstrapOverseer({ persistence, now });
  const capabilities = await capabilityProbe.probe(boot.agent.id);
  const evaluation = assertBootCapabilities(capabilities);

  const models = await modelRegistry.listAvailable();
  const overseer = await activateOverseer({ persistence, now });

  await persistence.create('event', {
    agentId: overseer.id,
    eventType: 'agentos.boot.completed',
    overseerCreated: boot.created,
    availableModelCount: models.length,
  });

  return Object.freeze({
    status: 'online',
    overseer,
    capabilities: Object.freeze({ ...capabilities, evaluation }),
    models,
  });
}
