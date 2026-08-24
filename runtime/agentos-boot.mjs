// CORE-002: first end-to-end AgentOS boot orchestration.
// Overseer is restored/created before model routing or worker execution.

import { bootstrapOverseer, activateOverseer } from './overseer-bootstrap.mjs';

export async function bootAgentOS({ persistence, capabilityProbe, modelRegistry, continuityCheck, now }) {
  if (!persistence || !capabilityProbe || !modelRegistry || !continuityCheck) {
    throw new TypeError('persistence, capabilityProbe, modelRegistry and continuityCheck are required');
  }

  const continuity = await continuityCheck();
  if (!continuity?.ok) throw new Error('CONTINUITY_CHECK_FAILED');

  const boot = await bootstrapOverseer({ persistence, now });
  const capabilities = await capabilityProbe.probe(boot.agent.id);
  if (!capabilities?.evaluation?.eligible) throw new Error('OVERSEER_NOT_ELIGIBLE');

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
    capabilities,
    models,
  });
}
