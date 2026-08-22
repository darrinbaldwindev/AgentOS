import { act, createElement } from "react";
import TestRenderer from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({
  mutationOptions: null as null | {
    onSuccess: (response: {
      content: string;
      providerId: string;
      modelId: string;
    }) => void;
  },
}));

const conversationState = vi.hoisted(() => {
  const conversationId = "11111111-1111-4111-8111-111111111111";
  return {
    conversationId,
    list: {
      data: [
        {
          conversationId,
          userId: 1,
          providerId: "ollama",
          modelId: "agentos-default",
        },
      ],
      isLoading: false,
      error: null,
    },
    get: {
      data: {
        conversation: null as Record<string, unknown> | null,
        messages: [] as Array<Record<string, unknown>>,
      },
      isLoading: false,
      error: null,
    },
    clearAllShouldFail: false,
  };
});

vi.mock("@/components/AIChatBox", () => ({
  AIChatBox: ({
    messages,
    onSendMessage,
  }: {
    messages: Array<{ content: string }>;
    onSendMessage: (content: string) => void;
  }) =>
    createElement(
      "div",
      { role: "log", "aria-label": "End-user conversation" },
      ...messages.map((message, index) =>
        createElement("p", { key: index }, message.content)
      ),
      createElement(
        "button",
        {
          type: "button",
          "aria-label": "Test send message",
          onClick: () => onSendMessage("hello"),
        },
        "send"
      )
    ),
}));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ loading: false, user: { role: "user" } }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    agentos: {
      chat: {
        useMutation: (options: typeof testState.mutationOptions) => {
          testState.mutationOptions = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
      orchestration: {
        endUserCatalog: {
          useQuery: () => ({
            data: {
              mode: "local_mock",
              providers: [
                {
                  id: "ollama",
                  name: "Ollama Local",
                  readiness: "ready",
                  models: [
                    { id: "ollama-default", name: "Ollama Catalog Default" },
                  ],
                },
                {
                  id: "together",
                  name: "Together AI",
                  readiness: "review",
                  models: [
                    {
                      id: "together-default",
                      name: "Together Catalog Default",
                    },
                  ],
                },
                {
                  id: "taskade",
                  name: "Taskade",
                  readiness: "unavailable",
                  models: [],
                },
                {
                  id: "elevenlabs",
                  name: "ElevenLabs",
                  readiness: "review",
                  models: [],
                },
                {
                  id: "n8n",
                  name: "n8n",
                  readiness: "unavailable",
                  models: [],
                },
                {
                  id: "github",
                  name: "GitHub",
                  readiness: "unavailable",
                  models: [],
                },
              ],
              liveProviderCallsEnabled: false,
              affiliateRoutingEnabled: false,
            },
            isLoading: false,
            error: null,
          }),
        },
      },
      conversations: {
        list: { useQuery: () => conversationState.list },
        get: { useQuery: () => conversationState.get },
        create: {
          useMutation: () => ({
            mutateAsync: vi.fn(async () => ({
              conversationId: conversationState.conversationId,
              userId: 1,
              providerId: "ollama",
              modelId: "agentos-default",
            })),
            isPending: false,
          }),
        },
        append: {
          useMutation: () => ({
            mutate: vi.fn(),
            mutateAsync: vi.fn(async input => ({ ...input })),
            isPending: false,
          }),
        },
        delete: {
          useMutation: () => ({
            mutateAsync: vi.fn(async () => true),
            isPending: false,
          }),
        },
        clearAll: {
          useMutation: () => ({
            mutateAsync: vi.fn(async () => {
              if (conversationState.clearAllShouldFail) {
                throw new Error("storage unavailable");
              }
              const deletedCount = conversationState.list.data.length;
              conversationState.list.data = [];
              return deletedCount;
            }),
            isPending: false,
          }),
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

import EndUserChat from "../client/src/pages/EndUserChat";

describe("EndUserChat conversation reset interaction", () => {
  it("clears rendered history and ignores a delayed stale response", async () => {
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(createElement(EndUserChat));
    });

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Test send message" })
        .props.onClick();
    });
    expect(
      renderer.root
        .findAllByType("p")
        .map(node => node.children.join(" "))
        .join(" ")
    ).toContain("hello");

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Start a new conversation" })
        .props.onClick();
    });
    expect(
      renderer.root
        .findAllByType("p")
        .map(node => node.children.join(" "))
        .join(" ")
    ).not.toContain("hello");

    await act(async () => {
      testState.mutationOptions?.onSuccess({
        content: "stale reply",
        providerId: "ollama",
        modelId: "agentos-default",
      });
    });
    expect(
      renderer.root
        .findAllByType("p")
        .map(node => node.children.join(" "))
        .join(" ")
    ).not.toContain("stale reply");
  });

  it("updates the local route preview for limited and unavailable mock routes", async () => {
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(createElement(EndUserChat));
    });

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Choose end-user provider" })
        .props.onChange({ target: { value: "together" } });
    });

    let previewText = renderer.root
      .findAllByType("p")
      .map(node => node.children.join(" "))
      .join(" ");
    expect(previewText).toContain(
      "Together AI / meta-llama-3.1-8b may need a retry or a different route. No provider action has been attempted."
    );
    expect(
      renderer.root.findByProps({ "aria-label": "Choose end-user model" }).props
        .value
    ).toBe("meta-llama-3.1-8b");
    expect(
      renderer.root.findAllByType("option").map(node => node.children.join(" "))
    ).toContain("Together Catalog Default");

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Choose end-user provider" })
        .props.onChange({ target: { value: "github" } });
    });

    previewText = renderer.root
      .findAllByType("p")
      .map(node => node.children.join(" "))
      .join(" ");
    expect(previewText).toContain(
      "GitHub / repo-assistant is not ready in the local mock preview. Choose another route to continue."
    );
    expect(previewText).toContain(
      "no live provider action · no affiliate routing · no owner telemetry"
    );
  });

  it("restores a saved private conversation and requires confirmation before hard deletion", async () => {
    conversationState.get.data = {
      conversation: {
        conversationId: conversationState.conversationId,
        userId: 1,
        providerId: "ollama",
        modelId: "agentos-default",
      },
      messages: [{ role: "assistant", content: "restored private reply" }],
    };
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(createElement(EndUserChat));
    });

    await act(async () => {
      renderer.root
        .findAllByProps({ "aria-pressed": false })[0]
        .props.onClick();
    });
    expect(
      renderer.root
        .findAllByType("p")
        .map(node => node.children.join(" "))
        .join(" ")
    ).toContain("restored private reply");

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Delete active private conversation" })
        .props.onClick();
    });
    const confirmButton = renderer.root
      .findAllByType("button")
      .find(node => node.children.join(" ") === "Delete permanently");
    expect(confirmButton).toBeDefined();

    await act(async () => {
      await confirmButton?.props.onClick();
    });
    expect(
      renderer.root
        .findAllByProps({ "aria-live": "polite" })
        .map(node => node.children.join(" "))
        .join(" ")
    ).toContain("Private conversation permanently deleted.");
  });

  it("requires confirmation before clearing all saved private conversations", async () => {
    conversationState.list.data = [
      {
        conversationId: "11111111-1111-4111-8111-111111111111",
        userId: 1,
        providerId: "ollama",
        modelId: "agentos-default",
      },
      {
        conversationId: "22222222-2222-4222-8222-222222222222",
        userId: 1,
        providerId: "together",
        modelId: "meta-llama-3.1-8b",
      },
    ];
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(createElement(EndUserChat));
    });

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Clear all saved private conversations" })
        .props.onClick();
    });
    expect(
      renderer.root
        .findAllByType("p")
        .map(node => node.children.join(" "))
        .join(" ")
    ).toContain("Permanently delete every saved private conversation");

    await act(async () => {
      renderer.root
        .findAllByType("button")
        .find(node => node.children.join(" ") === "Cancel")
        ?.props.onClick();
    });
    expect(
      renderer.root.findAllByProps({
        "aria-label": "Clear all saved private conversations",
      })
    ).toHaveLength(1);

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Clear all saved private conversations" })
        .props.onClick();
    });
    await act(async () => {
      await renderer.root
        .findAllByType("button")
        .find(node => node.children.join(" ") === "Delete all permanently")
        ?.props.onClick();
    });
    expect(
      renderer.root
        .findAllByProps({ "aria-live": "polite" })
        .map(node => node.children.join(" "))
        .join(" ")
    ).toContain("2 saved private conversations were permanently deleted.");
  });

  it("preserves saved history and reports a safe error when clear-all storage fails", async () => {
    conversationState.list.data = [
      {
        conversationId: "33333333-3333-4333-8333-333333333333",
        userId: 1,
        providerId: "ollama",
        modelId: "agentos-default",
      },
    ];
    conversationState.clearAllShouldFail = true;
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(createElement(EndUserChat));
    });

    await act(async () => {
      renderer.root
        .findByProps({ "aria-label": "Clear all saved private conversations" })
        .props.onClick();
    });
    await act(async () => {
      await renderer.root
        .findAllByType("button")
        .find(node => node.children.join(" ") === "Delete all permanently")
        ?.props.onClick();
    });
    expect(
      renderer.root
        .findAllByProps({ "aria-live": "polite" })
        .map(node => node.children.join(" "))
        .join(" ")
    ).toContain(
      "Saved private history could not be cleared. Nothing was removed."
    );
    expect(
      renderer.root.findAllByProps({
        "aria-label": "Clear all saved private conversations",
      })
    ).toHaveLength(1);
    conversationState.clearAllShouldFail = false;
  });
});
