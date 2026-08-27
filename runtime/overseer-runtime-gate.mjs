// CORE-003: enforce capability eligibility immediately before an Overseer execution.
// The gate is intentionally separate from bootstrap: identity can exist while execution is blocked.

import { assertOverseerEligible } from './overseer-eligibility.mjs';

export async function assertOverseerExecutionAllowed({ integrations }) {
  return assertOverseerEligible(integrations);
}
