import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const review = readFileSync(resolve("catalog/AFFILIATE_DISCLOSURE_NEUTRALITY_REVIEW.md"), "utf8");
const fallbackManager = readFileSync(resolve("agents/ui/components/IntegrationFallbackManager.tsx"), "utf8");
const localApi = readFileSync(resolve("api/agentos-local-mock-api.mjs"), "utf8");
const catalog = JSON.parse(readFileSync(resolve("catalog/provider_catalog_reconciliation.json"), "utf8"));

for (const requiredText of [
  "Capability-neutral ranking",
  "Non-affiliate alternatives",
  "Opt-in consent",
  "Referral/redirect safety",
  "Silent monetized fallback prevention",
  "Provider-card disclosure",
  "Landing-page copy",
  "No silent monetized fallback",
  "requires affirmative opt-in",
  "does not implement, approve, or activate",
]) {
  assert.equal(review.includes(requiredText), true, `review is missing ${requiredText}`);
}

assert.match(fallbackManager, /referralStatus: "none"/);
assert.match(fallbackManager, /referralStatus: "verified"/);
const rankingBlock = fallbackManager.match(/export function rankFallbackProviders[\s\S]*?\r?\n}\r?\n\r?\nfunction recoveryMessage/);
assert.ok(rankingBlock, "fallback manager must expose a bounded ranking block");
assert.equal(/referralStatus/.test(rankingBlock[0]), false, "affiliate metadata must not influence fallback ranking");
assert.match(fallbackManager, /Local Runtime/);
assert.match(fallbackManager, /Free Community Gateway/);

assert.match(localApi, /path === "\/v1\/consent"/);
assert.match(localApi, /persisted: false/);
assert.match(localApi, /scope: "local_fixture_only"/);
assert.match(localApi, /path === "\/v1\/redirects\/dry-run"/);
assert.match(localApi, /dryRun: true/);
assert.match(localApi, /wouldOpen: false/);

assert.match(catalog.activationPolicy, /No entry.*authorizes provider activation/);
assert.equal(catalog.entries.some((entry) => entry.status === "non_affiliate_integration"), true);
assert.equal(catalog.entries.some((entry) => entry.status === "verify_before_activation"), true);

console.log("Affiliate disclosure and neutrality review validation passed: local neutrality, non-affiliate alternatives, opt-in fixture boundary, dry-run redirects, catalog no-activation posture, and documented remediation gaps verified.");
