import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  LOCAL_MOCK_API_ROUTES,
  handleLocalMockRequest,
} from "../api/agentos-local-mock-api.mjs";

const expectedRoutes = [
  ["GET", "/v1/catalog"],
  ["GET", "/v1/health"],
  ["POST", "/v1/routes/resolve"],
  ["POST", "/v1/models/switch"],
  ["POST", "/v1/consent"],
  ["POST", "/v1/redirects/dry-run"],
  ["POST", "/v1/recovery"],
];

assert.deepEqual(LOCAL_MOCK_API_ROUTES.map((route) => [route.method, route.path]), expectedRoutes);
assert.equal(Object.isFrozen(LOCAL_MOCK_API_ROUTES), true);

const catalog = handleLocalMockRequest({ method: "GET", path: "/v1/catalog", idempotencyKey: "catalog-001" });
assert.equal(catalog.status, 200);
assert.equal(catalog.headers["x-agentos-mock"], "true");
assert.equal(catalog.body.ok, true);
assert.equal(catalog.body.correlationId, "local-fixture:catalog-001");
assert.equal(catalog.body.catalog.providers.length, 6);
assert.equal(catalog.body.catalog.models.length, 6);

const health = handleLocalMockRequest({ method: "GET", path: "/v1/health" });
assert.equal(health.status, 200);
assert.equal(health.body.health.length, 6);
for (const state of ["available", "needs_connection", "limited", "offline", "permission_denied", "rate_limited", "degraded", "error"]) {
  assert.equal(health.body.transitions.some((transition) => transition.from === state || transition.to === state), true, `health contract omits ${state}`);
}

const routeRequest = {
  method: "POST",
  path: "/v1/routes/resolve",
  body: { requirements: { tools: true, vision: true, json: true, streaming: true } },
  idempotencyKey: "route-001",
};
const route = handleLocalMockRequest(routeRequest);
assert.equal(route.status, 200);
assert.equal(route.body.decision.providerId, "fixture-provider-neutral", "healthy capability fit must outrank affiliate status");
assert.equal(route.body.decision.affiliateStatus, "none");
assert.equal(route.body.candidates[1].providerId, "fixture-provider-affiliate");
assert.equal(route.body.decision.reason.includes("capability requirements"), true);
assert.deepEqual(handleLocalMockRequest(routeRequest), route, "identical local mock requests must be deterministic");

const switchResult = handleLocalMockRequest({
  method: "POST",
  path: "/v1/models/switch",
  body: { fromModelId: "fixture-model-local-coder", toModelId: "fixture-model-neutral-generalist" },
});
assert.equal(switchResult.status, 200);
assert.equal(switchResult.body.switch.persisted, false);
assert.equal(switchResult.body.switch.mode, "local_fixture");

const missingModel = handleLocalMockRequest({ method: "POST", path: "/v1/models/switch", body: { fromModelId: "missing", toModelId: "also-missing" } });
assert.equal(missingModel.status, 404);
assert.equal(missingModel.body.error.code, "MODEL_NOT_FOUND");

const consent = handleLocalMockRequest({ method: "POST", path: "/v1/consent", body: { providerId: "fixture-provider-affiliate", consent: true } });
assert.equal(consent.status, 200);
assert.equal(consent.body.consent.persisted, false);
assert.equal(consent.body.consent.scope, "local_fixture_only");

const invalidConsent = handleLocalMockRequest({ method: "POST", path: "/v1/consent", body: { providerId: "fixture-provider-affiliate", consent: "yes" } });
assert.equal(invalidConsent.status, 400);
assert.equal(invalidConsent.body.error.code, "INVALID_CONSENT");

const redirect = handleLocalMockRequest({ method: "POST", path: "/v1/redirects/dry-run", body: { providerId: "fixture-provider-affiliate", target: "signup" } });
assert.equal(redirect.status, 200);
assert.equal(redirect.body.redirect.dryRun, true);
assert.equal(redirect.body.redirect.wouldOpen, false);
assert.equal(redirect.body.redirect.destination.startsWith("/local-fixture/"), true);

const recovery = handleLocalMockRequest({ method: "POST", path: "/v1/recovery", body: { failureKind: "rate_limited" } });
assert.equal(recovery.status, 200);
assert.equal(recovery.body.recovery.invokesProvider, false);
assert.equal(recovery.body.recovery.persistsState, false);
assert.deepEqual(recovery.body.recovery.actions, ["show_retry_after", "offer_ranked_fallbacks"]);

const unknown = handleLocalMockRequest({ method: "DELETE", path: "/v1/catalog" });
assert.equal(unknown.status, 404);
assert.equal(unknown.body.error.code, "ROUTE_NOT_FOUND");

const invalidBody = handleLocalMockRequest({ method: "POST", path: "/v1/routes/resolve", body: [] });
assert.equal(invalidBody.status, 400);
assert.equal(invalidBody.body.error.code, "INVALID_BODY");

const source = readFileSync(resolve("api/agentos-local-mock-api.mjs"), "utf8");
for (const prohibitedPattern of [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /\bhttps?:\/\//, /\bprocess\.env\b/, /\bchild_process\b/]) {
  assert.equal(prohibitedPattern.test(source), false, `API mock source must remain local-only: ${prohibitedPattern}`);
}

console.log("Local API mock validation passed: endpoint surface, deterministic behavior, capability-first routing, dry-run safeguards, recovery boundaries, and local-only source checks verified.");
