import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import DashboardLayout from "@/components/DashboardLayout";
import { providers } from "@/lib/agentosMock";
import { trpc } from "@/lib/trpc";
import { LockKeyhole, Radio, ShieldCheck } from "lucide-react";

export default function Chat() {
  const [selectedProviderId, setSelectedProviderId] = useState("ollama");
  const [previousProviderId, setPreviousProviderId] = useState<
    string | undefined
  >();
  const [selectedModelId, setSelectedModelId] = useState("agentos-default");
  const [previousModelId, setPreviousModelId] = useState<string | undefined>();
  const [consent, setConsent] = useState<"granted" | "declined">("declined");
  const [messages, setMessages] = useState<Message[]>([]);
  const [notice, setNotice] = useState(
    "Choose a route, then send a message. Live affiliate routing remains disabled."
  );
  const modelOptions = {
    ollama: ["agentos-default", "llama-local"],
    together: ["meta-llama-3.1-8b", "qwen2.5-coder"],
    taskade: ["taskade-agent"],
    elevenlabs: ["voice-transcript"],
    n8n: ["workflow-agent"],
    github: ["repo-assistant"],
  } as const;
  const selectedProvider = useMemo(
    () =>
      providers.find(provider => provider.id === selectedProviderId) ??
      providers[0],
    [selectedProviderId]
  );
  const chatMutation = trpc.agentos.controlChat.useMutation({
    onSuccess: response => {
      setMessages(current => [
        ...current,
        { role: "assistant", content: response.content },
      ]);
      setNotice(
        `${response.providerId} responded via ${response.modelId}. ${response.attributionRecorded ? "Model-switch event recorded." : "No model-switch event required."}`
      );
    },
    onError: error => setNotice(`Chat unavailable: ${error.message}`),
  });

  const handleProviderChange = (providerId: string) => {
    if (providerId !== selectedProviderId)
      setPreviousProviderId(selectedProviderId);
    setPreviousModelId(selectedModelId);
    setSelectedProviderId(providerId);
    setSelectedModelId(
      modelOptions[providerId as keyof typeof modelOptions][0]
    );
    setNotice(
      `Route staged: ${providerId}. The next send will use this provider contract.`
    );
  };

  const handleModelChange = (modelId: string) => {
    if (modelId !== selectedModelId) setPreviousModelId(selectedModelId);
    setSelectedModelId(modelId);
    setNotice(
      `Model staged: ${modelId}. The next send will record a governed model switch.`
    );
  };

  const handleSend = (content: string) => {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    chatMutation.mutate({
      providerId: selectedProviderId as
        | "ollama"
        | "together"
        | "taskade"
        | "elevenlabs"
        | "n8n"
        | "github",
      previousProviderId: previousProviderId as
        | "ollama"
        | "together"
        | "taskade"
        | "elevenlabs"
        | "n8n"
        | "github"
        | undefined,
      previousModelId,
      modelId: selectedModelId,
      consent,
      messages: nextMessages.filter(
        (message): message is Message & { role: "user" | "assistant" } =>
          message.role !== "system"
      ),
    });
    setPreviousProviderId(undefined);
    setPreviousModelId(undefined);
  };

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#07111f] px-4 py-5 text-slate-100 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="blueprint-grid rounded-2xl border border-white/10 bg-[#091827] p-5 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                  AgentOS / authenticated execution surface
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Free-model chat, governed by route contracts
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Switch providers without losing the active conversation.
                  Prompts stay in the active request path; attribution records
                  contain only approved event metadata.
                </p>
              </div>
              <Badge className="w-fit border border-emerald-300/20 bg-emerald-300/10 text-emerald-200 hover:bg-emerald-300/10">
                <Radio className="mr-2 h-3 w-3" />
                authenticated surface
              </Badge>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
              <CardHeader className="border-b border-white/10 px-5 py-4">
                <CardTitle className="text-base font-medium">
                  Active conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                <AIChatBox
                  messages={messages}
                  onSendMessage={handleSend}
                  isLoading={chatMutation.isPending}
                  height="560px"
                  placeholder={`Message ${selectedProvider.name}…`}
                  emptyStateMessage="Start a governed AgentOS conversation"
                  suggestedPrompts={[
                    "Compare the current provider route with a local fallback",
                    "Draft a recovery plan for a degraded provider",
                  ]}
                  className="border-white/10 bg-[#081321]"
                />
              </CardContent>
            </Card>

            <aside className="space-y-6">
              <Card className="border-cyan-200/20 bg-cyan-200/[0.06] text-white shadow-none">
                <CardHeader className="px-5 pb-3 pt-5">
                  <CardTitle className="text-base font-medium">
                    Route contract
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pb-5">
                  <label
                    className="block text-xs text-slate-400"
                    htmlFor="chat-provider"
                  >
                    Provider route
                  </label>
                  <select
                    id="chat-provider"
                    aria-label="Choose chat provider route"
                    value={selectedProviderId}
                    onChange={event => handleProviderChange(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50"
                  >
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} · {provider.state}
                      </option>
                    ))}
                  </select>
                  <label
                    className="block text-xs text-slate-400"
                    htmlFor="chat-model"
                  >
                    Model selection
                  </label>
                  <select
                    id="chat-model"
                    aria-label="Choose chat model"
                    value={selectedModelId}
                    onChange={event => handleModelChange(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#07111f] px-3 py-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50"
                  >
                    {modelOptions[
                      selectedProviderId as keyof typeof modelOptions
                    ].map(modelId => (
                      <option key={modelId} value={modelId}>
                        {modelId}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <p className="font-mono text-[9px] uppercase text-slate-500">
                        capability
                      </p>
                      <p className="mt-1 text-slate-200">
                        {selectedProvider.capabilities[0]}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <p className="font-mono text-[9px] uppercase text-slate-500">
                        cost
                      </p>
                      <p className="mt-1 text-slate-200">
                        {selectedProvider.costTier}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <p className="font-mono text-[9px] uppercase text-slate-500">
                        privacy
                      </p>
                      <p className="mt-1 text-slate-200">
                        {selectedProvider.privacy}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
                      <p className="font-mono text-[9px] uppercase text-slate-500">
                        routing
                      </p>
                      <p className="mt-1 text-amber-200">disabled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
                <CardHeader className="px-5 pb-3 pt-5">
                  <CardTitle className="text-base font-medium">
                    Attribution boundary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pb-5">
                  <div className="flex items-start gap-3">
                    <LockKeyhole className="mt-0.5 h-4 w-4 text-pink-100" />
                    <p className="text-xs leading-5 text-slate-400">
                      Consent affects model-switch attribution only. Prompts,
                      project IDs, thread IDs, and referral parameters are never
                      persisted.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={consent === "granted" ? "default" : "outline"}
                      onClick={() => setConsent("granted")}
                      className="border-white/10 bg-white/5 text-xs"
                    >
                      Grant
                    </Button>
                    <Button
                      size="sm"
                      variant={consent === "declined" ? "default" : "outline"}
                      onClick={() => setConsent("declined")}
                      className="border-white/10 bg-white/5 text-xs"
                    >
                      Decline
                    </Button>
                  </div>
                  <div
                    aria-live="polite"
                    className="rounded-lg border border-dashed border-white/10 p-3 text-[11px] leading-5 text-slate-500"
                  >
                    {notice}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    owner policy enforced
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
