# AgentOS Local Mock API Contract

**Status:** Local deterministic fixture contract for backlog task B5. This specification describes an in-process test harness, not a deployed service or a live provider integration.

## Purpose and boundaries

The local mock API gives future frontend and backend work a stable contract for catalog display, integration-health UI, capability-first route previews, model-switch confirmation, referral-consent UX, redirect preview, and recovery states. It is intentionally deterministic and returns only synthetic fixture data.

> The harness performs no network I/O, provider calls, credential lookup, consent persistence, redirect opening, database write, background task, or deployment action. It must never be used as evidence of live provider status, program eligibility, pricing, availability, or routing performance.

Every response includes `x-agentos-mock: true`, the local contract version, and a deterministic correlation identifier. These values are suitable for offline test assertions only.

| Method | Path | Purpose | Deterministic result |
|---|---|---|---|
| `GET` | `/v1/catalog` | Render provider/model catalog views | Synthetic provider and model fixture records |
| `GET` | `/v1/health` | Render health cards and transition UX | Fixture health snapshots plus a fixed transition timeline |
| `POST` | `/v1/routes/resolve` | Preview a route without contacting a provider | Capability-, activity-, and health-based candidate ranking |
| `POST` | `/v1/models/switch` | Confirm a model-selection interaction | Non-persisted fixture switch result |
| `POST` | `/v1/consent` | Exercise opt-in consent controls | Non-persisted local consent acknowledgment |
| `POST` | `/v1/redirects/dry-run` | Preview a referral or navigation redirect safely | Local-only destination with `wouldOpen: false` |
| `POST` | `/v1/recovery` | Exercise recoverable failure UX | Local recovery action plan with no provider invocation |

## Request and response conventions

A request is a plain in-process object with `method`, `path`, optional object `body`, and optional `idempotencyKey`. A response has `{ status, headers, body }`. No HTTP listener is created by the module.

```javascript
import { handleLocalMockRequest } from "../api/agentos-local-mock-api.mjs";

const result = handleLocalMockRequest({
  method: "POST",
  path: "/v1/routes/resolve",
  body: { requirements: { tools: true, vision: true, json: true, streaming: true } },
  idempotencyKey: "route-preview-001",
});
```

A successful fixture response has `body.ok === true`; controlled validation and missing-resource responses have `body.ok === false` and a code such as `INVALID_REQUEST`, `INVALID_BODY`, `MODEL_NOT_FOUND`, `INVALID_CONSENT`, `PROVIDER_NOT_FOUND`, or `ROUTE_NOT_FOUND`.

## Capability-first route preview

`POST /v1/routes/resolve` accepts optional `requirements` flags: `tools`, `vision`, `json`, and `streaming`. The fixture ranking uses only required-capability satisfaction, model activity, and integration health. Affiliate status remains in the response for transparent display but has no scoring effect.

```javascript
{
  method: "POST",
  path: "/v1/routes/resolve",
  body: { requirements: { tools: true, vision: true } }
}
```

The response contains a selected model/provider, bounded fallback list, an explanation of the local fixture algorithm, candidate records, and the selected record’s affiliate display status. A real routing engine must continue to apply the accepted hard filters, explicit preferences, consent boundaries, and explainability requirements documented in the archived Session 005 specification.

## Consent and dry-run redirect safeguards

`POST /v1/consent` requires `{ providerId, consent }` where `consent` is boolean. The response is always labeled `persisted: false` and `scope: "local_fixture_only"`; it does not write user preferences.

`POST /v1/redirects/dry-run` requires a known fixture `providerId`. It returns `dryRun: true`, `wouldOpen: false`, and a local fixture path. It never emits an external referral or signup URL.

## Recovery fixtures

`POST /v1/recovery` accepts `failureKind`. The built-in deterministic recovery plans cover `offline`, `rate_limited`, `permission_denied`, `context_overflow`, and `stream_interrupted`; any other input receives a safe generic recoverable-error plan. Every recovery response sets `invokesProvider: false` and `persistsState: false`.

## Validation gate

`tests/agentos-local-mock-api.test.mjs` verifies the complete endpoint surface, deterministic request identities, catalog and health data, capability-first routing, non-persistent model/consent behavior, dry-run redirect suppression, recovery boundaries, error responses, and prohibited network/environment usage. The test is dependency-free and does not constitute a runnable service, compilation result, security review, or release claim.
