import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { providers } from "@/lib/agentosMock";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { ShieldCheck } from "lucide-react";

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
  const [notice, setNotice] = useState(
    "Your conversation stays separate from the AgentOS owner control plane."
  );
  const selectedProvider =
    providers.find(provider => provider.id === providerId) ?? providers[0];
  const chatMutation = trpc.agentos.chat.useMutation({
    onSuccess: response => {
      setMessages(current => [
        ...current,
        { role: "assistant", content: response.content },
      ]);
      setNotice(
        `${response.providerId} / ${response.modelId} responded. Owner telemetry is not exposed here.`
      );
    },
    onError: error => setNotice(`Chat unavailable: ${error.message}`),
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

  const handleSend = (content: string) => {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
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
            <Badge className="w-fit border border-cyan-200/20 bg-cyan-200/10 text-cyan-100 hover:bg-cyan-200/10">
              <ShieldCheck className="mr-2 h-3 w-3" />
              user workspace
            </Badge>
          </div>
        </header>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={chatMutation.isPending}
              height="560px"
              placeholder={`Message ${selectedProvider.name}…`}
              emptyStateMessage="Start your private AgentOS conversation"
              suggestedPrompts={[
                "Explain the current model route",
                "Help me compare these free model options",
              ]}
              className="border-white/10 bg-[#081321]"
            />
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
            <div
              aria-live="polite"
              className="rounded-lg border border-dashed border-white/10 p-3 text-xs leading-5 text-slate-500"
            >
              {notice}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
