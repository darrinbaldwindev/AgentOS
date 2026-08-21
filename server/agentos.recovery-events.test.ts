import { describe, expect, it } from "vitest";
import { mapLocalRecoveryEvents } from "../shared/agentosRecoveryEvents";
import type { AdapterResponse } from "../shared/agentosContracts";

describe("AgentOS local recovery events", () => {
  it("maps successful local execution into append-only ordered safe events", () => {
    const events = mapLocalRecoveryEvents({
      providerId: "ollama",
      modelId: "ollama-default",
      consent: "declined",
      connection: "available",
      response: {
        ok: true,
        result: {
          state: "completed",
          providerId: "ollama",
          modelId: "ollama-default",
          content: "this must never enter the event record",
          chunks: [],
          recoveryAction: null,
          retryAfterMs: null,
        },
      },
      occurredAt: 1_756_000_000_000,
      sequenceStart: 40,
    });
    expect(events.map(item => item.sequence)).toEqual([40, 41]);
    expect(events.map(item => item.eventType)).toEqual([
      "provider_status",
      "execution",
    ]);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ consent: "declined", providerId: "ollama" }),
      ])
    );
    for (const item of events) {
      expect(item).not.toHaveProperty("content");
      expect(item).not.toHaveProperty("prompt");
      expect(item).not.toHaveProperty("secret");
      expect(item).not.toHaveProperty("conversationId");
      expect(item).not.toHaveProperty("requestId");
      expect(item.safeSummary).not.toContain("this must never enter");
    }
  });

  it("maps a rejected route to a governed stop action without execution content", () => {
    const events = mapLocalRecoveryEvents({
      providerId: "ollama",
      modelId: "ollama-default",
      consent: "granted",
      connection: "available",
      response: null,
      occurredAt: 1_756_000_000_000,
    });
    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({
      eventType: "recovery_action",
      recoveryAction: "stop",
      code: "route_rejected",
      consent: "granted",
    });
  });

  it("maps adapter failures to ordered execution and recovery action events", () => {
    const response: AdapterResponse = {
      ok: false,
      failure: {
        state: "partial",
        connection: "degraded",
        code: "partial_stream",
        message: "raw provider details stay out of the event",
        recoveryAction: "wait_retry_after",
        retryAfterMs: 15_000,
      },
    };
    const events = mapLocalRecoveryEvents({
      providerId: "together",
      modelId: "together-default",
      consent: "declined",
      connection: "degraded",
      response,
      occurredAt: 1_756_000_000_000,
    });
    expect(events.map(item => item.eventType)).toEqual([
      "provider_status",
      "execution",
      "recovery_action",
    ]);
    expect(events.map(item => item.sequence)).toEqual([1, 2, 3]);
    expect(events[1]).toMatchObject({
      executionState: "partial",
      code: "partial_stream",
      recoveryAction: "wait_retry_after",
    });
    expect(events[2]?.safeSummary).not.toContain("raw provider details");
  });
});
