import { createElement } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  localRefetch: vi.fn(),
  catalogRefetch: vi.fn(),
}));

vi.mock("@/components/DashboardLayout", () => ({
  default: ({ children }: { children: unknown }) =>
    createElement("div", null, children),
}));
vi.mock("@/components/AffiliateTelemetryChart", () => ({
  AffiliateTelemetryChart: () => createElement("div", null, "telemetry stub"),
}));
vi.mock("@/components/DashboardAccessibilityProbe", () => ({
  DashboardAccessibilityProbe: () => createElement("div", null, "a11y stub"),
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
          useQuery: () => ({
            data: [
              {
                providerId: "ollama",
                connection: "available",
                retryAfterMs: null,
                lastCheckedAt: 1_756_000_000_000,
                source: "deterministic_local_fixture",
              },
            ],
            isLoading: false,
            error: null,
            refetch: testState.localRefetch,
          }),
        },
        catalog: {
          useQuery: () => ({
            data: {
              providers: [
                { id: "ollama", name: "Ollama Local", connection: "available" },
              ],
              models: [
                {
                  id: "ollama-default",
                  providerId: "ollama",
                  name: "Ollama Local Default",
                  capabilities: ["chat", "streaming", "json", "local"],
                  contextTokens: 8192,
                  freeTier: true,
                  connection: "available",
                },
              ],
            },
            isLoading: false,
            error: null,
            refetch: testState.catalogRefetch,
          }),
        },
      },
    },
  },
}));

import Home from "../client/src/pages/Home";

describe("AgentOS owner guidance interaction", () => {
  it("refreshes deterministic local health guidance without triggering a provider action", async () => {
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(createElement(Home));
    });

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Refresh local provider guidance" })
        .props.onClick();
    });

    expect(testState.localRefetch).toHaveBeenCalledTimes(1);
    expect(
      renderer.root.findAllByProps({
        "aria-label": "Local provider health and recovery guidance",
      })
    ).toHaveLength(1);
  });

  it("refreshes the owner-only local capability matrix without provider activity", async () => {
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(createElement(Home));
    });

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Refresh local capability matrix" })
        .props.onClick();
    });

    expect(testState.catalogRefetch).toHaveBeenCalledTimes(1);
    expect(
      renderer.root.findAllByProps({
        "aria-label": "Local model capability comparison",
      })
    ).toHaveLength(1);
  });
});
