import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const data = JSON.parse(readFileSync(resolve("catalog/provider_catalog_reconciliation.json"), "utf8"));
const report = readFileSync(resolve("catalog/PROVIDER_CATALOG_RECONCILIATION.md"), "utf8");
const csv = readFileSync(resolve("ai_agent_affiliate_programs.csv"), "utf8");

assert.equal(data.schemaVersion, 1);
assert.equal(data.generatedFromProjectLocalEvidence, true);
assert.equal(data.evidenceCutoff, "2026-08-21");
assert.match(data.activationPolicy, /No entry.*authorizes provider activation/);
assert.equal(data.entries.length, 25);
assert.equal(new Set(data.entries.map((entry) => entry.providerId)).size, data.entries.length);

const statuses = Object.fromEntries(data.statusVocabulary.map((status) => [status, 0]));
for (const entry of data.entries) {
  assert.equal(data.statusVocabulary.includes(entry.status), true, `unsupported status for ${entry.providerId}`);
  statuses[entry.status] += 1;
  assert.equal(Array.isArray(entry.evidence) && entry.evidence.length > 0, true, `${entry.providerId} needs provenance`);
  assert.equal(typeof entry.routingRecommendation, "string");
  assert.equal(/^(?:activate|enable|open_redirect|connect_provider)$/.test(entry.routingRecommendation), false, `${entry.providerId} must not receive an activation instruction`);
}
assert.deepEqual(statuses, {
  verified_project_record: 11,
  pending: 0,
  expired: 0,
  non_affiliate_integration: 5,
  verify_before_activation: 9,
});

for (const providerId of [
  "taskade",
  "botpress",
  "chatbase",
  "relevance_ai",
  "agentworks",
  "manus",
  "tidio_lyro",
  "synthflow",
  "dynamiq",
  "flowgent",
  "ai_agent_store",
]) {
  assert.equal(data.entries.some((entry) => entry.providerId === providerId), true, `CSV candidate ${providerId} is not reconciled`);
}
assert.equal(csv.trim().split("\n").length, 12, "expected header plus 11 project-local candidate rows");

const together = data.entries.find((entry) => entry.providerId === "together_ai");
assert.equal(together.status, "verify_before_activation");
assert.equal(together.routingRecommendation, "block_referral_routing");

for (const providerId of ["openrouter", "groq", "github", "anthropic", "mistral"]) {
  const entry = data.entries.find((candidate) => candidate.providerId === providerId);
  assert.equal(entry.status, "non_affiliate_integration", `${providerId} should remain non-affiliate for individual routing`);
}

for (const requiredText of [
  "Local evidence reconciliation for backlog task C1",
  "No live re-verification occurred here",
  "verified_project_record",
  "verify_before_activation",
  "No row in this group may influence",
  "historical affiliate status alone must never determine selection",
]) {
  assert.equal(report.includes(requiredText), true, `report is missing ${requiredText}`);
}

for (const prohibitedPattern of [/\bapi[_-]?key\b/i, /\bsecret\b/i, /\bpassword\b/i, /\btoken\b/i, /ref=[A-Za-z0-9_-]+/i]) {
  assert.equal(prohibitedPattern.test(JSON.stringify(data)), false, `structured catalog must not carry secret or referral parameter material: ${prohibitedPattern}`);
}

console.log("Provider catalog reconciliation validation passed: 25 entries, status coverage, CSV provenance, project-evidence boundaries, neutral routing posture, and no-activation safeguards verified.");
