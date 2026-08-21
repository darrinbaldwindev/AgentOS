export const AGENTOS_PROVIDER_IDS = [
  "ollama",
  "together",
  "taskade",
  "elevenlabs",
  "n8n",
  "github",
] as const;

export type AgentOSProviderId = (typeof AGENTOS_PROVIDER_IDS)[number];

export type AgentOSCapability =
  | "chat"
  | "streaming"
  | "tools"
  | "vision"
  | "audio"
  | "json"
  | "local"
  | "mcp";

export type ConnectionState =
  | "available"
  | "needs_connection"
  | "limited"
  | "offline"
  | "permission_denied"
  | "rate_limited"
  | "degraded"
  | "error";

export type ExecutionState =
  | "idle"
  | "queued"
  | "connecting"
  | "streaming"
  | "completed"
  | "partial"
  | "timed_out"
  | "cancelled"
  | "failed";

export type RecoveryAction =
  | "retry"
  | "wait_retry_after"
  | "switch_provider"
  | "request_connection"
  | "request_permission"
  | "degrade_capability"
  | "stop";

export interface ProviderRecord {
  id: AgentOSProviderId;
  name: string;
  connection: ConnectionState;
  capabilities: readonly AgentOSCapability[];
  privacy: "local" | "remote" | "mixed";
  cost: "free" | "usage" | "subscription" | "unknown";
  affiliateStatus: "none" | "verified" | "pending" | "expired";
}

export interface ModelRecord {
  id: string;
  providerId: AgentOSProviderId;
  name: string;
  capabilities: readonly AgentOSCapability[];
  contextTokens: number;
  freeTier: boolean;
  connection: ConnectionState;
}

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  defaultModelId: string;
  requiredCapabilities: readonly AgentOSCapability[];
  allowedProviderIds: readonly AgentOSProviderId[];
}

export interface IntegrationRecord {
  id: string;
  providerId: AgentOSProviderId;
  kind: "provider" | "tool" | "storage" | "mcp" | "oauth";
  connection: ConnectionState;
  lastCheckedAt: number | null;
  retryAfterMs: number | null;
}

export interface ExecutionContext {
  conversationId: string;
  requestId: string;
  inputTokens: number;
  maxContextTokens: number;
  requiredCapabilities: readonly AgentOSCapability[];
}

export interface ArtifactRecord {
  id: string;
  kind: "text" | "file" | "code" | "structured";
  name: string;
  version: number;
}

export interface ToolRecord {
  id: string;
  name: string;
  state: "available" | "needs_connection" | "permission_denied" | "error";
  capabilities: readonly AgentOSCapability[];
}

export interface CredentialConnection {
  providerId: AgentOSProviderId;
  state: "not_required" | "missing" | "configured" | "expired" | "invalid";
  secretReference: string | null;
}

export interface AttributionContext {
  consent: "granted" | "declined";
  eventType: "model_switch" | "referral_click";
  providerId: AgentOSProviderId;
  affiliateStatus: ProviderRecord["affiliateStatus"];
}

export interface ExecutionRequest {
  providerId: AgentOSProviderId;
  modelId: string;
  agentId: string;
  messages: readonly {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
  context: ExecutionContext;
  attribution?: AttributionContext;
}

export interface ExecutionChunk {
  sequence: number;
  delta: string;
  state: "streaming" | "partial" | "completed";
}

export interface ExecutionResult {
  state: ExecutionState;
  providerId: AgentOSProviderId;
  modelId: string;
  content: string;
  chunks: readonly ExecutionChunk[];
  recoveryAction: RecoveryAction | null;
  retryAfterMs: number | null;
}

export interface ExecutionFailure {
  state: Exclude<ExecutionState, "completed" | "streaming">;
  connection: ConnectionState;
  code:
    | "needs_connection"
    | "rate_limit"
    | "provider_offline"
    | "permission_denied"
    | "timeout"
    | "partial_stream"
    | "capability_mismatch"
    | "unknown";
  message: string;
  recoveryAction: RecoveryAction;
  retryAfterMs: number | null;
}

export type AdapterResponse =
  | { ok: true; result: ExecutionResult }
  | { ok: false; failure: ExecutionFailure };

export interface IntegrationAdapter {
  readonly provider: ProviderRecord;
  readonly models: readonly ModelRecord[];
  execute(request: ExecutionRequest): Promise<AdapterResponse>;
}

export function hasCapabilities(
  available: readonly AgentOSCapability[],
  required: readonly AgentOSCapability[]
): boolean {
  return required.every(capability => available.includes(capability));
}

export function canExecute(
  provider: ProviderRecord,
  model: ModelRecord,
  request: Pick<ExecutionRequest, "context">,
  agent: AgentProfile
): boolean {
  return (
    provider.connection === "available" &&
    model.connection === "available" &&
    hasCapabilities(provider.capabilities, agent.requiredCapabilities) &&
    hasCapabilities(model.capabilities, agent.requiredCapabilities) &&
    request.context.inputTokens <= request.context.maxContextTokens
  );
}
