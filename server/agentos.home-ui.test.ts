import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const localHealthQueryState = vi.hoisted(() => ({
  data: [
    {
      providerId: "ollama",
      connection: "available",
      retryAfterMs: null,
      lastCheckedAt: 1_756_000_000_000,
      source: "deterministic_local_fixture",
    },
    {
      providerId: "together",
      connection: "rate_limited",
      retryAfterMs: 30_000,
      lastCheckedAt: 1_756_000_000_000,
      source: "deterministic_local_fixture",
    },
  ] as unknown[],
  isLoading: false,
  error: null as unknown,
}));

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
      access: { status: { useQuery: () => ({ data: { allowed: true } }) } },
      orchestration: {
        health: {
          useQuery: () => localHealthQueryState,
        },
      },
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
    expect(markup).toContain("Local orchestration guidance");
    expect(markup).toContain(
      'aria-label="Local provider health and recovery guidance"'
    );
    expect(markup).toContain("Wait 30 seconds before retrying.");
    expect(markup).toContain("no live provider calls");
  });

  it("renders accessible loading and error guidance without attempting provider activity", () => {
    localHealthQueryState.data = [];
    localHealthQueryState.isLoading = true;
    localHealthQueryState.error = null;
    expect(renderToStaticMarkup(createElement(Home))).toContain(
      'role="status"'
    );
    expect(renderToStaticMarkup(createElement(Home))).toContain(
      "Loading local provider guidance…"
    );

    localHealthQueryState.isLoading = false;
    localHealthQueryState.error = {
      message: "deterministic fixture unavailable",
    };
    const errorMarkup = renderToStaticMarkup(createElement(Home));
    expect(errorMarkup).toContain('role="alert"');
    expect(errorMarkup).toContain(
      "Local provider guidance is unavailable. No provider action was attempted."
    );
  });
});
