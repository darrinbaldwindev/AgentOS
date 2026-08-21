import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/components/DashboardLayout", () => ({
  default: ({ children }: { children: unknown }) =>
    createElement("div", null, children),
}));
vi.mock("@/components/AIChatBox", () => ({
  AIChatBox: () =>
    createElement("div", { role: "log", "aria-label": "Active conversation" }),
}));
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { role: "user" } }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    agentos: {
      chat: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

import Chat from "../client/src/pages/Chat";

describe("AgentOS Chat accessibility surface", () => {
  it("renders labelled provider and model selectors with a live notice", () => {
    const markup = renderToStaticMarkup(createElement(Chat));
    expect(markup).toContain('aria-label="Choose chat provider route"');
    expect(markup).toContain('aria-label="Choose chat model"');
    expect(markup).toContain("authenticated surface");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Grant");
    expect(markup).toContain("Decline");
  });
});
