/**
 * Deterministic B6 recovery event fixtures.
 *
 * These synthetic records model append-only operational metadata. They contain
 * no prompt text, secret value, repository content, or private artifact payload.
 */

export const RECOVERY_FIXTURE_TIME = 1_725_000_000_000;
export const RECOVERY_FIXTURE_STREAM_ID = "fixture-recovery-stream-001";

const base = (id, sequence, kind, dataClass = "operational_metadata") => Object.freeze({
  schemaVersion: 1,
  id,
  sequence,
  occurredAt: RECOVERY_FIXTURE_TIME + sequence * 1_000,
  kind,
  correlationId: "fixture-correlation-001",
  executionId: "fixture-execution-001",
  projectId: "fixture-project-001",
  threadId: "fixture-thread-001",
  dataClass,
});

export const RECOVERY_EVENT_FIXTURES = Object.freeze([
  Object.freeze({
    ...base("evt-001", 1, "execution_started"),
    agentProfileId: "fixture-agent-profile-001",
    plannedStepCount: 3,
    verificationRequired: true,
  }),
  Object.freeze({
    ...base("evt-002", 2, "provider_status_changed"),
    providerId: "fixture-provider-free",
    from: "available",
    to: "rate_limited",
    diagnosticCode: "RATE_LIMITED",
    retryAfterSeconds: 60,
  }),
  Object.freeze({
    ...base("evt-003", 3, "fallback_selected"),
    causationId: "evt-002",
    failedProviderId: "fixture-provider-free",
    selectedProviderId: "fixture-provider-neutral",
    selectedModelId: "fixture-model-neutral-generalist",
    selectionReason: "retry_policy",
    candidateCount: 3,
  }),
  Object.freeze({
    ...base("evt-004", 4, "model_switched"),
    causationId: "evt-003",
    fromModelId: "fixture-model-free-vision",
    toModelId: "fixture-model-neutral-generalist",
    fromProviderId: "fixture-provider-free",
    toProviderId: "fixture-provider-neutral",
    reason: "recovery_fallback",
  }),
  Object.freeze({
    ...base("evt-005", 5, "consent_recorded", "attribution_summary"),
    providerId: "fixture-provider-affiliate",
    consent: true,
    scope: "provider_referral",
    persisted: false,
  }),
  Object.freeze({
    ...base("evt-006", 6, "referral_click_recorded", "attribution_summary"),
    providerId: "fixture-provider-affiliate",
    destinationClass: "signup",
    consentAtClick: true,
    dryRun: true,
  }),
  Object.freeze({
    ...base("evt-007", 7, "redirect_failed"),
    causationId: "evt-006",
    providerId: "fixture-provider-affiliate",
    failureCode: "blocked",
    retryable: false,
    dryRun: true,
  }),
  Object.freeze({
    ...base("evt-008", 8, "tool_failed"),
    toolId: "fixture-tool-indexer",
    integrationId: "fixture-integration-local",
    failureCode: "timeout",
    retryable: true,
    durationMs: 30_000,
  }),
  Object.freeze({
    ...base("evt-009", 9, "recovery_action_recorded"),
    causationId: "evt-008",
    failureEventId: "evt-008",
    action: "fallback_offered",
    status: "offered",
    providerInvoked: false,
    statePersisted: false,
  }),
  Object.freeze({
    ...base("evt-010", 10, "execution_completed"),
    outcome: "completed",
    completedStepCount: 3,
    totalCostUsd: 0,
    recoveryRequired: false,
  }),
]);

export const RECOVERY_EVENT_STREAM_FIXTURE = Object.freeze({
  streamId: RECOVERY_FIXTURE_STREAM_ID,
  events: RECOVERY_EVENT_FIXTURES,
  nextSequence: RECOVERY_EVENT_FIXTURES.length + 1,
});
