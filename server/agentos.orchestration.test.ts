import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createContext(role: "admin" | "user" = "admin"): TrpcContext {
  return {
    user: {
      id: 71,
      openId: `orchestration-${role}`,
      email: "orchestration@example.com",
      name: "Orchestration Test",
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const routeInput = {
  providerId: "ollama" as const,
  modelId: "ollama-default",
  agentId: "general-assistant",
  requestedCapabilities: ["chat"] as const,
  consent: "declined" as const,
};

describe("AgentOS governed local orchestration", () => {
  it("returns an authenticated local-only catalog with affiliate routing disabled", async () => {
    const result = await appRouter
      .createCaller(createContext("user"))
      .agentos.orchestration.catalog();
    expect(result.mode).toBe("local_mock");
    expect(result.providers).toHaveLength(6);
    expect(result.affiliateRoutingEnabled).toBe(false);
  });

  it("limits health and scenario inspection to the owner control plane", async () => {
    const ordinary = appRouter.createCaller(createContext("user"));
    await expect(ordinary.agentos.orchestration.health()).rejects.toMatchObject(
      {
        code: "FORBIDDEN",
      }
    );
    await expect(
      ordinary.agentos.orchestration.scenarios()
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    const owner = appRouter.createCaller(createContext("admin"));
    await expect(owner.agentos.orchestration.health()).resolves.toHaveLength(6);
    await expect(owner.agentos.orchestration.scenarios()).resolves.toHaveLength(
      9
    );
  });

  it("resolves an available route deterministically without affiliate activation", async () => {
    const declined = await appRouter
      .createCaller(createContext("user"))
      .agentos.orchestration.resolve(routeInput);
    const granted = await appRouter
      .createCaller(createContext("user"))
      .agentos.orchestration.resolve({ ...routeInput, consent: "granted" });
    expect(declined).toMatchObject({
      status: "selected",
      providerId: "ollama",
      consent: "declined",
      affiliateRoutingEnabled: false,
      attributionRecorded: false,
    });
    expect(granted).toMatchObject({
      status: "selected",
      providerId: "ollama",
      consent: "granted",
      affiliateRoutingEnabled: false,
      attributionRecorded: false,
    });
    expect(granted.requiredCapabilities).toEqual(declined.requiredCapabilities);
  });

  it("rejects routes by provider policy and capability fit before affiliate status", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(
      caller.agentos.orchestration.resolve({
        ...routeInput,
        agentId: "tool-operator",
        requestedCapabilities: ["chat", "tools"],
      })
    ).resolves.toMatchObject({
      status: "rejected",
      reason: "provider_not_allowed",
      affiliateRoutingEnabled: false,
    });
    await expect(
      caller.agentos.orchestration.resolve({
        ...routeInput,
        agentId: "structured-analyst",
        requestedCapabilities: ["chat", "vision"],
      })
    ).resolves.toMatchObject({
      status: "rejected",
      reason: "capability_mismatch",
      affiliateRoutingEnabled: false,
    });
  });

  it("executes only a deterministic local mock response and isolates attribution from content", async () => {
    const result = await appRouter
      .createCaller(createContext("user"))
      .agentos.orchestration.execute({
        ...routeInput,
        message: "Prepare a local route plan",
        conversationId: "conversation-local",
        requestId: "request-local",
        inputTokens: 20,
        maxContextTokens: 4096,
      });
    expect(result.route).toMatchObject({ status: "selected" });
    expect(result.response).toMatchObject({ ok: true });
    if (result.response?.ok) {
      expect(result.response.result.content).toContain(
        "Prepare a local route plan"
      );
      expect(result.response.result.content).not.toContain("affiliate");
      expect(result.response.result.content).not.toContain("consent");
    }
  });

  it("denies unauthenticated catalog and execution access", async () => {
    const context = createContext("user");
    context.user = null;
    const caller = appRouter.createCaller(context);
    await expect(caller.agentos.orchestration.catalog()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(
      caller.agentos.orchestration.execute({
        ...routeInput,
        message: "unauthorized",
        conversationId: "conversation-local",
        requestId: "request-local",
        inputTokens: 1,
        maxContextTokens: 4096,
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
