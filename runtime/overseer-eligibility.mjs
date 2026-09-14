// CORE-003: executable Overseer eligibility boundary.
// No provider/model identity can bypass this gate.

import { createCapabilityAdapters, probeAgentCapabilities } from './capability-adapters.mjs';
import { evaluateCapabilityResults, assertCapabilityResults } from './runtime-shell.mjs';

export async function assessOverseerEligibility(integrations = {}) {
  const adapters = createCapabilityAdapters(integrations);
  const probed = await probeAgentCapabilities(adapters);
  return evaluateCapabilityResults(probed);
}

export async function assertOverseerEligible(integrations = {}) {
  const adapters = createCapabilityAdapters(integrations);
  const probed = await probeAgentCapabilities(adapters);
  return assertCapabilityResults(probed);
}
