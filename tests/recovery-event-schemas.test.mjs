import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  RECOVERY_EVENT_FIXTURES,
  RECOVERY_EVENT_STREAM_FIXTURE,
  RECOVERY_FIXTURE_TIME,
} from "../fixtures/recovery-event-fixtures.mjs";

const source = readFileSync(resolve("events/recovery-event-schemas.ts"), "utf8");

const requiredInterfaces = [
  "ExecutionStartedEvent",
  "ExecutionCompletedEvent",
  "ModelSwitchedEvent",
  "FallbackSelectedEvent",
  "ProviderStatusChangedEvent",
  "ConsentRecordedEvent",
  "ReferralClickRecordedEvent",
  "RedirectFailedEvent",
  "ToolFailedEvent",
  "RecoveryActionRecordedEvent",
  "AppendOnlyRecoveryEventStream",
];

for (const name of requiredInterfaces) {
  assert.equal(source.includes(`export interface ${name}`), true, `missing ${name}`);
}
assert.match(source, /export\s+type\s+RecoveryEvent\s*=/);
assert.match(source, /export\s+type\s+RecoveryEventKind\s*=/);

const expectedKinds = [
  "execution_started",
  "execution_completed",
  "model_switched",
  "fallback_selected",
  "provider_status_changed",
  "consent_recorded",
  "referral_click_recorded",
  "redirect_failed",
  "tool_failed",
  "recovery_action_recorded",
];
assert.equal(RECOVERY_EVENT_FIXTURES.length, expectedKinds.length);
assert.deepEqual([...new Set(RECOVERY_EVENT_FIXTURES.map((event) => event.kind))].sort(), [...expectedKinds].sort());
assert.equal(Object.isFrozen(RECOVERY_EVENT_FIXTURES), true);
assert.equal(Object.isFrozen(RECOVERY_EVENT_STREAM_FIXTURE), true);
assert.equal(RECOVERY_EVENT_STREAM_FIXTURE.nextSequence, RECOVERY_EVENT_FIXTURES.length + 1);

let previousSequence = 0;
const seenIds = new Set();
for (const event of RECOVERY_EVENT_FIXTURES) {
  assert.equal(Object.isFrozen(event), true, `${event.id} must be immutable`);
  assert.equal(event.schemaVersion, 1);
  assert.ok(event.sequence > previousSequence, `${event.id} must increase the append-only sequence`);
  assert.ok(event.occurredAt >= RECOVERY_FIXTURE_TIME);
  assert.equal(event.correlationId, "fixture-correlation-001");
  if (event.causationId) {
    assert.equal(seenIds.has(event.causationId), true, `${event.id} must reference an earlier event`);
  }
  previousSequence = event.sequence;
  seenIds.add(event.id);
}

const forbiddenEventKey = /(?:prompt|secret|password|token|credential|repository|repo|artifact.*(?:content|payload)|content.*artifact|raw.*(?:input|output)|api.?key|private.?key)/i;
function assertPrivacySafe(value, path = "event") {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertPrivacySafe(entry, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      assert.equal(forbiddenEventKey.test(key), false, `privacy-prohibited key ${path}.${key}`);
      assertPrivacySafe(child, `${path}.${key}`);
    }
    return;
  }
  if (typeof value === "string") {
    assert.equal(/^https?:\/\//i.test(value), false, `event values must not contain external URLs at ${path}`);
  }
}
assertPrivacySafe(RECOVERY_EVENT_FIXTURES);

const recoveryEvent = RECOVERY_EVENT_FIXTURES.find((event) => event.kind === "recovery_action_recorded");
assert.equal(recoveryEvent.providerInvoked, false);
assert.equal(recoveryEvent.statePersisted, false);

for (const prohibitedDeclaration of [
  /readonly\s+prompt(?:Text)?\s*:/i,
  /readonly\s+secret(?:Value)?\s*:/i,
  /readonly\s+password\s*:/i,
  /readonly\s+apiKey\s*:/i,
  /readonly\s+token\s*:/i,
  /readonly\s+credential\s*:/i,
  /readonly\s+repository(?:Content)?\s*:/i,
  /readonly\s+artifact(?:Content|Payload)\s*:/i,
]) {
  assert.equal(prohibitedDeclaration.test(source), false, `schema must not declare prohibited payload field ${prohibitedDeclaration}`);
}

assert.match(source, /strictly increasing sequence/);
assert.match(source, /never mutation or deletion/);

console.log("Recovery event schema validation passed: complete event coverage, immutable append-only ordering, causal references, privacy exclusions, and recovery boundaries verified.");
