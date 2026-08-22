/**
 * AgentOS append-only local recovery event schemas — B6
 *
 * Status: local contract draft only. These types describe operational metadata
 * for recovery and attribution-safe observability. They intentionally exclude
 * prompt text, secret values, repository contents, raw tool input/output, and
 * private artifact payloads.
 */

export type RecoveryEventId = string;
export type RecoveryTimestampMs = number;
export type RecoveryEventVersion = 1;

export type RecoveryEventKind =
  | "execution_started"
  | "execution_completed"
  | "model_switched"
  | "fallback_selected"
  | "provider_status_changed"
  | "consent_recorded"
  | "referral_click_recorded"
  | "redirect_failed"
  | "tool_failed"
  | "recovery_action_recorded";

export type OperationalDataClass = "operational_metadata" | "attribution_summary";

/**
 * Event metadata contains stable references and operational context only. IDs
 * identify local records; no event carries user content or secret material.
 */
export interface RecoveryEventEnvelope {
  readonly schemaVersion: RecoveryEventVersion;
  readonly id: RecoveryEventId;
  readonly sequence: number;
  readonly occurredAt: RecoveryTimestampMs;
  readonly kind: RecoveryEventKind;
  readonly correlationId: string;
  readonly causationId?: RecoveryEventId;
  readonly executionId?: string;
  readonly projectId?: string;
  readonly threadId?: string;
  readonly dataClass: OperationalDataClass;
}

export type ExecutionOutcome = "completed" | "failed" | "cancelled" | "budget_exceeded";

export interface ExecutionStartedEvent extends RecoveryEventEnvelope {
  readonly kind: "execution_started";
  readonly agentProfileId: string;
  readonly plannedStepCount: number;
  readonly verificationRequired: boolean;
}

export interface ExecutionCompletedEvent extends RecoveryEventEnvelope {
  readonly kind: "execution_completed";
  readonly outcome: ExecutionOutcome;
  readonly completedStepCount: number;
  readonly totalCostUsd: number;
  readonly recoveryRequired: boolean;
}

export type ModelSwitchReason =
  | "user_selected"
  | "capability_mismatch"
  | "context_limit"
  | "provider_unavailable"
  | "cost_limit"
  | "recovery_fallback";

export interface ModelSwitchedEvent extends RecoveryEventEnvelope {
  readonly kind: "model_switched";
  readonly fromModelId: string;
  readonly toModelId: string;
  readonly fromProviderId: string;
  readonly toProviderId: string;
  readonly reason: ModelSwitchReason;
}

export interface FallbackSelectedEvent extends RecoveryEventEnvelope {
  readonly kind: "fallback_selected";
  readonly failedProviderId: string;
  readonly selectedProviderId: string;
  readonly selectedModelId: string;
  readonly selectionReason: "health" | "capability" | "privacy" | "cost" | "retry_policy";
  readonly candidateCount: number;
}

export type ProviderHealthKind =
  | "available"
  | "needs_connection"
  | "limited"
  | "offline"
  | "permission_denied"
  | "rate_limited"
  | "degraded"
  | "error";

export interface ProviderStatusChangedEvent extends RecoveryEventEnvelope {
  readonly kind: "provider_status_changed";
  readonly providerId: string;
  readonly from: ProviderHealthKind;
  readonly to: ProviderHealthKind;
  readonly diagnosticCode?: string;
  readonly retryAfterSeconds?: number;
}

/** Consent metadata identifies the decision scope, never an account or secret. */
export interface ConsentRecordedEvent extends RecoveryEventEnvelope {
  readonly kind: "consent_recorded";
  readonly providerId: string;
  readonly consent: boolean;
  readonly scope: "provider_referral" | "provider_connection";
  readonly persisted: boolean;
}

export type ReferralDestinationClass = "signup" | "pricing" | "documentation" | "other";

/**
 * The event records an attributed navigation category only. It must never store
 * a full external URL, referral code, browser history, or user identifier.
 */
export interface ReferralClickRecordedEvent extends RecoveryEventEnvelope {
  readonly kind: "referral_click_recorded";
  readonly providerId: string;
  readonly destinationClass: ReferralDestinationClass;
  readonly consentAtClick: boolean;
  readonly dryRun: boolean;
}

export type RedirectFailureCode = "blocked" | "invalid_destination" | "network_unavailable" | "unknown";

export interface RedirectFailedEvent extends RecoveryEventEnvelope {
  readonly kind: "redirect_failed";
  readonly providerId: string;
  readonly failureCode: RedirectFailureCode;
  readonly retryable: boolean;
  readonly dryRun: boolean;
}

export type ToolFailureCode =
  | "timeout"
  | "permission_denied"
  | "unavailable"
  | "invalid_contract"
  | "execution_error";

/** Tool failures carry identifiers and bounded diagnostics, never raw arguments or output. */
export interface ToolFailedEvent extends RecoveryEventEnvelope {
  readonly kind: "tool_failed";
  readonly toolId: string;
  readonly integrationId?: string;
  readonly failureCode: ToolFailureCode;
  readonly retryable: boolean;
  readonly durationMs?: number;
}

export type RecoveryActionKind =
  | "retry_scheduled"
  | "fallback_offered"
  | "fallback_selected"
  | "switch_model_offered"
  | "connection_required"
  | "permission_guidance_shown"
  | "context_compaction_offered"
  | "partial_output_preserved"
  | "user_confirmation_required";

export type RecoveryActionStatus = "offered" | "accepted" | "declined" | "completed" | "failed";

export interface RecoveryActionRecordedEvent extends RecoveryEventEnvelope {
  readonly kind: "recovery_action_recorded";
  readonly failureEventId: RecoveryEventId;
  readonly action: RecoveryActionKind;
  readonly status: RecoveryActionStatus;
  readonly providerInvoked: false;
  readonly statePersisted: boolean;
}

export type RecoveryEvent =
  | ExecutionStartedEvent
  | ExecutionCompletedEvent
  | ModelSwitchedEvent
  | FallbackSelectedEvent
  | ProviderStatusChangedEvent
  | ConsentRecordedEvent
  | ReferralClickRecordedEvent
  | RedirectFailedEvent
  | ToolFailedEvent
  | RecoveryActionRecordedEvent;

/**
 * An ordered local event stream. Producers append a new immutable event with a
 * strictly increasing sequence; corrections are represented by later events,
 * never mutation or deletion of earlier records.
 */
export interface AppendOnlyRecoveryEventStream {
  readonly streamId: string;
  readonly events: readonly RecoveryEvent[];
  readonly nextSequence: number;
}
