import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const contract = readFileSync(resolve("agents/api/INTEGRATION_FALLBACK_API.md"), "utf8");

assert.match(contract, /^# AgentOS Integration Fallback API/m);
assert.match(contract, /Self-contained offline contract replacement for B4/);
for (const section of [
  "## Common envelope",
  "## Context overflow",
  "## Stream interruption",
  "## Tool failure",
  "## Artifact conflict",
  "## Idempotency",
  "## SSE reconnection",
  "## Error correlation",
  "## Frontend obligations",
  "## Implementation gate",
]) {
  assert.match(contract, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing section ${section}`);
}

for (const requiredToken of [
  "correlationId",
  "requestId",
  "idempotencyKey",
  "CONTEXT_OVERFLOW",
  "STREAM_INTERRUPTED",
  "TOOL_FAILURE",
  "ARTIFACT_CONFLICT",
  "SSE_REPLAY_UNAVAILABLE",
  "requiresConfirmation",
  "partialOutputPreserved",
  "replayComplete",
  "automaticActionTaken",
  "Last-Event-ID",
]) {
  assert.match(contract, new RegExp(requiredToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing contract token ${requiredToken}`);
}

const codeBlocks = [...contract.matchAll(/```(?:json|text)?\r?\n([\s\S]*?)```/g)].map((match) => match[1]);
assert.ok(codeBlocks.length >= 8, "contract should include request/response examples");
for (const block of codeBlocks) {
  assert.equal(/"(?:prompt|secret|password|credential|apiKey|token|repositoryContent|artifactPayload|rawInput|rawOutput)"\s*:/i.test(block), false, "examples must not declare private payload fields");
  assert.equal(/https?:\/\//i.test(block), false, "examples must not contain external URLs");
}

assert.match(contract, /must not contain prompt text, secrets, credentials, repository contents/);
assert.match(contract, /does not implement live endpoints/);
assert.match(contract, /must not transmit or log raw partial content/);
assert.match(contract, /referral status remains secondary to capability fit/i);
assert.match(contract, /automatic retries/);

console.log("Fallback API contract validation passed: required recovery examples, idempotency, SSE replay metadata, error correlation, privacy exclusions, and no-live-endpoint boundary verified.");
