/**
 * Deterministic frontend test fixtures — B3
 *
 * These fixture records are synthetic local data. They do not make claims about
 * live providers, eligibility, pricing, program terms, availability, or quotas.
 * Capability fit and integration health drive the recommendation helper; affiliate
 * metadata is display-only and deliberately has no ranking effect.
 */

export const FIXTURE_TIME = 1_725_000_000_000;

export const AFFILIATE_PROGRAM_STATUS = Object.freeze({
  NONE: "none",
  VERIFIED: "verified",
  UNVERIFIED: "unverified",
  EXPIRED: "expired",
});

const provider = (record) => Object.freeze(record);
const model = (record) => Object.freeze(record);

export const FRONTEND_PROVIDER_FIXTURES = Object.freeze([
  provider({
    id: "fixture-provider-local",
    displayName: "Local Runtime",
    kind: "local",
    freeTier: true,
    affiliate: Object.freeze({ status: AFFILIATE_PROGRAM_STATUS.NONE, disclosureRequired: false }),
    health: Object.freeze({ kind: "available", observedAt: FIXTURE_TIME, lastSuccessfulAt: FIXTURE_TIME }),
    capabilities: Object.freeze({ streaming: true, tools: true, vision: false, jsonMode: true }),
  }),
  provider({
    id: "fixture-provider-free",
    displayName: "Free Community Gateway",
    kind: "gateway",
    freeTier: true,
    affiliate: Object.freeze({ status: AFFILIATE_PROGRAM_STATUS.NONE, disclosureRequired: false }),
    health: Object.freeze({ kind: "rate_limited", observedAt: FIXTURE_TIME, retryAfterSeconds: 60 }),
    capabilities: Object.freeze({ streaming: true, tools: true, vision: true, jsonMode: true }),
  }),
  provider({
    id: "fixture-provider-affiliate",
    displayName: "Verified Credit Provider",
    kind: "cloud",
    freeTier: false,
    affiliate: Object.freeze({ status: AFFILIATE_PROGRAM_STATUS.VERIFIED, disclosureRequired: true }),
    health: Object.freeze({ kind: "degraded", observedAt: FIXTURE_TIME, lastSuccessfulAt: FIXTURE_TIME - 60_000 }),
    capabilities: Object.freeze({ streaming: true, tools: true, vision: true, jsonMode: true }),
  }),
  provider({
    id: "fixture-provider-neutral",
    displayName: "Non-Affiliate Integration",
    kind: "cloud",
    freeTier: false,
    affiliate: Object.freeze({ status: AFFILIATE_PROGRAM_STATUS.NONE, disclosureRequired: false }),
    health: Object.freeze({ kind: "available", observedAt: FIXTURE_TIME, lastSuccessfulAt: FIXTURE_TIME }),
    capabilities: Object.freeze({ streaming: true, tools: true, vision: true, jsonMode: true }),
  }),
  provider({
    id: "fixture-provider-unverified",
    displayName: "Unverified Program Provider",
    kind: "cloud",
    freeTier: false,
    affiliate: Object.freeze({ status: AFFILIATE_PROGRAM_STATUS.UNVERIFIED, disclosureRequired: true }),
    health: Object.freeze({ kind: "needs_connection", observedAt: FIXTURE_TIME, diagnosticCode: "CONNECTION_REQUIRED" }),
    capabilities: Object.freeze({ streaming: true, tools: false, vision: false, jsonMode: false }),
  }),
  provider({
    id: "fixture-provider-expired",
    displayName: "Expired Program Provider",
    kind: "cloud",
    freeTier: false,
    affiliate: Object.freeze({ status: AFFILIATE_PROGRAM_STATUS.EXPIRED, disclosureRequired: true }),
    health: Object.freeze({ kind: "limited", observedAt: FIXTURE_TIME, diagnosticCode: "PLAN_LIMIT" }),
    capabilities: Object.freeze({ streaming: false, tools: false, vision: true, jsonMode: false }),
  }),
]);

export const FRONTEND_MODEL_FIXTURES = Object.freeze([
  model({
    id: "fixture-model-local-coder",
    providerId: "fixture-provider-local",
    displayName: "Local Coder 13B",
    contextWindow: 32_768,
    maxOutputTokens: 4_096,
    capabilities: Object.freeze({ tools: true, vision: false, json: true, systemPrompt: true }),
    tags: Object.freeze(["local", "private", "coding"]),
    active: true,
  }),
  model({
    id: "fixture-model-free-vision",
    providerId: "fixture-provider-free",
    displayName: "Free Vision 8B",
    contextWindow: 16_384,
    maxOutputTokens: 2_048,
    capabilities: Object.freeze({ tools: true, vision: true, json: true, systemPrompt: true }),
    tags: Object.freeze(["free-tier", "vision", "tools"]),
    active: true,
  }),
  model({
    id: "fixture-model-affiliate-generalist",
    providerId: "fixture-provider-affiliate",
    displayName: "Credit Generalist 30B",
    contextWindow: 64_000,
    maxOutputTokens: 8_192,
    capabilities: Object.freeze({ tools: true, vision: true, json: true, systemPrompt: true }),
    tags: Object.freeze(["balanced", "streaming"]),
    active: true,
  }),
  model({
    id: "fixture-model-neutral-generalist",
    providerId: "fixture-provider-neutral",
    displayName: "Neutral Generalist 30B",
    contextWindow: 64_000,
    maxOutputTokens: 8_192,
    capabilities: Object.freeze({ tools: true, vision: true, json: true, systemPrompt: true }),
    tags: Object.freeze(["balanced", "streaming"]),
    active: true,
  }),
  model({
    id: "fixture-model-unverified-basic",
    providerId: "fixture-provider-unverified",
    displayName: "Unverified Basic 7B",
    contextWindow: 8_192,
    maxOutputTokens: 1_024,
    capabilities: Object.freeze({ tools: false, vision: false, json: false, systemPrompt: true }),
    tags: Object.freeze(["unverified"]),
    active: false,
  }),
  model({
    id: "fixture-model-expired-vision",
    providerId: "fixture-provider-expired",
    displayName: "Expired Vision 12B",
    contextWindow: 12_288,
    maxOutputTokens: 2_048,
    capabilities: Object.freeze({ tools: false, vision: true, json: false, systemPrompt: true }),
    tags: Object.freeze(["expired-program"]),
    active: false,
  }),
]);

export const PROVIDER_HEALTH_TRANSITIONS = Object.freeze([
  Object.freeze({ providerId: "fixture-provider-local", from: "available", to: "available", observedAt: FIXTURE_TIME }),
  Object.freeze({ providerId: "fixture-provider-free", from: "available", to: "rate_limited", observedAt: FIXTURE_TIME + 1_000, retryAfterSeconds: 60 }),
  Object.freeze({ providerId: "fixture-provider-free", from: "rate_limited", to: "available", observedAt: FIXTURE_TIME + 61_000 }),
  Object.freeze({ providerId: "fixture-provider-affiliate", from: "available", to: "degraded", observedAt: FIXTURE_TIME + 2_000 }),
  Object.freeze({ providerId: "fixture-provider-affiliate", from: "degraded", to: "available", observedAt: FIXTURE_TIME + 62_000 }),
  Object.freeze({ providerId: "fixture-provider-neutral", from: "available", to: "offline", observedAt: FIXTURE_TIME + 3_000, retryAfterSeconds: 30 }),
  Object.freeze({ providerId: "fixture-provider-neutral", from: "offline", to: "available", observedAt: FIXTURE_TIME + 33_000 }),
  Object.freeze({ providerId: "fixture-provider-unverified", from: "needs_connection", to: "permission_denied", observedAt: FIXTURE_TIME + 4_000 }),
  Object.freeze({ providerId: "fixture-provider-expired", from: "limited", to: "error", observedAt: FIXTURE_TIME + 5_000 }),
]);

const HEALTH_FIT = Object.freeze({
  available: 20,
  degraded: 10,
  rate_limited: 0,
  needs_connection: -30,
  limited: -40,
  offline: -50,
  permission_denied: -60,
  error: -70,
});

/**
 * Scores a model-provider fixture on required capabilities and health only.
 * Affiliate metadata is intentionally not read by this function.
 *
 * @param {{ readonly tools?: boolean, readonly vision?: boolean, readonly json?: boolean, readonly streaming?: boolean }} requirements
 */
export function rankCapabilityFit(requirements = {}) {
  return Object.freeze(
    FRONTEND_MODEL_FIXTURES.map((candidate) => {
      const providerFixture = FRONTEND_PROVIDER_FIXTURES.find((entry) => entry.id === candidate.providerId);
      const modelCapabilityScore =
        (requirements.tools && candidate.capabilities.tools ? 25 : 0) +
        (requirements.vision && candidate.capabilities.vision ? 25 : 0) +
        (requirements.json && candidate.capabilities.json ? 25 : 0) +
        (requirements.streaming && providerFixture.capabilities.streaming ? 25 : 0);
      const missingRequirements =
        (requirements.tools && !candidate.capabilities.tools ? 1 : 0) +
        (requirements.vision && !candidate.capabilities.vision ? 1 : 0) +
        (requirements.json && !candidate.capabilities.json ? 1 : 0) +
        (requirements.streaming && !providerFixture.capabilities.streaming ? 1 : 0);
      const eligibilityScore = candidate.active ? 5 : -25;
      const score = modelCapabilityScore + HEALTH_FIT[providerFixture.health.kind] + eligibilityScore - missingRequirements * 100;

      return Object.freeze({
        modelId: candidate.id,
        providerId: providerFixture.id,
        displayName: candidate.displayName,
        score,
        missingRequirements,
        health: providerFixture.health.kind,
        affiliateStatus: providerFixture.affiliate.status,
      });
    }).sort((left, right) => right.score - left.score || left.displayName.localeCompare(right.displayName)),
  );
}
