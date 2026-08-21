import { describe, expect, it } from "vitest";
import {
  PRIVATE_CONVERSATION_RETENTION_DAYS,
  assertPrivateConversationMessageContent,
  getPrivateConversationExpiry,
  isPrivateConversationExpired,
} from "../shared/agentosConversationPolicy";

describe("AgentOS private conversation policy", () => {
  it("expires conversations thirty days after their latest persisted activity", () => {
    const now = new Date("2026-08-21T00:00:00.000Z");
    const expiry = getPrivateConversationExpiry(now);
    expect(PRIVATE_CONVERSATION_RETENTION_DAYS).toBe(30);
    expect(expiry.toISOString()).toBe("2026-09-20T00:00:00.000Z");
    expect(isPrivateConversationExpired(expiry, now)).toBe(false);
    expect(isPrivateConversationExpired(expiry, expiry)).toBe(true);
  });

  it("allows user-visible content but rejects likely secret-bearing material before persistence", () => {
    expect(assertPrivateConversationMessageContent("  Draft a plan.  ")).toBe(
      "Draft a plan."
    );
    expect(() =>
      assertPrivateConversationMessageContent("api_key=sk_examplesecretvalue")
    ).toThrow("Remove secret-like material");
    expect(() =>
      assertPrivateConversationMessageContent(
        "-----BEGIN OPENSSH PRIVATE KEY----- private material"
      )
    ).toThrow("Remove secret-like material");
  });
});
