/**
 * Deterministic local integration mock adapters — B2
 *
 * This module is intentionally offline. It performs no network I/O, credential
 * lookup, filesystem mutation, clock reads, or randomized behavior. It models
 * the `IntegrationState` contract defined in `contracts/agentos-core-types.ts`
 * so future UI, route-selection, and recovery work can exercise known states.
 */

/** @typedef {import("../contracts/agentos-core-types.ts").IntegrationStateKind} IntegrationStateKind */

export const FIXTURE_OBSERVED_AT = 1_725_000_000_000;

/** @type {readonly IntegrationStateKind[]} */
export const INTEGRATION_SCENARIOS = Object.freeze([
  "available",
  "needs_connection",
  "limited",
  "offline",
  "permission_denied",
  "rate_limited",
  "degraded",
  "error",
]);

const FIXTURE_STATES = Object.freeze({
  available: Object.freeze({
    kind: "available",
    observedAt: FIXTURE_OBSERVED_AT,
    lastSuccessfulAt: FIXTURE_OBSERVED_AT,
    detail: "Local fixture is ready.",
  }),
  needs_connection: Object.freeze({
    kind: "needs_connection",
    observedAt: FIXTURE_OBSERVED_AT,
    diagnosticCode: "CONNECTION_REQUIRED",
    detail: "A connection must be configured before this integration can run.",
  }),
  limited: Object.freeze({
    kind: "limited",
    observedAt: FIXTURE_OBSERVED_AT,
    diagnosticCode: "PLAN_LIMIT",
    detail: "The fixture models a durable plan or quota limitation.",
  }),
  offline: Object.freeze({
    kind: "offline",
    observedAt: FIXTURE_OBSERVED_AT,
    diagnosticCode: "OFFLINE",
    detail: "The fixture models an unreachable integration without attempting a request.",
    retryAfterSeconds: 30,
  }),
  permission_denied: Object.freeze({
    kind: "permission_denied",
    observedAt: FIXTURE_OBSERVED_AT,
    diagnosticCode: "PERMISSION_DENIED",
    detail: "The fixture models a missing permission without inspecting credentials.",
  }),
  rate_limited: Object.freeze({
    kind: "rate_limited",
    observedAt: FIXTURE_OBSERVED_AT,
    diagnosticCode: "RATE_LIMITED",
    detail: "The fixture models a transient retryable limit.",
    retryAfterSeconds: 60,
  }),
  degraded: Object.freeze({
    kind: "degraded",
    observedAt: FIXTURE_OBSERVED_AT,
    lastSuccessfulAt: FIXTURE_OBSERVED_AT - 60_000,
    diagnosticCode: "DEGRADED",
    detail: "The fixture remains usable with an explicit degraded-state warning.",
  }),
  error: Object.freeze({
    kind: "error",
    observedAt: FIXTURE_OBSERVED_AT,
    diagnosticCode: "MOCK_ERROR",
    detail: "The fixture models a deterministic non-retryable adapter failure.",
  }),
});

const OUTCOME_BY_SCENARIO = Object.freeze({
  available: Object.freeze({ ok: true, retryable: false }),
  needs_connection: Object.freeze({ ok: false, retryable: false, failureCode: "CONNECTION_REQUIRED" }),
  limited: Object.freeze({ ok: false, retryable: false, failureCode: "PLAN_LIMIT" }),
  offline: Object.freeze({ ok: false, retryable: true, failureCode: "OFFLINE" }),
  permission_denied: Object.freeze({ ok: false, retryable: false, failureCode: "PERMISSION_DENIED" }),
  rate_limited: Object.freeze({ ok: false, retryable: true, failureCode: "RATE_LIMITED" }),
  degraded: Object.freeze({ ok: true, retryable: false, warningCode: "DEGRADED" }),
  error: Object.freeze({ ok: false, retryable: false, failureCode: "MOCK_ERROR" }),
});

function requireScenario(scenario) {
  if (!INTEGRATION_SCENARIOS.includes(scenario)) {
    throw new TypeError(`Unsupported mock integration scenario: ${String(scenario)}`);
  }
}

function copyState(state) {
  return { ...state };
}

/**
 * Returns a fresh state object with stable fixture values. Callers may safely
 * mutate their own copy without changing the fixture registry.
 *
 * @param {IntegrationStateKind} scenario
 * @returns {Readonly<Record<string, string | number>>}
 */
export function getFixtureIntegrationState(scenario) {
  requireScenario(scenario);
  return Object.freeze(copyState(FIXTURE_STATES[scenario]));
}

/**
 * A deterministic adapter that models one local integration state. It never
 * resolves a provider, opens a connection, reads a key, or performs I/O.
 */
export class MockIntegrationAdapter {
  /**
   * @param {IntegrationStateKind} scenario
   * @param {{ readonly id?: string, readonly name?: string }} [identity]
   */
  constructor(scenario, identity = {}) {
    requireScenario(scenario);
    this.id = identity.id ?? `mock:${scenario}`;
    this.name = identity.name ?? `Mock ${scenario} integration`;
    this.scenario = scenario;
  }

  /** @returns {Readonly<Record<string, string | number>>} */
  getState() {
    return getFixtureIntegrationState(this.scenario);
  }

  /**
   * Resolves a local fixture outcome for an abstract operation name. The result
   * is serializable and uses a stable request identity; no operation is run.
   *
   * @param {string} operation
   * @param {Readonly<Record<string, unknown>>} [input]
   */
  execute(operation, input = {}) {
    if (typeof operation !== "string" || operation.trim().length === 0) {
      throw new TypeError("Mock integration operation must be a non-empty string.");
    }

    const state = this.getState();
    const disposition = OUTCOME_BY_SCENARIO[this.scenario];
    const request = Object.freeze({
      operation,
      inputKeys: Object.freeze(Object.keys(input).sort()),
      source: "local_fixture",
    });

    if (disposition.ok) {
      return Object.freeze({
        ok: true,
        retryable: false,
        adapterId: this.id,
        state,
        request,
        value: Object.freeze({
          accepted: true,
          degraded: this.scenario === "degraded",
          warningCode: disposition.warningCode,
        }),
      });
    }

    return Object.freeze({
      ok: false,
      retryable: disposition.retryable,
      adapterId: this.id,
      state,
      request,
      error: Object.freeze({
        code: disposition.failureCode,
        message: state.detail,
        retryAfterSeconds: state.retryAfterSeconds,
      }),
    });
  }
}

/**
 * Creates a deterministic adapter for one named scenario.
 *
 * @param {IntegrationStateKind} scenario
 * @param {{ readonly id?: string, readonly name?: string }} [identity]
 */
export function createMockIntegrationAdapter(scenario, identity) {
  return new MockIntegrationAdapter(scenario, identity);
}

/**
 * Produces the complete stable fixture catalog, useful for offline UI and
 * recovery-flow tests. Each adapter has a unique deterministic identifier.
 */
export function createMockIntegrationCatalog() {
  return Object.freeze(
    INTEGRATION_SCENARIOS.map((scenario) =>
      createMockIntegrationAdapter(scenario, {
        id: `mock:${scenario}`,
        name: `Mock ${scenario} integration`,
      }),
    ),
  );
}
