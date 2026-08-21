import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const catalogQueryState = vi.hoisted(() => ({
  data: {
    mode: "local_mock",
    providers: [
      {
        id: "ollama",
        name: "Ollama Local",
        readiness: "ready",
        models: [{ id: "ollama-default", name: "Ollama Local Default" }],
      },
    ],
    liveProviderCallsEnabled: false,
    affiliateRoutingEnabled: false,
  } as unknown,
  isLoading: false,
  error: null as unknown,
}));

vi.mock("@/components/AIChatBox", () => ({
  AIChatBox: () =>
    createElement("div", {
      role: "log",
      "aria-label": "End-user conversation",
    }),
}));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ loading: false, user: { role: "user" } }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    agentos: {
      chat: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      orchestration: {
        endUserCatalog: { useQuery: () => catalogQueryState },
      },
    },
  },
}));

import EndUserChat from "../client/src/pages/EndUserChat";

describe("AgentOS end-user chat surface", () => {
  it("is separate from owner telemetry and recovery controls", () => {
    const markup = renderToStaticMarkup(createElement(EndUserChat));
    expect(markup).toContain("user workspace");
    expect(markup).toContain('aria-label="Choose end-user provider"');
    expect(markup).toContain('aria-label="Choose end-user model"');
    expect(markup).toContain(
      "Owner telemetry, recovery records, and affiliate routing controls are intentionally unavailable."
    );
    expect(markup).toContain("Message history");
    expect(markup).toContain("No messages in this session yet.");
    expect(markup).toContain("Ready for your next message");
    expect(markup).toContain('aria-label="Start a new conversation"');
    expect(markup).toContain("New conversation");
    expect(markup).toContain("Local catalog loaded · chat execution unchanged");
    expect(markup).toContain("Ollama Local Default");
    expect(markup).toContain("Local route preview");
    expect(markup).toContain(
      "Ollama Local / agentos-default is ready in the local mock preview. Chat execution remains unchanged."
    );
    expect(markup).toContain(
      "no live provider action · no affiliate routing · no owner telemetry"
    );
    expect(markup).not.toContain("Recovery + policy");
    expect(markup).not.toContain("Affiliate telemetry");
  });

  it("shows local catalog loading and fallback status without changing end-user boundaries", () => {
    catalogQueryState.data = undefined;
    catalogQueryState.isLoading = true;
    catalogQueryState.error = null;
    expect(renderToStaticMarkup(createElement(EndUserChat))).toContain(
      "Loading local catalog…"
    );

    catalogQueryState.isLoading = false;
    catalogQueryState.error = { message: "fixture unavailable" };
    const fallbackMarkup = renderToStaticMarkup(createElement(EndUserChat));
    expect(fallbackMarkup).toContain("Using local catalog fallback");
    expect(fallbackMarkup).toContain('aria-label="Choose end-user provider"');
    expect(fallbackMarkup).toMatch(
      /<option value="agentos-default"[^>]*>agentos-default<\/option>/
    );
    expect(fallbackMarkup).toContain(
      '<option value="llama-local">llama-local</option>'
    );
    expect(fallbackMarkup).toContain(
      "no affiliate routing · no owner telemetry"
    );
  });
});
