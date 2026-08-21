import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { invokeLLM } from "./_core/llm";
import { appendAttributionRecord } from "./db";
import { appRouter } from "./routers";

vi.mock("./db", () => ({
  appendAttributionRecord: vi.fn(async (record: unknown) => record),
  appendRecoveryRecord: vi.fn(),
  listAttributionRecords: vi.fn(async () => []),
  listRecoveryRecords: vi.fn(async () => []),
}));
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    id: "response-1",
    created: Date.now(),
    model: "agentos-default",
    choices: [
      {
        index: 0,
        message: { role: "assistant" as const, content: "Governed response" },
        finish_reason: "stop",
      },
    ],
  })),
}));

function createContext(): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "router-test-user",
      email: "router@example.com",
      name: "Router Test",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("AgentOS protected procedures", () => {
  it("returns typed telemetry ranges and derived conversion metrics", async () => {
    const result = await appRouter
      .createCaller(createContext())
      .agentos.telemetry({ range: "4D" });
    expect(result.range).toBe("4D");
    expect(result.points).toHaveLength(4);
    expect(result.summary.clicks).toBe(626);
    expect(result.summary.signups).toBe(151);
  });

  it("records a model-switch event without context identifiers", async () => {
    const result = await appRouter.createCaller(createContext()).agentos.chat({
      providerId: "together",
      modelId: "qwen2.5-coder",
      previousProviderId: "ollama",
      previousModelId: "agentos-default",
      consent: "declined",
      messages: [{ role: "user", content: "Switch safely" }],
    });
    expect(result.attributionRecorded).toBe(true);
    expect(appendAttributionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "model_switch",
        userId: 7,
        provider: "together",
      })
    );
    expect(appendAttributionRecord.mock.calls[0]?.[0]).not.toHaveProperty(
      "projectId"
    );
    expect(appendAttributionRecord.mock.calls[0]?.[0]).not.toHaveProperty(
      "threadId"
    );
    expect(invokeLLM).toHaveBeenCalledOnce();
  });
});
