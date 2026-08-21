import {
  hasCapabilities,
  type AdapterResponse,
  type AgentOSCapability,
  type AgentOSProviderId,
  type ExecutionRequest,
} from "../shared/agentosContracts";
import {
  mockAgents,
  mockIntegrations,
  mockModels,
  mockProviders,
  mockScenarios,
} from "../shared/agentosMockFixtures";
import { getMockAdapter } from "./agentosMockAdapters";

export interface RouteResolutionInput {
  providerId: AgentOSProviderId;
  modelId: string;
  agentId: string;
  requestedCapabilities: readonly AgentOSCapability[];
  consent: "granted" | "declined";
}

export type RouteResolution =
  | {
      status: "selected";
      providerId: AgentOSProviderId;
      modelId: string;
      agentId: string;
      requiredCapabilities: readonly AgentOSCapability[];
      consent: "granted" | "declined";
      connection: "available";
      affiliateRoutingEnabled: false;
      attributionRecorded: false;
    }
  | {
      status: "rejected";
      providerId: AgentOSProviderId;
      modelId: string;
      agentId: string;
      requiredCapabilities: readonly AgentOSCapability[];
      consent: "granted" | "declined";
      reason:
        | "unknown_model"
        | "unknown_agent"
        | "provider_not_allowed"
        | "capability_mismatch";
      affiliateRoutingEnabled: false;
      attributionRecorded: false;
    };

function uniqueCapabilities(
  capabilities: readonly AgentOSCapability[]
): readonly AgentOSCapability[] {
  return Array.from(new Set(capabilities));
}

export function getMockCatalog() {
  return {
    mode: "local_mock" as const,
    providers: mockProviders,
    models: mockModels,
    agents: mockAgents,
    integrations: mockIntegrations,
    affiliateRoutingEnabled: false as const,
  };
}

export function getMockHealth() {
  return mockIntegrations.map(integration => ({
    providerId: integration.providerId,
    connection: integration.connection,
    retryAfterMs: integration.retryAfterMs,
    lastCheckedAt: integration.lastCheckedAt,
    source: "deterministic_local_fixture" as const,
  }));
}

export function getMockScenarios() {
  return mockScenarios;
}

export function resolveMockRoute(input: RouteResolutionInput): RouteResolution {
  const provider = mockProviders.find(item => item.id === input.providerId);
  const model = mockModels.find(
    item => item.id === input.modelId && item.providerId === input.providerId
  );
  const agent = mockAgents.find(item => item.id === input.agentId);
  const requiredCapabilities = uniqueCapabilities([
    ...(agent?.requiredCapabilities ?? []),
    ...input.requestedCapabilities,
  ]);
  const base = {
    providerId: input.providerId,
    modelId: input.modelId,
    agentId: input.agentId,
    requiredCapabilities,
    consent: input.consent,
    affiliateRoutingEnabled: false as const,
    attributionRecorded: false as const,
  };

  if (!agent) return { ...base, status: "rejected", reason: "unknown_agent" };
  if (!model || !provider) {
    return { ...base, status: "rejected", reason: "unknown_model" };
  }
  if (!agent.allowedProviderIds.includes(provider.id)) {
    return { ...base, status: "rejected", reason: "provider_not_allowed" };
  }
  if (
    provider.connection !== "available" ||
    model.connection !== "available" ||
    !hasCapabilities(provider.capabilities, requiredCapabilities) ||
    !hasCapabilities(model.capabilities, requiredCapabilities)
  ) {
    return { ...base, status: "rejected", reason: "capability_mismatch" };
  }
  return { ...base, status: "selected", connection: "available" };
}

export async function executeMockRoute(
  input: RouteResolutionInput & {
    message: string;
    conversationId: string;
    requestId: string;
    inputTokens: number;
    maxContextTokens: number;
  }
): Promise<{ route: RouteResolution; response: AdapterResponse | null }> {
  const route = resolveMockRoute(input);
  if (route.status === "rejected") return { route, response: null };
  const adapter = getMockAdapter(input.providerId);
  if (!adapter) return { route, response: null };
  const request: ExecutionRequest = {
    providerId: input.providerId,
    modelId: input.modelId,
    agentId: input.agentId,
    messages: [{ role: "user", content: input.message }],
    context: {
      conversationId: input.conversationId,
      requestId: input.requestId,
      inputTokens: input.inputTokens,
      maxContextTokens: input.maxContextTokens,
      requiredCapabilities: route.requiredCapabilities,
    },
    attribution: {
      consent: input.consent,
      eventType: "model_switch",
      providerId: input.providerId,
      affiliateStatus: adapter.provider.affiliateStatus,
    },
  };
  return { route, response: await adapter.execute(request) };
}
