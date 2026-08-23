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

const conversationQueryState = vi.hoisted(() => ({
  list: { data: [] as unknown[], isLoading: false, error: null as unknown },
  get: {
    data: { conversation: null, messages: [] },
    isLoading: false,
    error: null as unknown,
  },
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
      conversations: {
        list: { useQuery: () => conversationQueryState.list },
        get: { useQuery: () => conversationQueryState.get },
        create: {
          useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
        },
        append: {
          useMutation: () => ({
            mutate: vi.fn(),
            mutateAsync: vi.fn(),
            isPending: false,
          }),
        },
        delete: {
          useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
        },
        clearAll: {
          useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
        },
      },
    },
    useUtils: () => ({
      agentos: {
        conversations: {
          list: { invalidate: vi.fn() },
          get: { invalidate: vi.fn() },
        },
      },
    }),
  },
}));

import EndUserChat, {
  getEndUserSelectorModelOptions,
} from "../client/src/pages/EndUserChat";

describe("AgentOS end-user chat surface", () => {
  it("keeps execution model identifiers stable when catalog identifiers differ", () => {
    expect(
      getEndUserSelectorModelOptions("ollama", {
        id: "ollama",
        models: [
          {
            id: "catalog-specific-model",
            name: "Catalog-specific model",
          },
        ],
      })
    ).toEqual([
      {
        id: "agentos-default",
        label: "agentos-default",
      },
      {
        id: "llama-local",
        label: "llama-local",
      },
    ]);

    expect(
      getEndUserSelectorModelOptions("ollama", {
        id: "ollama",
        models: [
          {
            id: "agentos-default",
            name: "Catalog label for the execution model",
          },
        ],
      })
    ).toEqual([
      {
        id: "agentos-default",
        label: "Catalog label for the execution model",
      },
      { id: "llama-local", label: "llama-local" },
    ]);

    expect(getEndUserSelectorModelOptions("ollama")).toEqual([
      { id: "agentos-default", label: "agentos-default" },
      { id: "llama-local", label: "llama-local" },
    ]);
  });

  it("is separate from owner telemetry and recovery controls", () => {
    const markup = renderToStaticMarkup(createElement(EndUserChat));
    expect(markup).toContain("user workspace");
    expect(markup).toContain('aria-label="Choose end-user provider"');
    expect(markup).toContain('aria-label="Choose end-user model"');
    expect(markup).toContain(
      "Owner telemetry, recovery records, and affiliate routing controls are intentionally unavailable."
    );
    expect(markup).toContain("Message history");
    expect(markup).toContain("Saved private conversations");
    expect(markup).toContain("No saved private conversations yet.");
    expect(markup).not.toContain("Expires ");
    expect(markup).not.toContain("Clear all saved history");
    expect(markup).toContain("expire 30 days after the latest saved message");
    expect(markup).toContain("No messages in this session yet.");
    expect(markup).toContain("Ready for your next message");
    expect(markup).toContain('aria-label="Start a new conversation"');
    expect(markup).toContain("New conversation");
    expect(markup).toContain("Local catalog loaded · chat execution unchanged");
    expect(markup).toContain('value="agentos-default"');
    expect(markup).not.toContain("Ollama Local Default");
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

  it("shows loading and unavailable saved-conversation states without control-plane data", () => {
    conversationQueryState.list.data = undefined;
    conversationQueryState.list.isLoading = true;
    conversationQueryState.list.error = null;
    expect(renderToStaticMarkup(createElement(EndUserChat))).toContain(
      "Loading your private conversations…"
    );

    conversationQueryState.list.isLoading = false;
    conversationQueryState.list.error = { message: "history unavailable" };
    const errorMarkup = renderToStaticMarkup(createElement(EndUserChat));
    expect(errorMarkup).toContain("Saved conversation history is unavailable.");
    expect(errorMarkup).not.toContain("Recovery + policy");
    expect(errorMarkup).not.toContain("Affiliate telemetry");
  });

  it("offers caller-only clear-all controls only when private history exists", () => {
    conversationQueryState.list.data = [
      {
        conversationId: "00000000-0000-0000-0000-000000000071",
        providerId: "ollama",
        modelId: "agentos-default",
        expiresAt: new Date("2026-09-20T00:00:00.000Z"),
      },
    ];
    conversationQueryState.list.isLoading = false;
    conversationQueryState.list.error = null;
    const markup = renderToStaticMarkup(createElement(EndUserChat));
    expect(markup).toContain(
      'aria-label="Clear all saved private conversations"'
    );
    expect(markup).toContain(
      'aria-label="Delete saved private conversation 00000000-0000-0000-0000-000000000071"'
    );
    expect(markup).toContain("Clear all saved history");
    expect(markup).toContain("Expires 2026-09-20 00:00 UTC");
    expect(markup).toContain("Owner telemetry, recovery records");
    expect(markup).not.toContain("Affiliate telemetry");
  });
});
