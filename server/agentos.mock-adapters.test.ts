import { describe, expect, it } from "vitest";
import { getMockAdapter } from "./agentosMockAdapters";
import {
  mockAgents,
  mockModels,
  mockProviders,
  mockScenarios,
} from "../shared/agentosMockFixtures";
import type { ExecutionRequest } from "../shared/agentosContracts";

const baseRequest = (
  providerId: ExecutionRequest["providerId"],
  modelId: string,
  agentId = "general-assistant"
): ExecutionRequest => ({
  providerId,
  modelId,
  agentId,
  messages: [{ role: "user", content: "hello AgentOS" }],
  context: {
    conversationId: "conversation-test",
    requestId: "request-test",
    inputTokens: 12,
    maxContextTokens: 4096,
    requiredCapabilities: ["chat"],
  },
  attribution: {
    consent: "declined",
    eventType: "model_switch",
    providerId,
    affiliateStatus: "verified",
  },
});

describe("AgentOS deterministic mock adapters", () => {
  it("provides aligned provider, model, and agent fixtures", () => {
    expect(mockProviders).toHaveLength(6);
    expect(mockModels).toHaveLength(mockProviders.length);
    expect(mockAgents.map(agent => agent.id)).toEqual([
      "general-assistant",
      "structured-analyst",
      "tool-operator",
    ]);
    expect(mockScenarios.map(scenario => scenario.id)).toEqual([
      "available-chat",
      "needs-connection",
      "rate-limited",
      "provider-offline",
      "permission-denied",
      "timeout",
      "partial-stream",
      "capability-mismatch",
      "generic-error",
    ]);
  });

  it("returns deterministic local success without network or attribution side effects", async () => {
    const adapter = getMockAdapter("ollama");
    const response = await adapter?.execute(
      baseRequest("ollama", "ollama-default")
    );
    expect(response?.ok).toBe(true);
    if (response?.ok) {
      expect(response.result.content).toContain("Local mock response");
      expect(response.result.chunks).toHaveLength(2);
      expect(response.result.recoveryAction).toBeNull();
    }
  });

  it.each([
    ["taskade", "needs_connection", "request_connection", null],
    ["together", "rate_limit", "wait_retry_after", 30_000],
    ["github", "provider_offline", "switch_provider", 60_000],
    ["n8n", "permission_denied", "request_permission", null],
    ["elevenlabs", "timeout", "wait_retry_after", 10_000],
  ] as const)(
    "returns stable %s failure semantics",
    async (providerId, code, action, retryAfterMs) => {
      const adapter = getMockAdapter(providerId);
      const response = await adapter?.execute(
        baseRequest(providerId, `${providerId}-default`)
      );
      expect(response?.ok).toBe(false);
      if (response && !response.ok) {
        expect(response.failure.code).toBe(code);
        expect(response.failure.recoveryAction).toBe(action);
        expect(response.failure.retryAfterMs).toBe(retryAfterMs);
      }
    }
  );

  it("represents partial streams as recoverable partial execution", async () => {
    const adapter = getMockAdapter("together");
    const response = await adapter?.execute({
      ...baseRequest("together", "together-default"),
      context: {
        ...baseRequest("together", "together-default").context,
        requiredCapabilities: ["chat", "streaming"],
      },
    });
    expect(response?.ok).toBe(false);
    if (response && !response.ok) {
      expect(response.failure.code).toBe("partial_stream");
    }
  });

  it("returns a deterministic generic error state", async () => {
    const adapter = getMockAdapter("together");
    const request = baseRequest("together", "together-default");
    const response = await adapter?.execute({
      ...request,
      context: { ...request.context, requiredCapabilities: ["audio"] },
    });
    expect(response?.ok).toBe(false);
    if (response && !response.ok) {
      expect(response.failure.connection).toBe("error");
      expect(response.failure.code).toBe("unknown");
      expect(response.failure.recoveryAction).toBe("stop");
    }
  });

  it("rejects capability mismatch without using affiliate status to override fit", async () => {
    const adapter = getMockAdapter("ollama");
    const response = await adapter?.execute(
      baseRequest("ollama", "ollama-default", "tool-operator")
    );
    expect(response?.ok).toBe(false);
    if (response && !response.ok) {
      expect(response.failure.code).toBe("capability_mismatch");
      expect(response.failure.recoveryAction).toBe("degrade_capability");
    }
  });

  it("does not echo attribution parameters into execution content", async () => {
    const request = baseRequest("ollama", "ollama-default");
    const response = await getMockAdapter("ollama")?.execute(request);
    expect(response?.ok).toBe(true);
    if (response?.ok) {
      expect(response.result.content).not.toContain("affiliate");
      expect(response.result.content).not.toContain("consent");
      expect(response.result.content).toContain("hello AgentOS");
    }
  });
});
