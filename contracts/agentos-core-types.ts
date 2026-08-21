/**
 * AgentOS core interface drafts — A4
 *
 * Status: local contract draft only. These declarations do not imply a runnable
 * frontend, backend, provider connection, credential activation, or release.
 *
 * Evidence basis:
 * - Archived canonical Session 002: database schema design
 * - Archived canonical Session 003: context assembly
 * - Archived canonical Session 004: provider abstraction
 * - Archived canonical Session 006: IPC contract
 * - Archived canonical Session 013: agent loop
 * - Archived canonical Session 026: referral attribution
 *
 * Security boundary: API keys, tokens, passwords, and other secret values are
 * never represented here. A credential connection may reference a keychain item
 * or another approved secret-store handle, but never contains the secret itself.
 */

/** A sortable identifier supplied by the persistence layer; normally a ULID. */
export type AgentOsId = string;

/** Unix epoch time in milliseconds. */
export type TimestampMs = number;

/** JSON-safe values used at IPC and persistence boundaries. */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  readonly [key: string]: JsonValue;
}
export type JsonArray = readonly JsonValue[];

/** A reference to secret-store metadata only; it never carries a secret value. */
export interface SecretReference {
  readonly store: "os_keychain" | "external_secret_store";
  readonly reference: string;
}

export type ProviderKind = "cloud" | "local" | "gateway";
export type ProviderAuthKind = "bearer" | "api_key" | "none" | "oauth";

/**
 * Local integration states. `limited` is intentionally distinct from
 * `rate_limited`: the former describes a durable plan/quota limitation; the
 * latter indicates a transient retryable response.
 */
export type IntegrationStateKind =
  | "available"
  | "needs_connection"
  | "limited"
  | "offline"
  | "permission_denied"
  | "rate_limited"
  | "degraded"
  | "error";

export interface IntegrationState {
  readonly kind: IntegrationStateKind;
  readonly observedAt: TimestampMs;
  readonly detail?: string;
  readonly retryAfterSeconds?: number;
  readonly lastSuccessfulAt?: TimestampMs;
  readonly diagnosticCode?: string;
}

export interface ProviderCapabilities {
  readonly streaming: boolean;
  readonly tools: boolean;
  readonly vision: boolean;
  readonly jsonMode: boolean;
  readonly embeddings?: boolean;
  readonly systemPrompt?: boolean;
}

/**
 * Provider configuration that is safe to retain in the local registry. The
 * `credentialConnectionId` points to a secret-store reference and never to a
 * plaintext credential.
 */
export interface ProviderRecord {
  readonly id: AgentOsId;
  readonly name: string;
  readonly kind: ProviderKind;
  readonly apiBaseUrl: string;
  readonly authKind: ProviderAuthKind;
  readonly credentialConnectionId?: AgentOsId;
  readonly referralCodeConfigured: boolean;
  readonly referralUrl?: string;
  readonly referralNotes?: string;
  readonly capabilities: ProviderCapabilities;
  readonly requestLimitPerMinute?: number;
  readonly tokenLimitPerMinute?: number;
  readonly enabled: boolean;
  readonly health: IntegrationState;
  readonly createdAt: TimestampMs;
  readonly updatedAt: TimestampMs;
  readonly config: JsonObject;
}

export interface ModelPricing {
  readonly inputUsdPerMillionTokens?: number;
  readonly outputUsdPerMillionTokens?: number;
  readonly cacheReadUsdPerMillionTokens?: number;
  readonly cacheWriteUsdPerMillionTokens?: number;
}

export interface ModelScores {
  readonly quality?: number;
  readonly speed?: number;
  readonly coding?: number;
  readonly reasoning?: number;
}

export interface LocalModelRequirements {
  readonly sizeGb?: number;
  readonly memoryGb?: number;
  readonly filename?: string;
}

export interface ModelRecord {
  readonly id: AgentOsId;
  readonly providerId: AgentOsId;
  readonly apiName: string;
  readonly displayName: string;
  readonly contextWindow: number;
  readonly maxOutputTokens: number;
  readonly capabilities: Pick<ProviderCapabilities, "tools" | "vision"> & {
    readonly json: boolean;
    readonly systemPrompt: boolean;
  };
  readonly pricing: ModelPricing;
  readonly scores: ModelScores;
  readonly tags: readonly string[];
  readonly active: boolean;
  readonly deprecated: boolean;
  readonly localRequirements?: LocalModelRequirements;
  readonly createdAt: TimestampMs;
  readonly updatedAt: TimestampMs;
  readonly metadata: JsonObject;
}

/** A user-configurable profile for an autonomous AgentOS runtime. */
export interface AgentProfile {
  readonly id: AgentOsId;
  readonly name: string;
  readonly plannerModelId: AgentOsId;
  readonly executorModelId: AgentOsId;
  readonly verifierModelId?: AgentOsId;
  readonly maxSteps: number;
  readonly maxCostUsd: number;
  readonly stepTimeoutSeconds: number;
  readonly requireVerification: boolean;
  readonly enabled: boolean;
  readonly createdAt: TimestampMs;
  readonly updatedAt: TimestampMs;
  readonly metadata: JsonObject;
}

export type ArtifactKind =
  | "file"
  | "code"
  | "image"
  | "json"
  | "csv"
  | "mermaid"
  | "sql"
  | "diff";

export type ArtifactStorageKind = "inline" | "external";

/**
 * Metadata for a persisted artifact. Large or private contents remain behind a
 * storage handle; this contract does not require emitting them in telemetry or
 * attribution events.
 */
export interface ArtifactRecord {
  readonly id: AgentOsId;
  readonly messageId: AgentOsId;
  readonly threadId: AgentOsId;
  readonly projectId: AgentOsId;
  readonly kind: ArtifactKind;
  readonly title?: string;
  readonly filename?: string;
  readonly language?: string;
  readonly storage: ArtifactStorageKind;
  readonly contentText?: string;
  readonly externalPath?: string;
  readonly sizeBytes: number;
  readonly mimeType?: string;
  readonly version: number;
  readonly parentArtifactId?: AgentOsId;
  readonly createdAt: TimestampMs;
  readonly metadata: JsonObject;
}

export type ToolPermission =
  | "read_workspace"
  | "write_workspace"
  | "execute_sandbox"
  | "network_access"
  | "credential_access"
  | "user_confirmation";

export type ToolAvailability = "available" | "disabled" | "unavailable";

/** A catalog entry only; it deliberately contains no executable secret. */
export interface ToolRecord {
  readonly id: AgentOsId;
  readonly name: string;
  readonly namespace: string;
  readonly description: string;
  readonly inputSchema: JsonObject;
  readonly outputSchema?: JsonObject;
  readonly requiredPermissions: readonly ToolPermission[];
  readonly availability: ToolAvailability;
  readonly integrationId?: AgentOsId;
  readonly createdAt: TimestampMs;
  readonly updatedAt: TimestampMs;
  readonly metadata: JsonObject;
}

/**
 * Metadata for a connected provider or tool. Secret material belongs in the
 * referenced secure store and must not be serialized into database, telemetry,
 * event, or attribution payloads.
 */
export interface CredentialConnection {
  readonly id: AgentOsId;
  readonly integrationId: AgentOsId;
  readonly providerId?: AgentOsId;
  readonly secret: SecretReference;
  readonly state: IntegrationState;
  readonly createdAt: TimestampMs;
  readonly updatedAt: TimestampMs;
  readonly metadata: JsonObject;
}

export interface UserMessageInput {
  readonly text: string;
  readonly files: readonly FileInput[];
  readonly artifactRefs: readonly AgentOsId[];
}

export interface FileInput {
  readonly name: string;
  readonly mimeType: string;
  /** An opaque local path or transport handle; not a credential-bearing URL. */
  readonly source: string;
}

export interface ContextConfig {
  readonly maxContextTokens: number;
  readonly reservedOutputTokens: number;
  readonly systemPromptReservePercent: number;
  readonly recentWeight: number;
  readonly summaryWeight: number;
  readonly ragWeight: number;
  readonly artifactWeight: number;
  readonly ragEnabled: boolean;
  readonly ragTopK: number;
  readonly ragMinimumScore: number;
  readonly ragChunkTokens: number;
  readonly maxPinnedArtifacts: number;
  readonly artifactTokenLimit: number;
  readonly summarizeThreshold: number;
  readonly summaryModelId?: AgentOsId;
}

export interface BudgetAllocation {
  readonly system: number;
  readonly recent: number;
  readonly summary: number;
  readonly rag: number;
  readonly artifacts: number;
  readonly userInput: number;
}

export interface TokenBudget {
  readonly totalLimit: number;
  readonly reservedOutput: number;
  readonly availableForContext: number;
  readonly allocated: BudgetAllocation;
  readonly used: BudgetAllocation;
  readonly remaining: number;
}

export type ContextWarning =
  | {
      readonly kind: "truncated";
      readonly section: string;
      readonly droppedTokens: number;
      readonly droppedCount: number;
    }
  | {
      readonly kind: "rag_low_relevance";
      readonly query: string;
      readonly bestScore: number;
    }
  | {
      readonly kind: "artifact_too_large";
      readonly artifactId: AgentOsId;
      readonly tokens: number;
      readonly limit: number;
    }
  | {
      readonly kind: "system_prompt_overflow";
      readonly tokens: number;
      readonly limit: number;
    };

export type MessageRole = "user" | "assistant" | "system" | "tool" | "summary";

export interface ApiMessage {
  readonly role: MessageRole;
  readonly content: JsonValue;
  readonly metadata?: JsonObject;
}

export interface AssembledPrompt {
  readonly system: string;
  readonly messages: readonly ApiMessage[];
  readonly tokenEstimate: TokenBudget;
  readonly warnings: readonly ContextWarning[];
}

export interface ContextAssemblyRequest {
  readonly threadId: AgentOsId;
  readonly projectId: AgentOsId;
  readonly userMessage: UserMessageInput;
  readonly modelId?: AgentOsId;
  readonly providerHint?: AgentOsId;
  readonly overrides?: JsonObject;
}

export type ToolChoice = "auto" | "none" | "required" | { readonly named: string };

export type ResponseFormat =
  | { readonly kind: "text" }
  | { readonly kind: "json_object" }
  | { readonly kind: "json_schema"; readonly name: string; readonly schema: JsonObject };

export interface GenerationParameters {
  readonly temperature?: number;
  readonly topP?: number;
  readonly topK?: number;
  readonly maxTokens?: number;
  readonly stopSequences: readonly string[];
  readonly tools: readonly ToolRecord[];
  readonly toolChoice: ToolChoice;
  readonly responseFormat?: ResponseFormat;
  readonly seed?: number;
  readonly userId?: string;
  readonly providerOptions: JsonObject;
}

export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly cacheReadTokens?: number;
  readonly cacheWriteTokens?: number;
  readonly totalTokens: number;
}

export interface ToolCallDelta {
  readonly id?: string;
  readonly name?: string;
  readonly argumentsFragment?: string;
}

export interface StreamChunk {
  readonly content?: string;
  readonly toolCalls?: readonly ToolCallDelta[];
  readonly usage?: TokenUsage;
  readonly finishReason?: string;
  readonly raw: JsonValue;
}

export type ProviderErrorCode =
  | "auth"
  | "rate_limited"
  | "model_not_found"
  | "context_overflow"
  | "upstream"
  | "stream_closed"
  | "invalid_request";

export interface ProviderErrorState {
  readonly code: ProviderErrorCode;
  readonly message: string;
  readonly retryAfterSeconds?: number;
  readonly upstreamCode?: string;
}

export interface AgentExecutionContext {
  readonly workingDirectory: string;
  readonly repositoryUrl?: string;
  readonly pinnedFiles: readonly string[];
  /** Non-secret execution labels only; do not place environment values here. */
  readonly environmentKeys: readonly string[];
  readonly previousPlan?: AgentPlan;
  readonly previousResults: readonly ExecutionStepResult[];
}

export interface AgentTask {
  readonly id: AgentOsId;
  readonly projectId: AgentOsId;
  readonly threadId: AgentOsId;
  readonly objective: string;
  readonly context: AgentExecutionContext;
  readonly profileId: AgentOsId;
  readonly createdAt: TimestampMs;
}

export interface AgentPlan {
  readonly steps: readonly AgentPlanStep[];
  readonly reasoning: string;
  readonly estimatedCostUsd: number;
  readonly estimatedSteps: number;
}

export interface AgentPlanStep {
  readonly id: number;
  readonly description: string;
  readonly toolName?: string;
  readonly input: JsonObject;
  readonly successCriteria: string;
  readonly rollback?: string;
}

export type AgentAction =
  | { readonly kind: "tool_call"; readonly name: string; readonly arguments: JsonObject }
  | { readonly kind: "sandbox_exec"; readonly language: string; readonly code: string }
  | { readonly kind: "think"; readonly reasoning: string }
  | { readonly kind: "ask_user"; readonly question: string; readonly options: readonly string[] };

export interface ToolResult {
  readonly exitCode?: number;
  readonly output: JsonValue;
  readonly error?: string;
  readonly metadata: JsonObject;
}

export interface VerificationResult {
  readonly passed: boolean;
  readonly evidence: string;
  readonly suggestions: readonly string[];
}

export interface ExecutionStepResult {
  readonly stepId: number;
  readonly action: AgentAction;
  readonly output: ToolResult;
  readonly costUsd: number;
  readonly latencyMs: number;
  readonly success: boolean;
  readonly verification?: VerificationResult;
}

export type ExecutionStatus =
  | "queued"
  | "planning"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "budget_exceeded";

export interface ExecutionState {
  readonly taskId: AgentOsId;
  readonly status: ExecutionStatus;
  readonly plan?: AgentPlan;
  readonly currentStepId?: number;
  readonly stepResults: readonly ExecutionStepResult[];
  readonly totalCostUsd: number;
  readonly startedAt?: TimestampMs;
  readonly completedAt?: TimestampMs;
  readonly summary?: string;
  readonly failure?: ProviderErrorState | { readonly code: "verification_failed" | "budget_exceeded" | "internal"; readonly message: string };
}

export type AgentEvent =
  | { readonly kind: "plan_created"; readonly plan: AgentPlan }
  | { readonly kind: "step_started"; readonly step: AgentPlanStep }
  | { readonly kind: "step_completed"; readonly result: ExecutionStepResult }
  | { readonly kind: "step_verified"; readonly verification: VerificationResult }
  | { readonly kind: "step_failed"; readonly error: string; readonly rollback?: string }
  | { readonly kind: "cost_updated"; readonly totalUsd: number }
  | { readonly kind: "completed"; readonly success: boolean; readonly summary: string }
  | { readonly kind: "paused"; readonly reason: string };

export type ReferralProgramKind = "credit_share" | "cash" | "experimental" | "none";
export type TrendDirection = "up" | "flat" | "down" | "unknown";
export type ReferralStatus = "pending" | "active" | "expired" | "unknown";

/** Privacy-safe attribution summary; no raw prompts, artifact contents, or user identifiers. */
export interface ProviderAttribution {
  readonly provider: string;
  readonly referrals: number;
  readonly creditsEarned: number;
  readonly usdValue: number;
  readonly programType: ReferralProgramKind;
  readonly averageValuePerReferral: number;
  readonly trend: TrendDirection;
}

/** `userHash` must be an irreversible display-safe identifier, never an email or account ID. */
export interface UserAttribution {
  readonly userHash: string;
  readonly referrals: number;
  readonly totalValueUsd: number;
  readonly firstReferralAt: TimestampMs;
  readonly lastReferralAt: TimestampMs;
  readonly status: ReferralStatus;
}

export interface AttributionState {
  readonly totalEarnedUsd: number;
  readonly totalCreditsByCurrency: Readonly<Record<string, number>>;
  readonly byProvider: readonly ProviderAttribution[];
  readonly byReferralUser: readonly UserAttribution[];
  readonly projectedAnnualUsd: number;
  readonly calculatedAt: TimestampMs;
}

/** A minimal static registry suitable for offline fixtures and deterministic tests. */
export interface AgentOsCatalog {
  readonly providers: readonly ProviderRecord[];
  readonly models: readonly ModelRecord[];
  readonly agentProfiles: readonly AgentProfile[];
  readonly tools: readonly ToolRecord[];
  readonly credentialConnections: readonly CredentialConnection[];
}
