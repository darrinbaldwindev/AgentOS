# Provider Health Policy

**Status:** Local deterministic policy for backlog task C3. This policy evaluates supplied health metadata only. It does not perform a health check, contact a provider, access credentials, schedule a retry, persist a status, or establish current provider availability.

## Policy inputs and output boundary

The policy accepts a local snapshot with a required state kind and optional `observedAt`, `lastSuccessfulAt`, `retryAfterSeconds`, and `diagnosticCode` metadata. The caller supplies `now` explicitly, so results are deterministic and testable. The output is a UI and recovery recommendation, not a route decision or a provider invocation.

> **Absence is not availability.** When `observedAt` is missing, stale, or expired, a state labeled `available` must not be presented as a current availability claim. The policy returns a non-activating recommendation to offer an explicit future check or local preview instead.

## Freshness labels

| Label | Local age rule | UI interpretation | Availability rule |
|---|---|---|---|
| `fresh` | At most 5 minutes old | Show reported state with its timestamp. | It remains a reported local observation, not a guarantee. |
| `aging` | More than 5 minutes and at most 1 hour | Show a visible age label. | Do not silently treat it as a live check. |
| `stale` | More than 1 hour and at most 24 hours | Show a stale-status warning. | Do not use an `available` state as proof of current availability. |
| `expired` | More than 24 hours old | Show expired metadata. | Require a future explicit check before use. |
| `unknown` | No `observedAt` metadata | Show `Status not checked`. | Never infer availability. |

## State policy

| Health state | Severity | Retry posture | Local recommendation |
|---|---|---|---|
| `available` | Info | No automatic retry | Eligible only with its reported freshness label. |
| `degraded` | Warning | No automatic retry | Offer a capability-fit preview with a degraded warning and confirmation. |
| `rate_limited` | Warning | No automatic retry | Wait for an explicit retry-after value or choose a previewed alternative. |
| `offline` | Warning | No automatic retry | Show offline state and a non-provider alternative preview. |
| `needs_connection` | Warning | No automatic retry | Request owner connection setup without credential inspection. |
| `limited` | Warning | No automatic retry | Explain durable plan/quota limitation and offer a non-provider alternative. |
| `permission_denied` | Error | Never retry automatically | Request an owner permission review without reading credentials. |
| `error` | Error | No automatic retry | Show a controlled error and preserve correlation metadata only. |

`retryAfterSeconds` is display metadata supplied by the snapshot. The policy does not create timers, schedules, or retry jobs. A future implementation may let a user explicitly request a retry after the supplied interval, but must not infer that a retry will succeed.

## Fallback posture

Fallback recommendations must remain **capability-first**, must preserve user context and explicit confirmation boundaries, and must keep affiliate status out of selection scoring. A policy result can offer a local preview or an explicit alternative, but it must not silently activate a provider, create a referral route, open a redirect, or claim a monetized fallback.

For a stale or unknown `available` state, the special recommendation is `do_not_assume_availability_offer_explicit_recheck_or_local_preview`. This prevents a historical local observation from becoming an unsupported live-status assertion.

## Implementation and validation

The executable policy is `policy/provider-health-policy.mjs`. Its test must verify all eight integration state kinds, all freshness labels, retry-after input validation, stale-availability suppression, deterministic output, no provider invocation, and no persistence. The policy aligns with the existing local mock API, integration mock adapters, typed `IntegrationState`, and recovery event schemas, but does not turn any of them into live integrations.
