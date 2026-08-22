/**
 * AgentOS local provider-health policy — C3
 *
 * This pure policy evaluates supplied local health snapshots. It never performs
 * a health check, infers current availability, contacts a provider, reads
 * credentials, schedules retries, or persists state.
 */

export const HEALTH_STATE_KINDS = Object.freeze([
  "available",
  "needs_connection",
  "limited",
  "offline",
  "permission_denied",
  "rate_limited",
  "degraded",
  "error",
]);

export const FRESHNESS_WINDOWS_MS = Object.freeze({
  fresh: 5 * 60 * 1_000,
  aging: 60 * 60 * 1_000,
  stale: 24 * 60 * 60 * 1_000,
});

const STATE_POLICY = Object.freeze({
  available: Object.freeze({
    severity: "info",
    recommendation: "eligible_only_with_reported_freshness_label",
    automaticRetry: false,
    requiresConfirmation: false,
  }),
  degraded: Object.freeze({
    severity: "warning",
    recommendation: "offer_capability_fit_preview_with_degraded_warning",
    automaticRetry: false,
    requiresConfirmation: true,
  }),
  rate_limited: Object.freeze({
    severity: "warning",
    recommendation: "wait_for_explicit_retry_after_or_choose_previewed_alternative",
    automaticRetry: false,
    requiresConfirmation: false,
  }),
  offline: Object.freeze({
    severity: "warning",
    recommendation: "show_offline_status_and_preview_non_provider_alternative",
    automaticRetry: false,
    requiresConfirmation: false,
  }),
  needs_connection: Object.freeze({
    severity: "warning",
    recommendation: "request_owner_connection_setup_without_reading_credentials",
    automaticRetry: false,
    requiresConfirmation: true,
  }),
  limited: Object.freeze({
    severity: "warning",
    recommendation: "show_plan_or_quota_limit_and_offer_non_provider_alternative",
    automaticRetry: false,
    requiresConfirmation: false,
  }),
  permission_denied: Object.freeze({
    severity: "error",
    recommendation: "request_owner_permission_review_without_retrying",
    automaticRetry: false,
    requiresConfirmation: true,
  }),
  error: Object.freeze({
    severity: "error",
    recommendation: "show_controlled_error_and_preserve_correlation_metadata_only",
    automaticRetry: false,
    requiresConfirmation: false,
  }),
});

function requireNonNegativeTimestamp(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite timestamp.`);
  }
}

function resolveFreshness(observedAt, now) {
  if (observedAt === undefined || observedAt === null) {
    return Object.freeze({
      label: "unknown",
      ageMs: null,
      message: "Status not checked; availability must not be inferred.",
    });
  }
  requireNonNegativeTimestamp(observedAt, "observedAt");
  const ageMs = Math.max(0, now - observedAt);
  if (ageMs <= FRESHNESS_WINDOWS_MS.fresh) {
    return Object.freeze({ label: "fresh", ageMs, message: "Reported state is recent local metadata." });
  }
  if (ageMs <= FRESHNESS_WINDOWS_MS.aging) {
    return Object.freeze({ label: "aging", ageMs, message: "Reported state is aging; show its timestamp." });
  }
  if (ageMs <= FRESHNESS_WINDOWS_MS.stale) {
    return Object.freeze({ label: "stale", ageMs, message: "Reported state is stale; do not treat it as current availability." });
  }
  return Object.freeze({ label: "expired", ageMs, message: "Reported state is expired; require a future explicit check before use." });
}

/**
 * Evaluates a supplied health snapshot with a deterministic caller-supplied
 * `now`. The result is a display-and-decision policy, not a live observation.
 *
 * @param {{ readonly kind: string, readonly observedAt?: number, readonly retryAfterSeconds?: number, readonly lastSuccessfulAt?: number, readonly diagnosticCode?: string }} snapshot
 * @param {{ readonly now: number }} clock
 */
export function evaluateProviderHealth(snapshot, clock) {
  if (!snapshot || typeof snapshot !== "object") throw new TypeError("snapshot must be an object.");
  if (!HEALTH_STATE_KINDS.includes(snapshot.kind)) throw new TypeError(`Unsupported health state: ${String(snapshot.kind)}`);
  if (!clock || typeof clock !== "object") throw new TypeError("clock must be an object.");
  requireNonNegativeTimestamp(clock.now, "clock.now");
  if (snapshot.lastSuccessfulAt !== undefined) requireNonNegativeTimestamp(snapshot.lastSuccessfulAt, "lastSuccessfulAt");
  if (snapshot.retryAfterSeconds !== undefined && (!Number.isInteger(snapshot.retryAfterSeconds) || snapshot.retryAfterSeconds < 0)) {
    throw new TypeError("retryAfterSeconds must be a non-negative integer when supplied.");
  }

  const freshness = resolveFreshness(snapshot.observedAt, clock.now);
  const policy = STATE_POLICY[snapshot.kind];
  const staleAvailabilityGuard = snapshot.kind === "available" && ["stale", "expired", "unknown"].includes(freshness.label);
  const recommendation = staleAvailabilityGuard
    ? "do_not_assume_availability_offer_explicit_recheck_or_local_preview"
    : policy.recommendation;

  return Object.freeze({
    source: "local_policy",
    state: snapshot.kind,
    freshness,
    severity: policy.severity,
    recommendation,
    automaticRetry: false,
    requiresConfirmation: policy.requiresConfirmation,
    retryAfterSeconds: snapshot.retryAfterSeconds ?? null,
    lastSuccessfulAt: snapshot.lastSuccessfulAt ?? null,
    diagnosticCode: snapshot.diagnosticCode ?? null,
    invokesProvider: false,
    persistsState: false,
  });
}

/** Returns all state-policy entries for deterministic local UI coverage. */
export function listProviderHealthPolicies() {
  return Object.freeze(
    HEALTH_STATE_KINDS.map((state) =>
      Object.freeze({
        state,
        ...STATE_POLICY[state],
        invokesProvider: false,
        persistsState: false,
      }),
    ),
  );
}
