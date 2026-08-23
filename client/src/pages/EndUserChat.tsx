import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { providers, type Provider } from "@/lib/agentosMock";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { assertPrivateConversationMessageContent } from "@shared/agentosConversationPolicy";
import { ArchiveRestore, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";

export function shouldAcceptChatResponse(
  responseEpoch: number,
  currentEpoch: number
): boolean {
  return responseEpoch === currentEpoch;
}

export function resetConversationState(currentEpoch: number) {
  return {
    nextEpoch: currentEpoch + 1,
    messages: [] as Message[],
    isTyping: false,
    pendingEpoch: null as number | null,
  };
}

export function getEndUserChatStatus(isTyping: boolean): string {
  return isTyping ? "AgentOS is typing" : "Ready for your next message";
}

export function getPrivateConversationExpiryLabel(
  expiresAt: Date | string | null | undefined
): string {
  const date =
    expiresAt instanceof Date ? expiresAt : new Date(expiresAt ?? "");
  if (Number.isNaN(date.getTime())) return "Expiry date unavailable";
  return `Expires ${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export function getEndUserRoutePreview(
  provider: Pick<Provider, "name" | "state">,
  modelId: string
): { tone: "ready" | "review" | "unavailable"; message: string } {
  if (provider.state === "available") {
    return {
      tone: "ready",
      message: `${provider.name} / ${modelId} is ready in the local mock preview. Chat execution remains unchanged.`,
    };
  }
  if (provider.state === "limited" || provider.state === "degraded") {
    return {
      tone: "review",
      message: `${provider.name} / ${modelId} may need a retry or a different route. No provider action has been attempted.`,
    };
  }
  return {
    tone: "unavailable",
    message: `${provider.name} / ${modelId} is not ready in the local mock preview. Choose another route to continue.`,
  };
}

export function EndUserTypingStatus({ isTyping }: { isTyping: boolean }) {
  return (
    <div
      aria-live="polite"
      className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-200/10 bg-cyan-200/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-100/70"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isTyping ? "animate-pulse bg-cyan-200" : "bg-slate-600"}`}
      />
      {getEndUserChatStatus(isTyping)}
    </div>
  );
}

const modelOptions = {
  ollama: ["agentos-default", "llama-local"],
  together: ["meta-llama-3.1-8b", "qwen2.5-coder"],
  taskade: ["taskade-agent"],
  elevenlabs: ["voice-transcript"],
  n8n: ["workflow-agent"],
  github: ["repo-assistant"],
} as const;

const EMPTY_CONVERSATION_ID = "00000000-0000-0000-0000-000000000000";

type EndUserCatalogProvider = {
  id: string;
  models: Array<{ id: string; name: string }>;
};

export function getEndUserSelectorModelOptions(
  providerId: string,
  catalogProvider?: EndUserCatalogProvider
): Array<{ id: string; label: string }> {
  const fallbackIds =
    modelOptions[providerId as keyof typeof modelOptions] ??
    modelOptions.ollama;
  if (catalogProvider?.models.length) {
    return catalogProvider.models.map(model => ({
      id: model.id,
      label: model.name,
    }));
  }
  return fallbackIds.map(id => ({ id, label: id }));
}

export default function EndUserChat() {
  const { loading, user } = useAuth();
  const [providerId, setProviderId] = useState("ollama");
  const [modelId, setModelId] = useState("agentos-default");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isRestoringConversation, setIsRestoringConversation] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [pendingSavedDeleteId, setPendingSavedDeleteId] = useState<
    string | null
  >(null);
  const [conversationKey, setConversationKey] = useState(0);
  const conversationEpochRef = useRef(0);
  const pendingEpochRef = useRef<number | null>(null);
  const pendingConversationIdRef = useRef<string | null>(null);
  const [notice, setNotice] = useState(
    "Your conversation stays separate from the AgentOS owner control plane."
  );
  const selectedProvider =
    providers.find(provider => provider.id === providerId) ?? providers[0];
  const routePreview = getEndUserRoutePreview(selectedProvider, modelId);
  const endUserCatalogQuery =
    trpc.agentos.orchestration.endUserCatalog.useQuery(undefined, {
      enabled: Boolean(user),
    });
  const selectorProviders = endUserCatalogQuery.data?.providers?.length
    ? endUserCatalogQuery.data.providers
    : providers.map(provider => ({
        id: provider.id,
        name: provider.name,
        readiness:
          provider.state === "available"
            ? ("ready" as const)
            : provider.state === "limited" || provider.state === "degraded"
              ? ("review" as const)
              : ("unavailable" as const),
        models: [],
      }));
  const selectedCatalogProvider = selectorProviders.find(
    provider => provider.id === providerId
  );
  const selectorModelOptions = getEndUserSelectorModelOptions(
    providerId,
    selectedCatalogProvider
  );
  useEffect(() => {
    if (selectorModelOptions.some(option => option.id === modelId)) return;
    setModelId(selectorModelOptions[0]?.id ?? modelOptions.ollama[0]);
  }, [modelId, selectorModelOptions]);
  const utils = trpc.useUtils();
  const savedConversationsQuery = trpc.agentos.conversations.list.useQuery(
    undefined,
    { enabled: Boolean(user) }
  );
  const activeConversationQuery = trpc.agentos.conversations.get.useQuery(
    { conversationId: activeConversationId ?? EMPTY_CONVERSATION_ID },
    { enabled: Boolean(user && activeConversationId) }
  );
  const createConversationMutation =
    trpc.agentos.conversations.create.useMutation({
      onSuccess: () => utils.agentos.conversations.list.invalidate(),
    });
  const appendConversationMutation =
    trpc.agentos.conversations.append.useMutation({
      onSuccess: () => {
        if (activeConversationId) {
          utils.agentos.conversations.get.invalidate({
            conversationId: activeConversationId,
          });
        }
        utils.agentos.conversations.list.invalidate();
      },
    });
  const deleteConversationMutation =
    trpc.agentos.conversations.delete.useMutation({
      onSuccess: () => utils.agentos.conversations.list.invalidate(),
    });
  const clearAllConversationsMutation =
    trpc.agentos.conversations.clearAll.useMutation({
      onSuccess: () => {
        utils.agentos.conversations.list.invalidate();
        if (activeConversationId) {
          utils.agentos.conversations.get.invalidate({
            conversationId: activeConversationId,
          });
        }
      },
    });

  useEffect(() => {
    const restored = activeConversationQuery.data;
    if (!restored?.conversation || !activeConversationId) return;
    if (restored.conversation.conversationId !== activeConversationId) return;
    setMessages(
      restored.messages.map(message => ({
        role: message.role,
        content: message.content,
      }))
    );
    setProviderId(
      restored.conversation.providerId as keyof typeof modelOptions
    );
    setModelId(restored.conversation.modelId);
    setIsRestoringConversation(false);
    setNotice(
      "Private conversation restored. Saved messages are retained for 30 days after the latest saved message."
    );
  }, [activeConversationId, activeConversationQuery.data]);
  useEffect(() => {
    if (!activeConversationId || !isRestoringConversation) return;
    const restored = activeConversationQuery.data;
    const restoreUnavailable = Boolean(
      activeConversationQuery.error || (restored && !restored.conversation)
    );
    if (!restoreUnavailable) return;
    const reset = resetConversationState(conversationEpochRef.current);
    conversationEpochRef.current = reset.nextEpoch;
    pendingEpochRef.current = reset.pendingEpoch;
    pendingConversationIdRef.current = null;
    setMessages(reset.messages);
    setIsTyping(reset.isTyping);
    setActiveConversationId(null);
    setIsRestoringConversation(false);
    setConfirmDelete(false);
    setConfirmClearAll(false);
    setPendingSavedDeleteId(null);
    setConversationKey(current => current + 1);
    setNotice(
      "That saved private conversation is no longer available. A new private conversation is ready."
    );
  }, [
    activeConversationId,
    activeConversationQuery.data,
    activeConversationQuery.error,
    isRestoringConversation,
  ]);
  const chatMutation = trpc.agentos.chat.useMutation({
    onSuccess: response => {
      if (
        !shouldAcceptChatResponse(
          pendingEpochRef.current ?? -1,
          conversationEpochRef.current
        )
      )
        return;
      pendingEpochRef.current = null;
      setIsTyping(false);
      const persistedConversationId = pendingConversationIdRef.current;
      if (persistedConversationId) {
        appendConversationMutation.mutate({
          conversationId: persistedConversationId,
          role: "assistant",
          content: response.content,
          providerId: response.providerId as keyof typeof modelOptions,
          modelId: response.modelId,
        });
      }
      setMessages(current => [
        ...current,
        { role: "assistant", content: response.content },
      ]);
      setNotice(
        `${response.providerId} / ${response.modelId} responded. Owner telemetry is not exposed here.`
      );
    },
    onError: error => {
      if (
        !shouldAcceptChatResponse(
          pendingEpochRef.current ?? -1,
          conversationEpochRef.current
        )
      )
        return;
      pendingEpochRef.current = null;
      setIsTyping(false);
      setNotice(`Chat unavailable: ${error.message}`);
    },
  });

  if (loading)
    return (
      <div className="min-h-screen bg-[#07111f] p-8 font-mono text-xs uppercase tracking-[0.14em] text-cyan-200">
        Loading chat…
      </div>
    );
  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07111f] p-6 text-slate-100">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">
            Sign in to use AgentOS chat
          </h1>
          <p className="text-sm text-slate-400">
            This is the end-user workspace. Owner dashboards and recovery
            records are not part of this surface.
          </p>
          <button
            onClick={() => startLogin()}
            className="rounded-lg bg-cyan-200 px-4 py-2 text-sm font-medium text-slate-950"
          >
            Sign in
          </button>
        </div>
      </div>
    );

  const handleNewConversation = () => {
    const reset = resetConversationState(conversationEpochRef.current);
    conversationEpochRef.current = reset.nextEpoch;
    pendingEpochRef.current = reset.pendingEpoch;
    setMessages(reset.messages);
    setIsTyping(reset.isTyping);
    pendingConversationIdRef.current = null;
    setActiveConversationId(null);
    setIsRestoringConversation(false);
    setConfirmDelete(false);
    setConfirmClearAll(false);
    setPendingSavedDeleteId(null);
    setConversationKey(current => current + 1);
    setNotice(
      "New private conversation ready. Owner telemetry remains unavailable here."
    );
  };

  const handleRestoreConversation = (conversationId: string) => {
    const reset = resetConversationState(conversationEpochRef.current);
    conversationEpochRef.current = reset.nextEpoch;
    pendingEpochRef.current = reset.pendingEpoch;
    pendingConversationIdRef.current = conversationId;
    setMessages([]);
    setIsTyping(false);
    setConfirmDelete(false);
    setConfirmClearAll(false);
    setPendingSavedDeleteId(null);
    setActiveConversationId(conversationId);
    setIsRestoringConversation(true);
    setNotice("Restoring your private conversation…");
  };

  const handleDeleteConversation = async () => {
    if (!activeConversationId) return;
    try {
      const deleted = await deleteConversationMutation.mutateAsync({
        conversationId: activeConversationId,
      });
      if (deleted) {
        handleNewConversation();
        setNotice("Private conversation permanently deleted.");
      } else {
        setConfirmDelete(false);
        setNotice("That private conversation is no longer available.");
      }
    } catch {
      setConfirmDelete(false);
      setNotice(
        "Private conversation could not be deleted. Nothing was removed."
      );
    }
  };

  const handleClearAllConversations = async () => {
    try {
      const deletedCount = await clearAllConversationsMutation.mutateAsync();
      if (deletedCount < 1) {
        setConfirmClearAll(false);
        setNotice("No saved private conversations were removed.");
        return;
      }
      handleNewConversation();
      setNotice(
        deletedCount === 1
          ? "One saved private conversation was permanently deleted."
          : `${deletedCount} saved private conversations were permanently deleted.`
      );
    } catch {
      setConfirmClearAll(false);
      setNotice(
        "Saved private history could not be cleared. Nothing was removed."
      );
    }
  };

  const handleDeleteSavedConversation = async () => {
    if (!pendingSavedDeleteId) return;
    try {
      const deleted = await deleteConversationMutation.mutateAsync({
        conversationId: pendingSavedDeleteId,
      });
      setPendingSavedDeleteId(null);
      if (deleted) {
        setNotice(
          "Saved private conversation permanently deleted without restoring it."
        );
      } else {
        setNotice("That private conversation is no longer available.");
      }
    } catch {
      setPendingSavedDeleteId(null);
      setNotice(
        "Saved private conversation could not be deleted. Nothing was removed."
      );
    }
  };

  const handleSend = async (content: string) => {
    let sanitizedContent: string;
    try {
      sanitizedContent = assertPrivateConversationMessageContent(content);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Remove secret-like material before saving this message."
      );
      return;
    }
    let persistedConversationId = activeConversationId;
    try {
      if (!persistedConversationId) {
        const created = await createConversationMutation.mutateAsync({
          providerId: providerId as keyof typeof modelOptions,
          modelId,
        });
        if (!created) {
          setNotice(
            "Private conversation storage is unavailable. Your message was not sent."
          );
          return;
        }
        persistedConversationId = created.conversationId;
        setActiveConversationId(persistedConversationId);
      }
      const persistedUserMessage = await appendConversationMutation.mutateAsync(
        {
          conversationId: persistedConversationId,
          role: "user",
          content: sanitizedContent,
          providerId: providerId as keyof typeof modelOptions,
          modelId,
        }
      );
      if (!persistedUserMessage) {
        setNotice(
          "Private conversation storage is unavailable. Your message was not sent."
        );
        return;
      }
    } catch {
      setNotice(
        "Private conversation storage is unavailable. Your message was not sent."
      );
      return;
    }
    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: sanitizedContent },
    ];
    setMessages(nextMessages);
    setIsTyping(true);
    pendingEpochRef.current = conversationEpochRef.current;
    pendingConversationIdRef.current = persistedConversationId;
    setNotice(
      `AgentOS is composing through ${selectedProvider.name} / ${modelId}…`
    );
    chatMutation.mutate({
      providerId: providerId as keyof typeof modelOptions,
      modelId,
      consent: "declined",
      messages: nextMessages.filter(
        (message): message is Message & { role: "user" | "assistant" } =>
          message.role !== "system"
      ),
    });
  };

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-5 text-slate-100 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="blueprint-grid rounded-2xl border border-white/10 bg-[#091827] p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                AgentOS / user workspace
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Free-model chat
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Choose a provider and model for your own conversation. Owner
                telemetry, recovery records, and affiliate routing controls are
                intentionally unavailable.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="w-fit border border-cyan-200/20 bg-cyan-200/10 text-cyan-100 hover:bg-cyan-200/10">
                <ShieldCheck className="mr-2 h-3 w-3" />
                user workspace
              </Badge>
              <button
                type="button"
                onClick={handleNewConversation}
                aria-label="Start a new conversation"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 hover:bg-white/[0.08]"
              >
                <RotateCcw className="h-3 w-3" /> New conversation
              </button>
            </div>
          </div>
        </header>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
            <AIChatBox
              key={conversationKey}
              messages={messages}
              onSendMessage={handleSend}
              isLoading={
                chatMutation.isPending &&
                pendingEpochRef.current === conversationEpochRef.current
              }
              height="560px"
              placeholder={`Message ${selectedProvider.name}…`}
              emptyStateMessage="Start your private AgentOS conversation"
              suggestedPrompts={[
                "Explain the current model route",
                "Help me compare these free model options",
              ]}
              className="border-white/10 bg-[#081321]"
            />
            <EndUserTypingStatus isTyping={isTyping} />
          </section>
          <aside className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div>
              <label
                className="block text-xs text-slate-400"
                htmlFor="user-provider"
              >
                Provider
              </label>
              <select
                id="user-provider"
                aria-label="Choose end-user provider"
                value={providerId}
                onChange={event => {
                  const next = event.target.value as keyof typeof modelOptions;
                  setProviderId(next);
                  setModelId(
                    getEndUserSelectorModelOptions(
                      next,
                      selectorProviders.find(provider => provider.id === next)
                    )[0]?.id ?? modelOptions.ollama[0]
                  );
                }}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-3 text-sm text-white"
              >
                {selectorProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <p
                role="status"
                className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600"
              >
                {endUserCatalogQuery.isLoading
                  ? "Loading local catalog…"
                  : endUserCatalogQuery.error
                    ? "Using local catalog fallback"
                    : "Local catalog loaded · chat execution unchanged"}
              </p>
            </div>
            <div>
              <label
                className="block text-xs text-slate-400"
                htmlFor="user-model"
              >
                Model
              </label>
              <select
                id="user-model"
                aria-label="Choose end-user model"
                value={modelId}
                onChange={event => setModelId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-3 text-sm text-white"
              >
                {selectorModelOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <section
              aria-labelledby="local-route-preview"
              className={`rounded-lg border p-3 ${routePreview.tone === "ready" ? "border-emerald-300/20 bg-emerald-300/[0.06]" : routePreview.tone === "review" ? "border-amber-300/20 bg-amber-300/[0.06]" : "border-rose-300/20 bg-rose-300/[0.06]"}`}
            >
              <h2
                id="local-route-preview"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300"
              >
                Local route preview
              </h2>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {routePreview.message}
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
                no live provider action · no affiliate routing · no owner
                telemetry
              </p>
            </section>
            <div
              aria-live="polite"
              className="rounded-lg border border-dashed border-white/10 p-3 text-xs leading-5 text-slate-500"
            >
              {notice}
            </div>
            <section
              aria-labelledby="saved-private-conversations"
              className="border-t border-white/10 pt-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="saved-private-conversations"
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400"
                >
                  Saved private conversations
                </h2>
                {activeConversationId ? (
                  <button
                    type="button"
                    aria-label="Delete active private conversation"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-rose-200/80 hover:text-rose-100"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Saved messages stay private to this account and expire 30 days
                after the latest saved message. Do not save secrets.
              </p>
              {confirmDelete ? (
                <div
                  role="alert"
                  className="mt-3 space-y-2 rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-3"
                >
                  <p className="text-xs leading-5 text-rose-100/90">
                    Permanently delete this conversation and all of its saved
                    messages?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteConversation}
                      disabled={deleteConversationMutation.isPending}
                      className="rounded-md bg-rose-200 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-rose-950 disabled:opacity-60"
                    >
                      Delete permanently
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-md border border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
              {confirmClearAll ? (
                <div
                  role="alert"
                  className="mt-3 space-y-2 rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-3"
                >
                  <p className="text-xs leading-5 text-rose-100/90">
                    Permanently delete every saved private conversation and all
                    of their saved messages?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleClearAllConversations}
                      disabled={clearAllConversationsMutation.isPending}
                      className="rounded-md bg-rose-200 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-rose-950 disabled:opacity-60"
                    >
                      Delete all permanently
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="rounded-md border border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
              {pendingSavedDeleteId ? (
                <div
                  role="alert"
                  className="mt-3 space-y-2 rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-3"
                >
                  <p className="text-xs leading-5 text-rose-100/90">
                    Permanently delete this saved conversation without opening
                    its messages?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteSavedConversation}
                      disabled={deleteConversationMutation.isPending}
                      className="rounded-md bg-rose-200 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-rose-950 disabled:opacity-60"
                    >
                      Delete without restoring
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingSavedDeleteId(null)}
                      className="rounded-md border border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
              <div
                className="mt-3 max-h-40 space-y-2 overflow-y-auto"
                aria-label="Saved private conversations"
              >
                {savedConversationsQuery.isLoading ? (
                  <p className="text-xs text-slate-500">
                    Loading your private conversations…
                  </p>
                ) : savedConversationsQuery.error ? (
                  <p role="status" className="text-xs text-amber-100/80">
                    Saved conversation history is unavailable. Your current
                    session remains private.
                  </p>
                ) : savedConversationsQuery.data?.length ? (
                  savedConversationsQuery.data.map(conversation => (
                    <div
                      key={conversation.conversationId}
                      className="flex items-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleRestoreConversation(conversation.conversationId)
                        }
                        aria-pressed={
                          activeConversationId === conversation.conversationId
                        }
                        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/10 p-3 text-left hover:bg-white/[0.04]"
                      >
                        <span>
                          <span className="block text-xs text-slate-200">
                            {conversation.providerId} / {conversation.modelId}
                          </span>
                          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">
                            saved private conversation
                          </span>
                          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500">
                            {getPrivateConversationExpiryLabel(
                              conversation.expiresAt
                            )}
                          </span>
                        </span>
                        <ArchiveRestore className="h-3.5 w-3.5 shrink-0 text-cyan-200/70" />
                      </button>
                      {activeConversationId !== conversation.conversationId ? (
                        <button
                          type="button"
                          aria-label={`Delete saved private conversation ${conversation.conversationId}`}
                          onClick={() => {
                            setConfirmDelete(false);
                            setConfirmClearAll(false);
                            setPendingSavedDeleteId(
                              conversation.conversationId
                            );
                          }}
                          className="shrink-0 rounded-md border border-rose-300/20 p-2 text-rose-200/80 hover:bg-rose-300/[0.08] hover:text-rose-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-white/10 p-3 text-xs leading-5 text-slate-600">
                    No saved private conversations yet.
                  </p>
                )}
              </div>
              {savedConversationsQuery.data?.length ? (
                <button
                  type="button"
                  aria-label="Clear all saved private conversations"
                  onClick={() => {
                    setConfirmDelete(false);
                    setConfirmClearAll(true);
                  }}
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-rose-200/80 hover:text-rose-100"
                >
                  <Trash2 className="h-3 w-3" /> Clear all saved history
                </button>
              ) : null}
            </section>
            <section
              aria-labelledby="user-message-history"
              className="border-t border-white/10 pt-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="user-message-history"
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400"
                >
                  Message history
                </h2>
                <span className="font-mono text-[10px] text-slate-600">
                  {messages.length} messages
                </span>
              </div>
              <div
                className="mt-3 max-h-56 space-y-2 overflow-y-auto"
                aria-label="Current session message history"
              >
                {messages.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/10 p-3 text-xs leading-5 text-slate-600">
                    No messages in this session yet.
                  </p>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className="rounded-lg border border-white/10 bg-black/10 p-3 text-xs leading-5"
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-200/60">
                        {message.role}
                      </span>
                      <p className="mt-1 line-clamp-3 text-slate-300">
                        {message.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
