import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const matrix = JSON.parse(readFileSync(resolve("catalog/capability_comparison_matrix.json"), "utf8"));
const report = readFileSync(resolve("catalog/CAPABILITY_COMPARISON_MATRIX.md"), "utf8");

assert.equal(matrix.schemaVersion, 1);
assert.equal(matrix.generatedFromProjectLocalEvidence, true);
assert.equal(matrix.unknownValue, "unknown");
assert.deepEqual(matrix.dimensions, [
  "streaming",
  "tools",
  "vision",
  "json",
  "audio",
  "contextWindow",
  "localAvailability",
  "privacy",
  "cost",
  "freeTier",
  "requiredIntegrations",
]);
assert.equal(matrix.models.length, 6);
assert.equal(new Set(matrix.models.map((model) => model.modelId)).size, matrix.models.length);

for (const model of matrix.models) {
  for (const booleanDimension of ["streaming", "tools", "vision", "json", "localAvailability", "freeTier", "active"]) {
    assert.equal(typeof model[booleanDimension], "boolean", `${model.modelId}.${booleanDimension} must be boolean`);
  }
  assert.equal(Number.isInteger(model.contextWindow) && model.contextWindow > 0, true, `${model.modelId} needs a positive context window`);
  assert.equal(Array.isArray(model.requiredIntegrations), true);
  assert.equal(model.evidence.length > 0, true, `${model.modelId} needs local evidence`);
  assert.equal(model.audio === "unknown" || typeof model.audio === "boolean", true);
  assert.equal(model.cost === "unknown" || typeof model.cost === "string", true);
  assert.equal(model.privacy === "unknown" || typeof model.privacy === "string", true);
}

const local = matrix.models.find((model) => model.modelId === "fixture-model-local-coder");
assert.equal(local.localAvailability, true);
assert.equal(local.privacy, "local_fixture_only");

const affiliate = matrix.models.find((model) => model.modelId === "fixture-model-affiliate-generalist");
const neutral = matrix.models.find((model) => model.modelId === "fixture-model-neutral-generalist");
for (const field of ["streaming", "tools", "vision", "json", "contextWindow", "localAvailability", "privacy", "cost", "freeTier"]) {
  assert.deepEqual(affiliate[field], neutral[field], `fixture tie must remain equal for ${field}`);
}
assert.match(matrix.affiliateScoringPolicy, /never used in capability ranking/);
assert.match(matrix.agentCoverage.status, /^unknown$/);
assert.equal(matrix.agentProfiles.length, 0);

for (const requiredText of [
  "Local evidence matrix for backlog task C2",
  "A value of `unknown`",
  "Affiliate metadata may be displayed",
  "Agent-level capability",
  "This matrix alone authorizes none",
]) {
  assert.equal(report.includes(requiredText), true, `report is missing ${requiredText}`);
}
assert.equal(/live provider availability|production readiness/.test(report), true, "report must state live-readiness limits");

for (const prohibitedPattern of [/\bapi[_-]?key\b/i, /\bpassword\b/i, /\bsecret\b/i, /ref=[A-Za-z0-9_-]+/i]) {
  assert.equal(prohibitedPattern.test(JSON.stringify(matrix)), false, `matrix must not carry secret or referral parameter material: ${prohibitedPattern}`);
}

console.log("Capability matrix validation passed: 6 models, 11 dimensions, local evidence provenance, explicit unknowns, agent coverage boundary, and affiliate-neutral comparison verified.");
