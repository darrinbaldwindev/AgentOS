import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateProviderHealth, HEALTH_STATE_KINDS, listProviderHealthPolicies } from "../policy/provider-health-policy.mjs";

const policyDocument = readFileSync(resolve("policy/PROVIDER_HEALTH_POLICY.md"), "utf8");
const NOW = 1_725_000_000_000;

assert.deepEqual(HEALTH_STATE_KINDS, [
  "available",
  "needs_connection",
  "limited",
  "offline",
  "permission_denied",
  "rate_limited",
  "degraded",
  "error",
]);

const policyList = listProviderHealthPolicies();
assert.equal(policyList.length, 8);
assert.equal(new Set(policyList.map((entry) => entry.state)).size, 8);
for (const entry of policyList) {
  assert.equal(entry.automaticRetry, false, `${entry.state} must not retry automatically`);
  assert.equal(entry.invokesProvider, false, `${entry.state} must not invoke a provider`);
  assert.equal(entry.persistsState, false, `${entry.state} must not persist state`);
}

const fresh = evaluateProviderHealth({ kind: "available", observedAt: NOW - 5 * 60 * 1_000 }, { now: NOW });
assert.equal(fresh.freshness.label, "fresh");
assert.equal(fresh.recommendation, "eligible_only_with_reported_freshness_label");

const aging = evaluateProviderHealth({ kind: "degraded", observedAt: NOW - 6 * 60 * 1_000 }, { now: NOW });
assert.equal(aging.freshness.label, "aging");
assert.equal(aging.requiresConfirmation, true);

const staleAvailable = evaluateProviderHealth({ kind: "available", observedAt: NOW - 2 * 60 * 60 * 1_000 }, { now: NOW });
assert.equal(staleAvailable.freshness.label, "stale");
assert.equal(staleAvailable.recommendation, "do_not_assume_availability_offer_explicit_recheck_or_local_preview");

const expiredAvailable = evaluateProviderHealth({ kind: "available", observedAt: NOW - 25 * 60 * 60 * 1_000 }, { now: NOW });
assert.equal(expiredAvailable.freshness.label, "expired");
assert.equal(expiredAvailable.recommendation, "do_not_assume_availability_offer_explicit_recheck_or_local_preview");

const unknownAvailable = evaluateProviderHealth({ kind: "available" }, { now: NOW });
assert.equal(unknownAvailable.freshness.label, "unknown");
assert.equal(unknownAvailable.recommendation, "do_not_assume_availability_offer_explicit_recheck_or_local_preview");

const limited = evaluateProviderHealth({ kind: "limited", observedAt: NOW }, { now: NOW });
assert.equal(limited.recommendation, "show_plan_or_quota_limit_and_offer_non_provider_alternative");

const offline = evaluateProviderHealth({ kind: "offline", observedAt: NOW, retryAfterSeconds: 30 }, { now: NOW });
assert.equal(offline.retryAfterSeconds, 30);
assert.equal(offline.recommendation, "show_offline_status_and_preview_non_provider_alternative");

const rateLimited = evaluateProviderHealth({ kind: "rate_limited", observedAt: NOW, retryAfterSeconds: 60 }, { now: NOW });
assert.equal(rateLimited.retryAfterSeconds, 60);
assert.equal(rateLimited.automaticRetry, false);

const denied = evaluateProviderHealth({ kind: "permission_denied", observedAt: NOW }, { now: NOW });
assert.equal(denied.requiresConfirmation, true);
assert.equal(denied.recommendation, "request_owner_permission_review_without_retrying");

assert.throws(() => evaluateProviderHealth({ kind: "available", observedAt: -1 }, { now: NOW }), /observedAt/);
assert.throws(() => evaluateProviderHealth({ kind: "rate_limited", observedAt: NOW, retryAfterSeconds: 1.5 }, { now: NOW }), /retryAfterSeconds/);
assert.throws(() => evaluateProviderHealth({ kind: "unknown_state", observedAt: NOW }, { now: NOW }), /Unsupported health state/);

for (const result of [fresh, aging, staleAvailable, expiredAvailable, unknownAvailable, limited, offline, rateLimited, denied]) {
  assert.equal(result.source, "local_policy");
  assert.equal(result.invokesProvider, false);
  assert.equal(result.persistsState, false);
}

for (const requiredText of [
  "Absence is not availability",
  "stale",
  "expired",
  "unknown",
  "No automatic retry",
  "capability-first",
  "do_not_assume_availability_offer_explicit_recheck_or_local_preview",
]) {
  assert.equal(policyDocument.includes(requiredText), true, `policy document is missing ${requiredText}`);
}

console.log("Provider health policy validation passed: 8 states, freshness labels, stale-availability suppression, retry-after handling, deterministic recommendations, and no-invocation safeguards verified.");
