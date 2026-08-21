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
    },
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
});
