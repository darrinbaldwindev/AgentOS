// AgentOS connectivity health model. Probes are supplied by the integration adapter.

import { evaluateAgentCapability } from './agent-capability.mjs';

export function createAgentHealthReport({ agentId, probe }) {
  if (!agentId || typeof probe !== 'object') throw new TypeError('agentId and probe are required');
  const capability = evaluateAgentCapability(probe);
  return Object.freeze({
    agentId,
    status: capability.eligible ? (capability.localPreferred ? 'ready-local' : 'ready-github') : 'blocked',
    capability,
  });
}
