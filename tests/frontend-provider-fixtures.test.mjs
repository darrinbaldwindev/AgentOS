import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AFFILIATE_PROGRAM_STATUS,
  FIXTURE_TIME,
  FRONTEND_MODEL_FIXTURES,
  FRONTEND_PROVIDER_FIXTURES,
  PROVIDER_HEALTH_TRANSITIONS,
  rankCapabilityFit,
} from "../fixtures/frontend-provider-fixtures.mjs";

assert.equal(FRONTEND_PROVIDER_FIXTURES.length, 6);
assert.equal(FRONTEND_MODEL_FIXTURES.length, 6);
assert.equal(new Set(FRONTEND_PROVIDER_FIXTURES.map((provider) => provider.id)).size, 6);
assert.equal(new Set(FRONTEND_MODEL_FIXTURES.map((model) => model.id)).size, 6);

const affiliateStatuses = new Set(FRONTEND_PROVIDER_FIXTURES.map((provider) => provider.affiliate.status));
for (const status of Object.values(AFFILIATE_PROGRAM_STATUS)) {
  assert.equal(affiliateStatuses.has(status), true, `fixture catalog is missing ${status} affiliate status coverage`);
}

assert.equal(FRONTEND_PROVIDER_FIXTURES.some((provider) => provider.kind === "local"), true);
assert.equal(FRONTEND_PROVIDER_FIXTURES.some((provider) => provider.freeTier), true);
assert.equal(FRONTEND_PROVIDER_FIXTURES.some((provider) => provider.affiliate.status === "verified"), true);
assert.equal(FRONTEND_PROVIDER_FIXTURES.some((provider) => provider.affiliate.status === "none"), true);
assert.equal(FRONTEND_PROVIDER_FIXTURES.some((provider) => provider.affiliate.status === "unverified"), true);
assert.equal(FRONTEND_PROVIDER_FIXTURES.some((provider) => provider.affiliate.status === "expired"), true);

for (const model of FRONTEND_MODEL_FIXTURES) {
  assert.equal(FRONTEND_PROVIDER_FIXTURES.some((provider) => provider.id === model.providerId), true, `${model.id} references a known provider`);
}

const transitionStates = new Set(PROVIDER_HEALTH_TRANSITIONS.flatMap((transition) => [transition.from, transition.to]));
for (const state of [
  "available",
  "needs_connection",
  "limited",
  "offline",
  "permission_denied",
  "rate_limited",
  "degraded",
  "error",
]) {
  assert.equal(transitionStates.has(state), true, `fixture transitions are missing ${state}`);
}
assert.equal(PROVIDER_HEALTH_TRANSITIONS.every((transition) => transition.observedAt >= FIXTURE_TIME), true);

const ranked = rankCapabilityFit({ tools: true, vision: true, json: true, streaming: true });
assert.equal(ranked.length, FRONTEND_MODEL_FIXTURES.length);
assert.equal(ranked[0].providerId, "fixture-provider-neutral", "capability fit and healthy state must outrank an affiliate-supported degraded equivalent");
assert.equal(ranked[1].providerId, "fixture-provider-affiliate");
assert.equal(ranked[0].affiliateStatus, AFFILIATE_PROGRAM_STATUS.NONE);
assert.equal(ranked[1].affiliateStatus, AFFILIATE_PROGRAM_STATUS.VERIFIED);

const noRequirements = rankCapabilityFit();
assert.deepEqual(
  noRequirements.map((entry) => entry.modelId),
  rankCapabilityFit().map((entry) => entry.modelId),
  "ranking must be deterministic",
);
assert.equal(Object.isFrozen(ranked), true);
assert.equal(Object.isFrozen(FRONTEND_PROVIDER_FIXTURES), true);
assert.equal(Object.isFrozen(FRONTEND_MODEL_FIXTURES), true);
assert.equal(Object.isFrozen(PROVIDER_HEALTH_TRANSITIONS), true);

const source = readFileSync(resolve("fixtures/frontend-provider-fixtures.mjs"), "utf8");
const scoringBlock = source.match(/const score\s*=\s*[\s\S]*?;\n\n\s*return Object\.freeze/);
assert.ok(scoringBlock, "fixture source must expose a bounded score calculation");
assert.equal(/affiliate/i.test(scoringBlock[0]), false, "affiliate metadata must not influence capability scoring");
for (const prohibitedPattern of [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /\bhttps?:\/\//, /\bprocess\.env\b/]) {
  assert.equal(prohibitedPattern.test(source), false, `fixture source must remain local-only: ${prohibitedPattern}`);
}

console.log("Frontend fixture validation passed: category coverage, health transitions, deterministic ranking, capability-first behavior, and local-only safeguards verified.");
