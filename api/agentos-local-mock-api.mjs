/**
 * AgentOS deterministic local API mock — B5
 *
 * This is an in-process contract harness, not a network server. It performs no
 * I/O, does not contact providers, does not persist credentials or consent, and
 * never opens redirects. It only returns synthetic deterministic fixture data.
 */

import {
  FRONTEND_MODEL_FIXTURES,
  FRONTEND_PROVIDER_FIXTURES,
  PROVIDER_HEALTH_TRANSITIONS,
  rankCapabilityFit,
} from "../fixtures/frontend-provider-fixtures.mjs";

const API_VERSION = "2026-08-21-local-mock-v1";
const FIXTURE_REQUEST_PREFIX = "local-fixture";

function response(status, body) {
  return Object.freeze({
    status,
    headers: Object.freeze({
      "content-type": "application/json",
      "x-agentos-mock": "true",
      "x-agentos-api-version": API_VERSION,
    }),
    body: Object.freeze(body),
  });
}

function error(status, code, message, correlationId) {
  return response(status, {
    ok: false,
    error: Object.freeze({ code, message, correlationId }),
  });
}

function requireObject(value, message) {
  if (value === undefined) {
    return {};
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(message);
  }
  return value;
}

function requestIdentity(method, path, idempotencyKey) {
  return `${FIXTURE_REQUEST_PREFIX}:${idempotencyKey ?? `${method}:${path}`}`;
}

function findProvider(providerId) {
  return FRONTEND_PROVIDER_FIXTURES.find((provider) => provider.id === providerId);
}

function findModel(modelId) {
  return FRONTEND_MODEL_FIXTURES.find((model) => model.id === modelId);
}

/**
 * Handles one fully local mock request.
 *
 * Request shape: { method, path, body?, idempotencyKey? }
 * Response shape: { status, headers, body }
 */
export function handleLocalMockRequest(request) {
  const normalized = requireObject(request, "Mock request must be an object.");
  const method = normalized.method?.toUpperCase();
  const path = normalized.path;
  const correlationId = requestIdentity(method, path, normalized.idempotencyKey);

  if (typeof method !== "string" || typeof path !== "string" || !method || !path) {
    return error(400, "INVALID_REQUEST", "method and path are required strings.", correlationId);
  }

  let body;
  try {
    body = requireObject(normalized.body, "Mock request body must be an object when supplied.");
  } catch (cause) {
    return error(400, "INVALID_BODY", cause.message, correlationId);
  }

  if (method === "GET" && path === "/v1/catalog") {
    return response(200, {
      ok: true,
      correlationId,
      catalog: Object.freeze({
        providers: FRONTEND_PROVIDER_FIXTURES,
        models: FRONTEND_MODEL_FIXTURES,
      }),
    });
  }

  if (method === "GET" && path === "/v1/health") {
    return response(200, {
      ok: true,
      correlationId,
      health: Object.freeze(FRONTEND_PROVIDER_FIXTURES.map((provider) => Object.freeze({
        providerId: provider.id,
        state: provider.health,
      }))),
      transitions: PROVIDER_HEALTH_TRANSITIONS,
    });
  }

  if (method === "POST" && path === "/v1/routes/resolve") {
    const requirements = requireObject(body.requirements, "Route requirements must be an object when supplied.");
    const ranked = rankCapabilityFit(requirements);
    const winner = ranked[0];
    return response(200, {
      ok: true,
      correlationId,
      decision: Object.freeze({
        modelId: winner.modelId,
        providerId: winner.providerId,
        confidence: Math.max(0, Math.min(1, winner.score / 125)),
        reason: "Deterministic fixture selection based on capability requirements, model activity, and integration health.",
        fallbackModelIds: Object.freeze(ranked.slice(1, 4).map((entry) => entry.modelId)),
        affiliateStatus: winner.affiliateStatus,
      }),
      candidates: ranked,
    });
  }

  if (method === "POST" && path === "/v1/models/switch") {
    const fromModel = findModel(body.fromModelId);
    const toModel = findModel(body.toModelId);
    if (!fromModel || !toModel) {
      return error(404, "MODEL_NOT_FOUND", "Both fromModelId and toModelId must identify fixture models.", correlationId);
    }
    return response(200, {
      ok: true,
      correlationId,
      switch: Object.freeze({
        fromModelId: fromModel.id,
        toModelId: toModel.id,
        persisted: false,
        mode: "local_fixture",
      }),
    });
  }

  if (method === "POST" && path === "/v1/consent") {
    const providerFixture = findProvider(body.providerId);
    if (!providerFixture || typeof body.consent !== "boolean") {
      return error(400, "INVALID_CONSENT", "providerId and boolean consent are required for the local fixture.", correlationId);
    }
    return response(200, {
      ok: true,
      correlationId,
      consent: Object.freeze({
        providerId: providerFixture.id,
        consent: body.consent,
        persisted: false,
        scope: "local_fixture_only",
      }),
    });
  }

  if (method === "POST" && path === "/v1/redirects/dry-run") {
    const providerFixture = findProvider(body.providerId);
    if (!providerFixture) {
      return error(404, "PROVIDER_NOT_FOUND", "providerId must identify a fixture provider.", correlationId);
    }
    return response(200, {
      ok: true,
      correlationId,
      redirect: Object.freeze({
        providerId: providerFixture.id,
        target: typeof body.target === "string" ? body.target : "signup",
        dryRun: true,
        wouldOpen: false,
        destination: `/local-fixture/redirects/${providerFixture.id}`,
      }),
    });
  }

  if (method === "POST" && path === "/v1/recovery") {
    const failureKind = typeof body.failureKind === "string" ? body.failureKind : "unknown";
    const plan = {
      offline: Object.freeze(["show_offline_state", "offer_local_fixture_retry"]),
      rate_limited: Object.freeze(["show_retry_after", "offer_ranked_fallbacks"]),
      permission_denied: Object.freeze(["show_permission_boundary", "do_not_prompt_for_secret"]),
      context_overflow: Object.freeze(["show_context_warning", "offer_compaction_preview"]),
      stream_interrupted: Object.freeze(["preserve_partial_output", "offer_idempotent_retry"]),
      unknown: Object.freeze(["show_recoverable_error", "record_correlation_id"]),
    }[failureKind] ?? Object.freeze(["show_recoverable_error", "record_correlation_id"]);

    return response(200, {
      ok: true,
      correlationId,
      recovery: Object.freeze({
        failureKind,
        actions: plan,
        invokesProvider: false,
        persistsState: false,
      }),
    });
  }

  return error(404, "ROUTE_NOT_FOUND", `No local mock route matches ${method} ${path}.`, correlationId);
}

export const LOCAL_MOCK_API_ROUTES = Object.freeze([
  Object.freeze({ method: "GET", path: "/v1/catalog" }),
  Object.freeze({ method: "GET", path: "/v1/health" }),
  Object.freeze({ method: "POST", path: "/v1/routes/resolve" }),
  Object.freeze({ method: "POST", path: "/v1/models/switch" }),
  Object.freeze({ method: "POST", path: "/v1/consent" }),
  Object.freeze({ method: "POST", path: "/v1/redirects/dry-run" }),
  Object.freeze({ method: "POST", path: "/v1/recovery" }),
]);
