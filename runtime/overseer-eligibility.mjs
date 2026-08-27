// CORE-003: executable Overseer eligibility boundary.
// No provider/model identity can bypass this gate.

import { createCapabilityAdapters, probeAgentCapabilities } from './capability-adapters.mjs';
import { normalizeCapabilities } from './capability-contract.mjs';
import { evaluateAgentCapability, assertAgentEligible } from './agent-capability.mjs';

export async function assessOverseerEligibility(integrations = {}) {
  const adapters = createCapabilityAdapters(integrations);
  const probed = await probeAgentCapabilities(adapters);
  const capabilities = normalizeCapabilities(probed);
  return evaluateAgentCapability(capabilities);
}

export async function assertOverseerEligible(integrations = {}) {
  return assertAgentEligible(await assessOverseerEligibility(integrations));
}
