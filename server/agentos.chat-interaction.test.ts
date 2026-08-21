import { act, createElement } from "react";
import TestRenderer from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { AIChatBox } from "../client/src/components/AIChatBox";

describe("AIChatBox copy interactions", () => {
  it("shows copied feedback after a successful clipboard write", async () => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } },
    });
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        createElement(AIChatBox, {
          messages: [{ role: "assistant", content: "## Hello" }],
          onSendMessage: () => undefined,
          height: "240px",
        })
      );
    });
    const copyButton = renderer.root.findByProps({
      "aria-label": "Copy assistant message",
    });
    await act(async () => {
      await copyButton.props.onClick();
    });
    expect(
      renderer.root.findAll(node => node.children.includes("Copied"))
    ).toHaveLength(1);
  });

  it("shows an accessible failure message when clipboard access is denied", async () => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error("denied")),
        },
      },
    });
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        createElement(AIChatBox, {
          messages: [{ role: "assistant", content: "copy me" }],
          onSendMessage: () => undefined,
          height: "240px",
        })
      );
    });
    const copyButton = renderer.root.findByProps({
      "aria-label": "Copy assistant message",
    });
    await act(async () => {
      await copyButton.props.onClick();
    });
    expect(
      renderer.root.findByProps({ role: "status" }).children.join(" ")
    ).toContain("Copy failed");
  });
});
