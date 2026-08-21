import {
  canExecute,
  type AdapterResponse,
  type AgentProfile,
  type ExecutionRequest,
  type IntegrationAdapter,
  type ModelRecord,
  type ProviderRecord,
} from "../shared/agentosContracts";
import {
  mockAgents,
  mockModels,
  mockProviders,
  mockScenarios,
  type MockScenario,
} from "../shared/agentosMockFixtures";

function scenarioFor(
  providerId: ProviderRecord["id"],
  request: ExecutionRequest
): MockScenario | undefined {
  if (request.context.requiredCapabilities.includes("tools")) {
    return mockScenarios.find(
      item =>
        item.id === "capability-mismatch" && item.providerId === providerId
    );
  }
  return undefined;
}

function failureForScenario(scenario: MockScenario): AdapterResponse {
  const code = scenario.failureCode ?? "unknown";
  const state =
    code === "partial_stream"
      ? "partial"
      : code === "timeout"
        ? "timed_out"
        : "failed";
  const recoveryAction =
    code === "needs_connection"
      ? "request_connection"
      : code === "permission_denied"
        ? "request_permission"
        : code === "rate_limit" ||
            code === "timeout" ||
            code === "partial_stream"
          ? "wait_retry_after"
          : code === "provider_offline"
            ? "switch_provider"
            : code === "capability_mismatch"
              ? "degrade_capability"
              : "stop";

  return {
    ok: false,
    failure: {
      state,
      connection: scenario.connection,
      code,
      message: scenario.message,
      recoveryAction,
      retryAfterMs: scenario.retryAfterMs,
    },
  };
}

function successFor(
  request: ExecutionRequest,
  provider: ProviderRecord,
  model: ModelRecord
): AdapterResponse {
  const prompt = request.messages.at(-1)?.content ?? "";
  const chunks = [
    {
      sequence: 1,
      delta: `Local mock response for ${model.name}: `,
      state: "streaming" as const,
    },
    { sequence: 2, delta: prompt.slice(0, 120), state: "completed" as const },
  ];
  return {
    ok: true,
    result: {
      state: "completed",
      providerId: provider.id,
      modelId: model.id,
      content: chunks.map(chunk => chunk.delta).join(""),
      chunks,
      recoveryAction: null,
      retryAfterMs: null,
    },
  };
}

function createAdapter(
  provider: ProviderRecord,
  models: readonly ModelRecord[]
): IntegrationAdapter {
  return {
    provider,
    models,
    async execute(request) {
      const model = models.find(item => item.id === request.modelId);
      const agent = mockAgents.find(item => item.id === request.agentId);
      if (!model || !agent) {
        return failureForScenario({
          id: "unknown-request",
          providerId: provider.id,
          connection: "error",
          failureCode: "unknown",
          retryAfterMs: null,
          message: "The requested mock model or agent does not exist.",
        });
      }
      const explicitScenario =
        provider.id === "together" &&
        request.context.requiredCapabilities.includes("audio")
          ? mockScenarios.find(item => item.id === "generic-error")
          : provider.id === "together" &&
              request.context.requiredCapabilities.includes("streaming")
            ? mockScenarios.find(item => item.id === "partial-stream")
            : mockScenarios.find(
                item =>
                  item.providerId === provider.id &&
                  item.failureCode &&
                  (item.connection === provider.connection ||
                    (provider.connection === "limited" &&
                      item.failureCode === "rate_limit"))
              );
      if (explicitScenario) return failureForScenario(explicitScenario);
      if (!canExecute(provider, model, request, agent)) {
        const scenario = scenarioFor(provider.id, request);
        return failureForScenario(
          scenario ?? {
            id: "capability-mismatch",
            providerId: provider.id,
            connection: provider.connection,
            failureCode: "capability_mismatch",
            retryAfterMs: null,
            message:
              "The selected provider cannot satisfy the agent capabilities.",
          }
        );
      }
      return successFor(request, provider, model);
    },
  };
}

export const mockAdapters: readonly IntegrationAdapter[] = mockProviders.map(
  provider =>
    createAdapter(
      provider,
      mockModels.filter(model => model.providerId === provider.id)
    )
);

export function getMockAdapter(
  providerId: ProviderRecord["id"]
): IntegrationAdapter | undefined {
  return mockAdapters.find(adapter => adapter.provider.id === providerId);
}

export function getMockAgent(
  agentId: AgentProfile["id"]
): AgentProfile | undefined {
  return mockAgents.find(agent => agent.id === agentId);
}
