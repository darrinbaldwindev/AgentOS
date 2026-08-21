import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ControlPlaneIdentityBadge } from "../client/src/components/DashboardLayout";
import {
  EndUserTypingStatus,
  resetConversationState,
  shouldAcceptChatResponse,
} from "../client/src/pages/EndUserChat";
import {
  AIChatBox,
  copyTextToClipboard,
  getCopyStatusLabel,
  MarkdownMessage,
} from "../client/src/components/AIChatBox";

describe("AgentOS identity and typing UI", () => {
  it("renders distinct admin and owner control-plane badges", () => {
    const admin = renderToStaticMarkup(
      createElement(ControlPlaneIdentityBadge, { role: "admin" })
    );
    const owner = renderToStaticMarkup(
      createElement(ControlPlaneIdentityBadge, { role: "owner" })
    );
    expect(admin).toContain("ADMIN CONTROL");
    expect(owner).toContain("OWNER CONTROL");
    expect(admin).toContain('aria-label="Admin control plane"');
  });

  it("renders markdown structure and copy affordances for assistant content", () => {
    const markup = renderToStaticMarkup(
      createElement(MarkdownMessage, {
        content: "## Summary\\n\\n**bold** and `route` https://agentos.example",
      })
    );
    expect(markup).toContain("Summary");
    expect(markup).toContain("<strong>bold</strong>");
    expect(markup).toContain("route");
    expect(markup).toContain("https://agentos.example");
    const chatMarkup = renderToStaticMarkup(
      createElement(AIChatBox, {
        messages: [{ role: "assistant", content: "**hello**" }],
        onSendMessage: () => undefined,
        height: "200px",
      })
    );
    expect(chatMarkup).toContain('aria-label="Copy assistant message"');
    expect(getCopyStatusLabel("copied")).toBe("Copied");
    expect(getCopyStatusLabel("failed")).toContain("Copy failed");
  });

  it("exercises copy success and failure behavior", async () => {
    const success = await copyTextToClipboard("hello", async () => undefined);
    const failure = await copyTextToClipboard("hello", async () => {
      throw new Error("clipboard denied");
    });
    expect(success).toBe("copied");
    expect(failure).toBe("failed");
  });

  it("proves New Conversation clears state and advances the epoch", () => {
    const reset = resetConversationState(4);
    expect(reset).toEqual({
      nextEpoch: 5,
      messages: [],
      isTyping: false,
      pendingEpoch: null,
    });
    expect(shouldAcceptChatResponse(4, reset.nextEpoch)).toBe(false);
  });

  it("rejects stale replies after a new conversation epoch begins", () => {
    expect(shouldAcceptChatResponse(3, 3)).toBe(true);
    expect(shouldAcceptChatResponse(2, 3)).toBe(false);
  });

  it("renders both ready and active typing states", () => {
    const ready = renderToStaticMarkup(
      createElement(EndUserTypingStatus, { isTyping: false })
    );
    const typing = renderToStaticMarkup(
      createElement(EndUserTypingStatus, { isTyping: true })
    );
    expect(ready).toContain("Ready for your next message");
    expect(typing).toContain("AgentOS is typing");
    expect(typing).toContain("animate-pulse");
  });
});
