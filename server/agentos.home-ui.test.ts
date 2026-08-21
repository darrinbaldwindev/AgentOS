import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/components/DashboardLayout", () => ({
  default: ({ children }: { children: unknown }) =>
    createElement("div", null, children),
}));
vi.mock("wouter", () => ({ useLocation: () => ["/", vi.fn()] }));
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { role: "admin" } }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    agentos: {
      recovery: {
        list: { useQuery: () => ({ data: [], refetch: vi.fn() }) },
        append: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      },
      attribution: {
        list: { useQuery: () => ({ data: [], refetch: vi.fn() }) },
        append: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      },
      telemetry: { useQuery: () => ({ data: undefined }) },
    },
  },
}));

import Home from "../client/src/pages/Home";

describe("AgentOS Home accessibility surface", () => {
  it("renders the actual provider, telemetry, recovery, and keyboard controls", () => {
    const markup = renderToStaticMarkup(createElement(Home));
    expect(markup).toMatch(/<select[^>]+aria-label="Choose provider route"/);
    expect(markup).toMatch(
      /<div[^>]+role="group"[^>]+aria-label="Telemetry range"/
    );
    expect(markup).toMatch(/<button[^>]*>7D<\/button>/);
    expect(markup).toMatch(/<button[^>]*>4D<\/button>/);
    expect(markup).toMatch(/<button[^>]*>2D<\/button>/);
    expect(markup).toMatch(/<p[^>]+aria-live="polite"/);
    expect(markup).toMatch(
      /<button[^>]*>[\s\S]*Cycle mock snapshot[\s\S]*<\/button>/
    );
    expect(markup).toMatch(
      /<button[^>]*>[\s\S]*Record consented referral click[\s\S]*<\/button>/
    );
    expect(markup).toMatch(
      /<button[^>]*>[\s\S]*Run mock health check[\s\S]*<\/button>/
    );
  });
});
