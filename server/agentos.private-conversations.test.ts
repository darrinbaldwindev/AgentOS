import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const store = vi.hoisted(() => ({
  now: new Date("2026-08-22T00:00:00.000Z"),
  conversations: new Map<
    number,
    Array<{
      conversationId: string;
      userId: number;
      providerId: string;
      modelId: string;
      expiresAt: Date;
    }>
  >(),
  messages: new Map<
    string,
    Array<{ role: "user" | "assistant"; content: string; userId: number }>
  >(),
}));

vi.mock("./db", () => ({
  appendAttributionRecord: vi.fn(),
  appendRecoveryRecord: vi.fn(),
  listAttributionRecords: vi.fn(),
  listRecoveryRecords: vi.fn(),
  listPrivateConversations: vi.fn(async (userId: number) =>
    (store.conversations.get(userId) ?? []).filter(
      conversation => conversation.expiresAt.getTime() > store.now.getTime()
    )
  ),
  getPrivateConversation: vi.fn(
    async (userId: number, conversationId: string) =>
      (store.conversations.get(userId) ?? []).find(
        conversation =>
          conversation.conversationId === conversationId &&
          conversation.expiresAt.getTime() > store.now.getTime()
      )
  ),
  listPrivateConversationMessages: vi.fn(
    async (userId: number, conversationId: string) =>
      (store.messages.get(conversationId) ?? []).filter(
        message => message.userId === userId
      )
  ),
  createPrivateConversation: vi.fn(async input => {
    const conversation = {
      ...input,
      expiresAt: new Date("2026-09-20T00:00:00.000Z"),
    };
    store.conversations.set(input.userId, [
      ...(store.conversations.get(input.userId) ?? []),
      conversation,
    ]);
    return conversation;
  }),
  appendPrivateConversationMessage: vi.fn(async input => {
    const existing = store.conversations
      .get(input.userId)
      ?.find(
        conversation => conversation.conversationId === input.conversationId
      );
    if (!existing) return undefined;
    const message = {
      role: input.role,
      content: input.content,
      userId: input.userId,
    };
    store.messages.set(input.conversationId, [
      ...(store.messages.get(input.conversationId) ?? []),
      message,
    ]);
    return message;
  }),
  deletePrivateConversation: vi.fn(
    async (userId: number, conversationId: string) => {
      const before = store.conversations.get(userId) ?? [];
      const remaining = before.filter(
        conversation => conversation.conversationId !== conversationId
      );
      store.conversations.set(userId, remaining);
      if (remaining.length === before.length) return false;
      store.messages.delete(conversationId);
      return true;
    }
  ),
  deleteAllPrivateConversations: vi.fn(async (userId: number) => {
    const owned = store.conversations.get(userId) ?? [];
    store.conversations.set(userId, []);
    owned.forEach(conversation =>
      store.messages.delete(conversation.conversationId)
    );
    return owned.length;
  }),
}));

import { appRouter } from "./routers";

function context(userId: number | null): TrpcContext {
  return {
    user:
      userId === null
        ? null
        : {
            id: userId,
            openId: `user-${userId}`,
            email: null,
            name: `User ${userId}`,
            loginMethod: "test",
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("AgentOS private conversations", () => {
  it("creates, appends, reads, and hard-deletes only the caller's private conversation", async () => {
    const caller = appRouter.createCaller(context(41));
    const created = await caller.agentos.conversations.create({
      providerId: "ollama",
      modelId: "agentos-default",
    });
    expect(created).toMatchObject({ userId: 41, providerId: "ollama" });
    if (!created) throw new Error("Expected private conversation");

    const savedRows = await caller.agentos.conversations.list();
    expect(savedRows).toMatchObject([
      {
        conversationId: created.conversationId,
        userId: 41,
        expiresAt: expect.any(Date),
      },
    ]);

    const otherCaller = appRouter.createCaller(context(42));
    expect(await otherCaller.agentos.conversations.list()).toEqual([]);

    await caller.agentos.conversations.append({
      conversationId: created.conversationId,
      role: "user",
      content: "Keep this private.",
      providerId: "ollama",
      modelId: "agentos-default",
    });
    expect(
      await caller.agentos.conversations.get({
        conversationId: created.conversationId,
      })
    ).toMatchObject({
      conversation: { userId: 41 },
      messages: [{ role: "user", content: "Keep this private.", userId: 41 }],
    });

    expect(
      await caller.agentos.conversations.delete({
        conversationId: created.conversationId,
      })
    ).toBe(true);
    expect(
      await caller.agentos.conversations.get({
        conversationId: created.conversationId,
      })
    ).toEqual({ conversation: null, messages: [] });
  });

  it("does not reveal another user's conversation or allow a cross-user delete", async () => {
    const owner = appRouter.createCaller(context(51));
    const outsider = appRouter.createCaller(context(52));
    const created = await owner.agentos.conversations.create({
      providerId: "ollama",
      modelId: "agentos-default",
    });
    if (!created) throw new Error("Expected private conversation");

    expect(
      await outsider.agentos.conversations.get({
        conversationId: created.conversationId,
      })
    ).toEqual({ conversation: null, messages: [] });
    expect(
      await outsider.agentos.conversations.delete({
        conversationId: created.conversationId,
      })
    ).toBe(false);
  });

  it("hard-deletes all and only the caller's saved private conversations", async () => {
    const caller = appRouter.createCaller(context(71));
    const otherUser = appRouter.createCaller(context(72));
    await caller.agentos.conversations.create({
      providerId: "ollama",
      modelId: "agentos-default",
    });
    await caller.agentos.conversations.create({
      providerId: "together",
      modelId: "meta-llama-3.1-8b",
    });
    const otherConversation = await otherUser.agentos.conversations.create({
      providerId: "ollama",
      modelId: "agentos-default",
    });

    expect(await caller.agentos.conversations.clearAll()).toBe(2);
    expect(await caller.agentos.conversations.list()).toEqual([]);
    expect(await otherUser.agentos.conversations.list()).toHaveLength(1);
    expect(otherConversation).toMatchObject({ userId: 72 });
  });

  it("treats a conversation at the exact expiry boundary as unavailable", async () => {
    const caller = appRouter.createCaller(context(81));
    const exactExpiryId = "00000000-0000-4000-8000-000000000081";
    store.conversations.set(81, [
      {
        conversationId: exactExpiryId,
        userId: 81,
        providerId: "ollama",
        modelId: "agentos-default",
        expiresAt: new Date(store.now),
      },
    ]);

    expect(await caller.agentos.conversations.list()).toEqual([]);
    expect(
      await caller.agentos.conversations.get({ conversationId: exactExpiryId })
    ).toEqual({ conversation: null, messages: [] });
  });

  it("denies unauthenticated private conversation access and disallows system roles", async () => {
    const anonymous = appRouter.createCaller(context(null));
    await expect(anonymous.agentos.conversations.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(
      anonymous.agentos.conversations.clearAll()
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

    const caller = appRouter.createCaller(context(61));
    const created = await caller.agentos.conversations.create({
      providerId: "ollama",
      modelId: "agentos-default",
    });
    if (!created) throw new Error("Expected private conversation");
    await expect(
      caller.agentos.conversations.append({
        conversationId: created.conversationId,
        role: "system" as "user",
        content: "never accepted",
        providerId: "ollama",
        modelId: "agentos-default",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
