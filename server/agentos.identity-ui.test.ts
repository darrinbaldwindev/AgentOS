import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ControlPlaneIdentityBadge } from "../client/src/components/DashboardLayout";
import { EndUserTypingStatus } from "../client/src/pages/EndUserChat";

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
