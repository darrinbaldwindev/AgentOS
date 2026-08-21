import React, { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { providers, type Provider } from "@/lib/agentosMock";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { RotateCcw, ShieldCheck } from "lucide-react";

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

export default function EndUserChat() {
  const { loading, user } = useAuth();
  const [providerId, setProviderId] = useState("ollama");
  const [modelId, setModelId] = useState("agentos-default");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);
  const conversationEpochRef = useRef(0);
  const pendingEpochRef = useRef<number | null>(null);
  const [notice, setNotice] = useState(
    "Your conversation stays separate from the AgentOS owner control plane."
  );
  const selectedProvider =
    providers.find(provider => provider.id === providerId) ?? providers[0];
  const routePreview = getEndUserRoutePreview(selectedProvider, modelId);
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
    setConversationKey(current => current + 1);
    setNotice(
      "New private conversation ready. Owner telemetry remains unavailable here."
    );
  };

  const handleSend = (content: string) => {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setIsTyping(true);
    pendingEpochRef.current = conversationEpochRef.current;
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
                  setModelId(modelOptions[next][0]);
                }}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-3 text-sm text-white"
              >
                <option value="ollama">Ollama Local</option>
                <option value="together">Together AI</option>
                <option value="taskade">Taskade</option>
                <option value="elevenlabs">ElevenLabs</option>
                <option value="n8n">n8n</option>
                <option value="github">GitHub</option>
              </select>
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
                {modelOptions[providerId as keyof typeof modelOptions].map(
                  option => (
                    <option key={option}>{option}</option>
                  )
                )}
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
