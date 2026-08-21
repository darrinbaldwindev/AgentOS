import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FIXTURE_OBSERVED_AT,
  INTEGRATION_SCENARIOS,
  createMockIntegrationAdapter,
  createMockIntegrationCatalog,
  getFixtureIntegrationState,
} from "../mocks/integration-mock-adapters.mjs";

const expectedScenarios = [
  "available",
  "needs_connection",
  "limited",
  "offline",
  "permission_denied",
  "rate_limited",
  "degraded",
  "error",
];

assert.deepEqual(INTEGRATION_SCENARIOS, expectedScenarios);
assert.equal(new Set(INTEGRATION_SCENARIOS).size, expectedScenarios.length);

const expectedFailures = {
  needs_connection: { code: "CONNECTION_REQUIRED", retryable: false },
  limited: { code: "PLAN_LIMIT", retryable: false },
  offline: { code: "OFFLINE", retryable: true },
  permission_denied: { code: "PERMISSION_DENIED", retryable: false },
  rate_limited: { code: "RATE_LIMITED", retryable: true },
  error: { code: "MOCK_ERROR", retryable: false },
};

for (const scenario of INTEGRATION_SCENARIOS) {
  const firstState = getFixtureIntegrationState(scenario);
  const secondState = getFixtureIntegrationState(scenario);
  assert.notStrictEqual(firstState, secondState, `${scenario} state should be a caller-safe copy`);
  assert.equal(firstState.kind, scenario);
  assert.equal(firstState.observedAt, FIXTURE_OBSERVED_AT);
  assert.equal(Object.isFrozen(firstState), true);

  const adapter = createMockIntegrationAdapter(scenario);
  const result = adapter.execute("health_probe", { zeta: true, alpha: 1 });

  assert.equal(result.adapterId, `mock:${scenario}`);
  assert.equal(result.state.kind, scenario);
  assert.deepEqual(result.request.inputKeys, ["alpha", "zeta"]);
  assert.equal(result.request.source, "local_fixture");
  assert.equal(Object.isFrozen(result), true);

  if (scenario === "available" || scenario === "degraded") {
    assert.equal(result.ok, true, `${scenario} should model a usable state`);
    assert.equal(result.retryable, false);
    assert.equal(result.value.accepted, true);
    assert.equal(result.value.degraded, scenario === "degraded");
  } else {
    assert.equal(result.ok, false, `${scenario} should model a blocked state`);
    assert.deepEqual(result.error.code, expectedFailures[scenario].code);
    assert.equal(result.retryable, expectedFailures[scenario].retryable);
  }
}

const catalog = createMockIntegrationCatalog();
assert.equal(catalog.length, expectedScenarios.length);
assert.equal(Object.isFrozen(catalog), true);
assert.deepEqual(catalog.map((adapter) => adapter.id), expectedScenarios.map((scenario) => `mock:${scenario}`));

assert.throws(() => createMockIntegrationAdapter("unsupported"), /Unsupported mock integration scenario/);
assert.throws(() => createMockIntegrationAdapter("available").execute(""), /non-empty string/);

const source = readFileSync(resolve("mocks/integration-mock-adapters.mjs"), "utf8");
for (const prohibitedPattern of [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /\bhttps?:\/\//, /\bprocess\.env\b/]) {
  assert.equal(prohibitedPattern.test(source), false, `adapter source must remain offline: ${prohibitedPattern}`);
}

console.log(`Integration mock adapter validation passed: ${expectedScenarios.length} deterministic states and offline-source safeguards verified.`);
