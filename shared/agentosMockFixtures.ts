import type {
  AgentProfile,
  AgentOSCapability,
  AgentOSProviderId,
  ConnectionState,
  IntegrationRecord,
  ModelRecord,
  ProviderRecord,
} from "./agentosContracts";

export interface MockScenario {
  id: string;
  providerId: AgentOSProviderId;
  connection: ConnectionState;
  failureCode?:
    | "needs_connection"
    | "rate_limit"
    | "provider_offline"
    | "permission_denied"
    | "timeout"
    | "partial_stream"
    | "capability_mismatch"
    | "unknown";
  retryAfterMs: number | null;
  message: string;
}

const chatCapabilities: readonly AgentOSCapability[] = [
  "chat",
  "streaming",
  "json",
];

export const mockProviders: readonly ProviderRecord[] = [
  {
    id: "ollama",
    name: "Ollama Local",
    connection: "available",
    capabilities: [...chatCapabilities, "local"],
    privacy: "local",
    cost: "free",
    affiliateStatus: "none",
  },
  {
    id: "together",
    name: "Together AI",
    connection: "limited",
    capabilities: chatCapabilities,
    privacy: "remote",
    cost: "usage",
    affiliateStatus: "pending",
  },
  {
    id: "taskade",
    name: "Taskade",
    connection: "needs_connection",
    capabilities: ["chat", "tools"],
    privacy: "remote",
    cost: "subscription",
    affiliateStatus: "verified",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    connection: "degraded",
    capabilities: ["audio"],
    privacy: "remote",
    cost: "usage",
    affiliateStatus: "pending",
  },
  {
    id: "n8n",
    name: "n8n",
    connection: "permission_denied",
    capabilities: ["tools", "mcp"],
    privacy: "mixed",
    cost: "subscription",
    affiliateStatus: "none",
  },
  {
    id: "github",
    name: "GitHub",
    connection: "offline",
    capabilities: ["tools", "mcp"],
    privacy: "remote",
    cost: "subscription",
    affiliateStatus: "none",
  },
];

export const mockModels: readonly ModelRecord[] = mockProviders.flatMap(
  provider => [
    {
      id: `${provider.id}-default`,
      providerId: provider.id,
      name: `${provider.name} Default`,
      capabilities: provider.capabilities,
      contextTokens: provider.id === "ollama" ? 8192 : 4096,
      freeTier: provider.cost === "free",
      connection: provider.connection,
    },
  ]
);

export const mockAgents: readonly AgentProfile[] = [
  {
    id: "general-assistant",
    name: "General Assistant",
    description: "A neutral chat agent for drafting, analysis, and planning.",
    defaultModelId: "ollama-default",
    requiredCapabilities: ["chat"],
    allowedProviderIds: mockProviders.map(provider => provider.id),
  },
  {
    id: "structured-analyst",
    name: "Structured Analyst",
    description:
      "Produces machine-readable responses when a provider supports JSON.",
    defaultModelId: "ollama-default",
    requiredCapabilities: ["chat", "json"],
    allowedProviderIds: ["ollama", "together"],
  },
  {
    id: "tool-operator",
    name: "Tool Operator",
    description:
      "Uses governed tools only when the integration is connected and permitted.",
    defaultModelId: "taskade-default",
    requiredCapabilities: ["chat", "tools"],
    allowedProviderIds: ["taskade", "n8n", "github"],
  },
];

export const mockIntegrations: readonly IntegrationRecord[] = mockProviders.map(
  provider => ({
    id: `${provider.id}-integration`,
    providerId: provider.id,
    kind: "provider",
    connection: provider.connection,
    lastCheckedAt: 1_756_000_000_000,
    retryAfterMs:
      provider.connection === "limited" || provider.connection === "degraded"
        ? 30_000
        : null,
  })
);

export const mockScenarios: readonly MockScenario[] = [
  {
    id: "available-chat",
    providerId: "ollama",
    connection: "available",
    retryAfterMs: null,
    message: "Local provider is ready.",
  },
  {
    id: "needs-connection",
    providerId: "taskade",
    connection: "needs_connection",
    failureCode: "needs_connection",
    retryAfterMs: null,
    message: "Connect this provider before using it.",
  },
  {
    id: "rate-limited",
    providerId: "together",
    connection: "rate_limited",
    failureCode: "rate_limit",
    retryAfterMs: 30_000,
    message: "Provider rate limit reached; wait before retrying.",
  },
  {
    id: "provider-offline",
    providerId: "github",
    connection: "offline",
    failureCode: "provider_offline",
    retryAfterMs: 60_000,
    message: "Provider health check failed.",
  },
  {
    id: "permission-denied",
    providerId: "n8n",
    connection: "permission_denied",
    failureCode: "permission_denied",
    retryAfterMs: null,
    message: "The current identity lacks permission for this integration.",
  },
  {
    id: "timeout",
    providerId: "elevenlabs",
    connection: "degraded",
    failureCode: "timeout",
    retryAfterMs: 10_000,
    message: "Provider did not respond before the execution deadline.",
  },
  {
    id: "partial-stream",
    providerId: "together",
    connection: "degraded",
    failureCode: "partial_stream",
    retryAfterMs: 15_000,
    message: "The stream ended before completion.",
  },
  {
    id: "capability-mismatch",
    providerId: "github",
    connection: "available",
    failureCode: "capability_mismatch",
    retryAfterMs: null,
    message: "The selected provider cannot satisfy the agent capabilities.",
  },
  {
    id: "generic-error",
    providerId: "together",
    connection: "error",
    failureCode: "unknown",
    retryAfterMs: null,
    message: "The mock provider returned an unexpected execution error.",
  },
];
