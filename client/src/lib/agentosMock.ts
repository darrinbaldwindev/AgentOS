export const CONNECTION_STATES = [
  "unknown",
  "checking",
  "available",
  "needs_connection",
  "limited",
  "degraded",
  "offline",
] as const;

export type ConnectionState = (typeof CONNECTION_STATES)[number];
export type AttributionEventType = "model_switch" | "referral_click";
export type RecoveryKind =
  | "rate_limit"
  | "quota_exhausted"
  | "provider_offline"
  | "capability_mismatch"
  | "permission_denied"
  | "tool_timeout"
  | "partial_stream"
  | "artifact_conflict"
  | "referral_failure";

export type Provider = {
  id: string;
  name: string;
  category: string;
  state: ConnectionState;
  latencyMs: number;
  uptime: string;
  health: ProviderHealth;
  freeTier: string;
  costTier: "free" | "credits" | "paid";
  privacy: "local" | "standard" | "managed";
  affiliateEligible: boolean;
  liveRoutingEnabled: boolean;
  capabilities: string[];
  accent: string;
};

export type RecoveryEvent = {
  id: string;
  kind: RecoveryKind;
  provider: string;
  action: string;
  status: "resolved" | "awaiting_user" | "observed";
  timestamp: string;
  containsPrompt: false;
  containsSecret: false;
};

export type AttributionEvent = {
  id: string;
  type: AttributionEventType;
  provider: string;
  consent: "not_required" | "granted" | "declined";
  timestamp: string;
  projectId?: never;
  threadId?: never;
};

export const providers: Provider[] = [
  {
    id: "ollama",
    name: "Ollama Local",
    category: "Local inference",
    state: "available",
    latencyMs: 118,
    uptime: "99.9%",
    health: { latencyMs: 118, uptimePct: 99.9 },
    freeTier: "Local",
    costTier: "free",
    privacy: "local",
    affiliateEligible: false,
    liveRoutingEnabled: false,
    capabilities: ["chat", "code", "vision"],
    accent: "cyan",
  },
  {
    id: "together",
    name: "Together AI",
    category: "Model API",
    state: "limited",
    latencyMs: 342,
    uptime: "98.7%",
    health: { latencyMs: 342, uptimePct: 98.7 },
    freeTier: "Credits",
    costTier: "credits",
    privacy: "managed",
    affiliateEligible: true,
    liveRoutingEnabled: false,
    capabilities: ["chat", "code", "json"],
    accent: "violet",
  },
  {
    id: "taskade",
    name: "Taskade",
    category: "Agent workspace",
    state: "available",
    latencyMs: 284,
    uptime: "99.2%",
    health: { latencyMs: 284, uptimePct: 99.2 },
    freeTier: "Free plan",
    costTier: "free",
    privacy: "standard",
    affiliateEligible: true,
    liveRoutingEnabled: false,
    capabilities: ["agents", "tasks", "workflows"],
    accent: "pink",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "Voice AI",
    state: "degraded",
    latencyMs: 621,
    uptime: "96.4%",
    health: { latencyMs: 621, uptimePct: 96.4 },
    freeTier: "10k credits",
    costTier: "credits",
    privacy: "managed",
    affiliateEligible: true,
    liveRoutingEnabled: false,
    capabilities: ["speech", "voice", "transcription"],
    accent: "amber",
  },
  {
    id: "n8n",
    name: "n8n",
    category: "Automation",
    state: "needs_connection",
    latencyMs: 0,
    uptime: "—",
    health: { latencyMs: 0, uptimePct: 0 },
    freeTier: "Self-hosted",
    costTier: "free",
    privacy: "local",
    affiliateEligible: true,
    liveRoutingEnabled: false,
    capabilities: ["workflows", "webhooks", "tools"],
    accent: "orange",
  },
  {
    id: "github",
    name: "GitHub",
    category: "Developer workflow",
    state: "offline",
    latencyMs: 0,
    uptime: "—",
    health: { latencyMs: 0, uptimePct: 0 },
    freeTier: "Free plan",
    costTier: "free",
    privacy: "standard",
    affiliateEligible: false,
    liveRoutingEnabled: false,
    capabilities: ["repos", "issues", "pull requests"],
    accent: "slate",
  },
];

export const trafficSeries = [
  { label: "MON", clicks: 86, signups: 19 },
  { label: "TUE", clicks: 112, signups: 26 },
  { label: "WED", clicks: 98, signups: 22 },
  { label: "THU", clicks: 145, signups: 34 },
  { label: "FRI", clicks: 161, signups: 41 },
  { label: "SAT", clicks: 132, signups: 29 },
  { label: "SUN", clicks: 188, signups: 47 },
];

export const recoveryEvents: RecoveryEvent[] = [
  {
    id: "re-01",
    kind: "rate_limit",
    provider: "Together AI",
    action: "Queued local route; retry window 18s",
    status: "resolved",
    timestamp: "2m ago",
    containsPrompt: false,
    containsSecret: false,
  },
  {
    id: "re-02",
    kind: "partial_stream",
    provider: "ElevenLabs",
    action: "Preserved partial output; awaiting user retry",
    status: "awaiting_user",
    timestamp: "8m ago",
    containsPrompt: false,
    containsSecret: false,
  },
  {
    id: "re-03",
    kind: "provider_offline",
    provider: "GitHub",
    action: "Kept repository action read-only",
    status: "observed",
    timestamp: "14m ago",
    containsPrompt: false,
    containsSecret: false,
  },
  {
    id: "re-04",
    kind: "referral_failure",
    provider: "Taskade",
    action: "Continued without referral redirect",
    status: "resolved",
    timestamp: "21m ago",
    containsPrompt: false,
    containsSecret: false,
  },
];

export const attributionEvents: AttributionEvent[] = [
  {
    id: "at-01",
    type: "model_switch",
    provider: "Ollama Local",
    consent: "not_required",
    timestamp: "09:42:11",
  },
  {
    id: "at-02",
    type: "referral_click",
    provider: "Taskade",
    consent: "granted",
    timestamp: "09:37:28",
  },
  {
    id: "at-03",
    type: "model_switch",
    provider: "Together AI",
    consent: "not_required",
    timestamp: "09:31:04",
  },
  {
    id: "at-04",
    type: "referral_click",
    provider: "ElevenLabs",
    consent: "declined",
    timestamp: "09:20:51",
  },
];

export function nextConnectionState(current: ConnectionState): ConnectionState {
  const index = CONNECTION_STATES.indexOf(current);
  return CONNECTION_STATES[Math.min(index + 1, CONNECTION_STATES.length - 1)];
}

export function recoveryAction(kind: RecoveryKind): string {
  const actions: Record<RecoveryKind, string> = {
    rate_limit: "Queue retry and offer a non-monetized local route",
    quota_exhausted: "Preserve task and offer local or user-selected route",
    provider_offline: "Keep current project state and expose read-only mode",
    capability_mismatch:
      "Block incompatible route and offer a fit-ranked alternative",
    permission_denied:
      "Leave writes unapplied and request explicit scope review",
    tool_timeout: "Retry only idempotent actions; preserve tool diagnostics",
    partial_stream:
      "Preserve partial output and offer resume, retry, or export",
    artifact_conflict:
      "Preserve local copy and require a diff before overwrite",
    referral_failure:
      "Continue core task without referral or attribution redirect",
  };
  return actions[kind];
}

export function buildReferralPreview(
  provider: Provider,
  consent: "granted" | "declined"
) {
  if (consent !== "granted" || !provider.affiliateEligible) return null;
  return {
    provider: provider.id,
    consent,
    params: { source: "agentos", placement: "provider_selector" },
    containsProjectData: false,
    containsThreadData: false,
    opensNetwork: false,
  } as const;
}

export type ProviderHealth = { latencyMs: number; uptimePct: number };
export type ModelRecord = {
  id: string;
  providerId: string;
  name: string;
  capabilities: string[];
  costTier: "free" | "credits" | "paid";
  contextWindow: string;
};
export type ExecutionState =
  | "idle"
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface IntegrationAdapter {
  id: string;
  name: string;
  category: string;
  contract:
    | "stream + transcript"
    | "webhook + tools"
    | "events + availability"
    | "draft + publish gate"
    | "snapshot + restore";
  state: ConnectionState;
  providerId: string;
  supports: string[];
  ownerApprovalRequired: true;
}

export const models: ModelRecord[] = [
  {
    id: "ollama-qwen",
    providerId: "ollama",
    name: "Qwen local",
    capabilities: ["chat", "code"],
    costTier: "free",
    contextWindow: "32k",
  },
  {
    id: "together-llama",
    providerId: "together",
    name: "Llama hosted",
    capabilities: ["chat", "json"],
    costTier: "credits",
    contextWindow: "128k",
  },
];

export const integrationAdapters: IntegrationAdapter[] = [
  {
    id: "voice-ai",
    name: "Voice AI",
    category: "speech",
    contract: "stream + transcript",
    state: "degraded",
    providerId: "elevenlabs",
    supports: ["speech", "voice", "transcription"],
    ownerApprovalRequired: true,
  },
  {
    id: "workflow",
    name: "Workflow automation",
    category: "automation",
    contract: "webhook + tools",
    state: "needs_connection",
    providerId: "n8n",
    supports: ["webhooks", "tools"],
    ownerApprovalRequired: true,
  },
  {
    id: "calendar",
    name: "Calendar / productivity",
    category: "productivity",
    contract: "events + availability",
    state: "available",
    providerId: "taskade",
    supports: ["events", "availability"],
    ownerApprovalRequired: true,
  },
  {
    id: "site-builder",
    name: "Site builder",
    category: "publishing",
    contract: "draft + publish gate",
    state: "limited",
    providerId: "taskade",
    supports: ["draft", "publish gate"],
    ownerApprovalRequired: true,
  },
  {
    id: "backup",
    name: "Backup / sync",
    category: "recovery",
    contract: "snapshot + restore",
    state: "unknown",
    providerId: "ollama",
    supports: ["snapshot", "restore"],
    ownerApprovalRequired: true,
  },
];

export type RecoveryResult = {
  kind: RecoveryKind;
  status: RecoveryEvent["status"];
  action: string;
};
export function executeRecovery(kind: RecoveryKind): RecoveryResult {
  const status: RecoveryEvent["status"] =
    kind === "permission_denied" ||
    kind === "artifact_conflict" ||
    kind === "partial_stream"
      ? "awaiting_user"
      : "resolved";
  return { kind, status, action: recoveryAction(kind) };
}

export class AppendOnlyRecoveryLog {
  private readonly entries: RecoveryEvent[];
  constructor(seed: RecoveryEvent[] = []) {
    this.entries = seed.map(entry => ({
      ...entry,
      containsPrompt: false,
      containsSecret: false,
    }));
  }
  append(
    input: Omit<RecoveryEvent, "containsPrompt" | "containsSecret">
  ): RecoveryEvent {
    const entry: RecoveryEvent = {
      ...input,
      containsPrompt: false,
      containsSecret: false,
    };
    this.entries.push(Object.freeze(entry));
    return entry;
  }
  snapshot(): readonly RecoveryEvent[] {
    return this.entries.map(entry => ({ ...entry }));
  }
}

export function summarizeTraffic(series = trafficSeries) {
  const clicks = series.reduce((sum, item) => sum + item.clicks, 0);
  const signups = series.reduce((sum, item) => sum + item.signups, 0);
  return {
    clicks,
    signups,
    conversionRate: Number((signups / clicks).toFixed(3)),
  };
}

export const MOCK_DATA_STATES = ["ready", "loading", "empty", "error"] as const;
export type MockDataState = (typeof MOCK_DATA_STATES)[number];
export type MockDatasetKey =
  | "providers"
  | "affiliates"
  | "adapters"
  | "recovery";

export function nextMockDataState(current: MockDataState): MockDataState {
  const index = MOCK_DATA_STATES.indexOf(current);
  return MOCK_DATA_STATES[(index + 1) % MOCK_DATA_STATES.length];
}

export function createMockDatasetStates(
  state: MockDataState = "ready"
): Record<MockDatasetKey, MockDataState> {
  return {
    providers: state,
    affiliates: state,
    adapters: state,
    recovery: state,
  };
}
