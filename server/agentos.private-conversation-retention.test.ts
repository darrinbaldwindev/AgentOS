import { describe, expect, it } from "vitest";
import {
  getPrivateConversationExpiry,
  isPrivateConversationExpired,
} from "../shared/agentosConversationPolicy";

describe("AgentOS private-conversation retention policy", () => {
  it("treats the exact 30-day expiry boundary as expired", () => {
    const savedAt = new Date("2026-08-22T00:00:00.000Z");
    const expiresAt = getPrivateConversationExpiry(savedAt);

    expect(isPrivateConversationExpired(expiresAt, expiresAt)).toBe(true);
    expect(
      isPrivateConversationExpired(expiresAt, new Date(expiresAt.getTime() - 1))
    ).toBe(false);
  });
});
