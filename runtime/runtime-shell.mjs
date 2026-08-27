// CORE-003: local runtime shell eligibility boundary.
// The shell consumes the canonical capability contract; provider identity never implies capability.

import { evaluateAgentCapability, assertAgentEligible } from './agent-capability.mjs';
import { normalizeCapabilities } from './capability-contract.mjs';

export function createRuntimeShell({ probes = {} } = {}) {
  async function probeCapabilities() {
    const results = {};
    for (const [name, probe] of Object.entries(probes)) {
      if (typeof probe !== 'function') throw new TypeError(`capability probe must be a function: ${name}`);
      results[name] = (await probe()) === true;
    }
    return normalizeCapabilities(results);
  }

  async function assessEligibility() {
    return evaluateAgentCapability(await probeCapabilities());
  }

  async function assertExecutionEligible() {
    return assertAgentEligible(await assessEligibility());
  }

  return Object.freeze({ probeCapabilities, assessEligibility, assertExecutionEligible });
}
