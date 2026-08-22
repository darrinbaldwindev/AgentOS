import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Code2,
  ExternalLink,
  GitBranch,
  Layers3,
  LockKeyhole,
  MoreHorizontal,
  Radio,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TerminalSquare,
  WifiOff,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { DashboardAccessibilityProbe } from "@/components/DashboardAccessibilityProbe";
import { AffiliateTelemetryChart } from "@/components/AffiliateTelemetryChart";
import { dashboardA11yContract } from "@/lib/dashboardContracts";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  AppendOnlyRecoveryLog,
  attributionEvents,
  buildReferralPreview,
  CONNECTION_STATES,
  createMockDatasetStates,
  nextConnectionState,
  nextMockDataState,
  providers,
  integrationAdapters,
  executeRecovery,
  recoveryAction,
  recoveryEvents,
  summarizeTraffic,
  trafficSeries,
  type ConnectionState,
  type MockDataState,
  type Provider,
  type RecoveryKind,
} from "@/lib/agentosMock";

const stateMeta: Record<
  ConnectionState,
  { label: string; dot: string; text: string; surface: string }
> = {
  unknown: {
    label: "Unknown",
    dot: "bg-slate-400",
    text: "text-slate-300",
    surface: "bg-slate-400/10 border-slate-400/20",
  },
  checking: {
    label: "Checking",
    dot: "bg-cyan-300 animate-pulse",
    text: "text-cyan-200",
    surface: "bg-cyan-300/10 border-cyan-300/20",
  },
  available: {
    label: "Available",
    dot: "bg-emerald-300",
    text: "text-emerald-200",
    surface: "bg-emerald-300/10 border-emerald-300/20",
  },
  needs_connection: {
    label: "Needs connection",
    dot: "bg-amber-300",
    text: "text-amber-200",
    surface: "bg-amber-300/10 border-amber-300/20",
  },
  limited: {
    label: "Limited",
    dot: "bg-orange-300",
    text: "text-orange-200",
    surface: "bg-orange-300/10 border-orange-300/20",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-fuchsia-300",
    text: "text-fuchsia-200",
    surface: "bg-fuchsia-300/10 border-fuchsia-300/20",
  },
  offline: {
    label: "Offline",
    dot: "bg-rose-300",
    text: "text-rose-200",
    surface: "bg-rose-300/10 border-rose-300/20",
  },
};

const adapterIcons = {
  "voice-ai": Radio,
  workflow: Zap,
  calendar: Clock3,
  "site-builder": Layers3,
  backup: GitBranch,
};
const adapters = integrationAdapters.map(adapter => ({
  ...adapter,
  icon: adapterIcons[adapter.id as keyof typeof adapterIcons],
  detail: `${adapter.providerId} · owner gate`,
}));

function StatePill({ state }: { state: ConnectionState }) {
  const meta = stateMeta[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.surface} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function localRecoveryGuidance(
  connection: string,
  retryAfterMs: number | null
) {
  if (connection === "available") return "Ready for local mock execution.";
  if (connection === "needs_connection")
    return "Request a governed connection before use.";
  if (connection === "permission_denied")
    return "Request owner-approved access before use.";
  if (connection === "offline") return "Switch to an available local route.";
  if (connection === "rate_limited" || connection === "limited") {
    return retryAfterMs
      ? `Wait ${Math.ceil(retryAfterMs / 1000)} seconds before retrying.`
      : "Wait before retrying this route.";
  }
  if (connection === "degraded")
    return "Use a fallback route or retry after review.";
  return "Stop and review the local recovery record.";
}

function CollectionState({
  state,
  emptyLabel,
  children,
}: {
  state: MockDataState;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  if (state === "loading")
    return (
      <div
        role="status"
        className="p-5 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-200"
      >
        Loading mock snapshot…
      </div>
    );
  if (state === "error")
    return (
      <div role="alert" className="p-5 text-xs text-rose-200">
        Mock data unavailable. Retry the snapshot to restore this section.
      </div>
    );
  if (state === "empty")
    return <div className="p-5 text-xs text-slate-500">{emptyLabel}</div>;
  return <>{children}</>;
}

function Metric({
  label,
  value,
  delta,
  positive = true,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-semibold tracking-tight text-white">
          {value}
        </p>
        <span
          className={`mb-1 inline-flex items-center gap-0.5 font-mono text-[10px] ${positive ? "text-emerald-300" : "text-rose-300"}`}
        >
          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {delta}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const [selectedProviderId, setSelectedProviderId] = useState("ollama");
  const [selectedAdapter, setSelectedAdapter] = useState("Voice AI");
  const [consent, setConsent] = useState<"granted" | "declined">("declined");
  const [selectedState, setSelectedState] =
    useState<ConnectionState>("available");
  const [flash, setFlash] = useState(
    "All live routing flags are disabled by policy."
  );
  const [datasetStates, setDatasetStates] = useState(createMockDatasetStates());
  const [recoveryLog] = useState(
    () => new AppendOnlyRecoveryLog(recoveryEvents)
  );
  const [recoverySnapshot, setRecoverySnapshot] = useState(() =>
    recoveryLog.snapshot()
  );
  const recoveryQuery = trpc.agentos.recovery.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const accessQuery = trpc.agentos.access.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const hasControlAccess = accessQuery.data?.allowed ?? isAdmin;
  const localHealthQuery = trpc.agentos.orchestration.health.useQuery(
    undefined,
    {
      enabled: isAuthenticated && hasControlAccess,
    }
  );
  const localCatalogQuery = trpc.agentos.orchestration.catalog.useQuery(
    undefined,
    {
      enabled: isAuthenticated && hasControlAccess,
    }
  );
  const attributionQuery = trpc.agentos.attribution.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const recoveryAppend = trpc.agentos.recovery.append.useMutation({
    onSuccess: () => recoveryQuery.refetch(),
  });
  const attributionAppend = trpc.agentos.attribution.append.useMutation({
    onSuccess: () => attributionQuery.refetch(),
  });
  const persistedRecovery =
    recoveryQuery.data?.map(event => ({
      ...event,
      timestamp: event.occurredAt.toLocaleString(),
      id: event.eventId,
    })) ?? [];
  const displayedRecovery =
    persistedRecovery.length > 0 ? persistedRecovery : recoverySnapshot;
  const trafficSummary = summarizeTraffic();
  const cycleDatasetStates = () =>
    setDatasetStates(current =>
      createMockDatasetStates(nextMockDataState(current.providers))
    );

  const selectedProvider = useMemo<Provider>(
    () =>
      providers.find(provider => provider.id === selectedProviderId) ??
      providers[0],
    [selectedProviderId]
  );
  const referralPreview = buildReferralPreview(selectedProvider, consent);
  const activeSection =
    location === "/" ? "Command center" : location.slice(1).replace("-", " ");
  const trafficMax = Math.max(...trafficSeries.map(item => item.clicks));

  const simulateCheck = () => {
    const next = nextConnectionState(selectedState);
    setSelectedState(next);
    setFlash(`Mock transition accepted: ${selectedState} → ${next}`);
  };

  const recordReferralClick = () => {
    if (!isAuthenticated || !referralPreview) {
      setFlash(
        "Referral click requires authentication, consent, and an eligible provider."
      );
      return;
    }
    attributionAppend.mutate({
      eventId: `referral-click-${Date.now()}`,
      eventType: "referral_click",
      provider: selectedProvider.name,
      consent,
    });
    setFlash(
      "Referral click recorded without project, thread, prompt, or secret data."
    );
  };

  const simulateRecovery = (kind: RecoveryKind) => {
    const result = executeRecovery(kind);
    recoveryLog.append({
      id: `mock-${recoverySnapshot.length + 1}`,
      kind,
      provider: selectedProvider.name,
      action: result.action,
      status: result.status,
      timestamp: "now",
    });
    setRecoverySnapshot(recoveryLog.snapshot());
    if (isAuthenticated) {
      recoveryAppend.mutate({
        eventId: `mock-${Date.now()}`,
        kind,
        provider: selectedProvider.name,
        action: result.action,
        status: result.status === "observed" ? "resolved" : result.status,
      });
    }
    setFlash(`${kind.replaceAll("_", " ")} handled safely: ${result.action}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] text-slate-100 shadow-2xl shadow-cyan-950/20">
        <div className="relative overflow-hidden border-b border-white/10 bg-[#091827] px-5 py-6 sm:px-8">
          <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="blueprint-orbit pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-cyan-300/20" />
          <div className="blueprint-orbit pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-pink-200/20" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(165,243,252,0.9)]" />
                AgentOS / control plane / {activeSection}
              </div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Affiliate and provider control center
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                A precision workspace for free-model routing, integration
                health, consent-aware attribution, and recovery decisions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border border-emerald-300/20 bg-emerald-300/10 text-emerald-200 hover:bg-emerald-300/10">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                MOCK DATA ONLY
              </Badge>
              <Button
                onClick={cycleDatasetStates}
                variant="outline"
                className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Cycle mock snapshot
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
          <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
            <CardContent className="p-5">
              <Metric
                label="Provider availability"
                value="78.4%"
                delta="+4.8%"
              />
              <div className="mt-4">
                <Progress
                  value={78}
                  className="h-1 bg-white/10 [&>div]:bg-cyan-300"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
            <CardContent className="p-5">
              <Metric
                label="Referral clicks · 7d"
                value={trafficSummary.clicks.toLocaleString()}
                delta="+18.2%"
              />
              <p className="mt-4 font-mono text-[10px] text-slate-500">
                consent-aware · deterministic
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
            <CardContent className="p-5">
              <Metric
                label="Estimated commissions"
                value="$184.20"
                delta="+11.6%"
              />
              <p className="mt-4 font-mono text-[10px] text-slate-500">
                not connected to live programs
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
            <CardContent className="p-5">
              <Metric
                label="Recovery events"
                value="27"
                delta="-31.4%"
                positive={false}
              />
              <p className="mt-4 font-mono text-[10px] text-slate-500">
                4 awaiting user action
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 px-5 pb-8 sm:px-8 xl:grid-cols-[1.45fr_0.9fr]">
          <section className="space-y-6">
            <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-white/10 px-5 py-4">
                <div>
                  <CardTitle className="text-base font-medium">
                    Provider health matrix
                  </CardTitle>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    {providers.length} configured routes · live routing locked
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
                <CollectionState
                  state={datasetStates.providers}
                  emptyLabel="No providers configured."
                >
                  <>
                    {providers.map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedProviderId(provider.id);
                          setSelectedState(provider.state);
                        }}
                        className={`group rounded-xl border p-4 text-left transition-colors ${selectedProvider.id === provider.id ? "border-cyan-200/40 bg-cyan-200/[0.07]" : "border-white/10 bg-black/10 hover:border-white/20 hover:bg-white/[0.04]"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">
                              {provider.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {provider.category}
                            </p>
                          </div>
                          <StatePill state={provider.state} />
                        </div>
                        <div className="mt-5 flex items-end justify-between gap-3">
                          <div>
                            <p className="font-mono text-[10px] text-slate-500">
                              LATENCY
                            </p>
                            <p className="mt-1 font-mono text-xs text-slate-300">
                              {provider.latencyMs
                                ? `${provider.latencyMs}ms`
                                : "—"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-[10px] text-slate-500">
                              ROUTING
                            </p>
                            <p className="mt-1 font-mono text-xs text-amber-200">
                              {provider.liveRoutingEnabled
                                ? "enabled"
                                : "disabled"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                </CollectionState>
              </CardContent>
            </Card>

            {hasControlAccess ? (
              <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-white/10 px-5 py-4">
                  <div>
                    <CardTitle className="text-base font-medium">
                      Local capability comparison
                    </CardTitle>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      owner view · deterministic local catalog · no live calls
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label="Refresh local capability matrix"
                    disabled={localCatalogQuery.isLoading}
                    onClick={() => localCatalogQuery.refetch()}
                    className="border-white/10 bg-white/5 text-[10px] text-slate-200 hover:bg-white/10 hover:text-white"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Refresh matrix
                  </Button>
                </CardHeader>
                <CardContent className="p-5">
                  {localCatalogQuery.isLoading ? (
                    <p
                      role="status"
                      className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100"
                    >
                      Loading local capability matrix…
                    </p>
                  ) : localCatalogQuery.error ? (
                    <p role="alert" className="text-xs text-rose-200">
                      Local capability matrix is unavailable. No provider action
                      was attempted.
                    </p>
                  ) : localCatalogQuery.data?.models.length ? (
                    <div
                      role="region"
                      aria-label="Local model capability comparison"
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      {localCatalogQuery.data.models.map(model => {
                        const provider = localCatalogQuery.data?.providers.find(
                          item => item.id === model.providerId
                        );
                        return (
                          <article
                            key={model.id}
                            className="rounded-lg border border-white/10 bg-black/10 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-slate-100">
                                  {model.name}
                                </p>
                                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
                                  {provider?.name ?? model.providerId} ·{" "}
                                  {model.connection.replaceAll("_", " ")}
                                </p>
                              </div>
                              <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-cyan-100">
                                {model.contextTokens.toLocaleString()} ctx
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {model.capabilities.map(capability => (
                                <span
                                  key={capability}
                                  className="rounded-full bg-white/[0.06] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-300"
                                >
                                  {capability}
                                </span>
                              ))}
                            </div>
                            <p className="mt-3 text-[11px] leading-5 text-slate-400">
                              {model.freeTier
                                ? "Free-tier flag recorded in the local fixture."
                                : "No free-tier flag recorded in the local fixture."}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No local capability rows are configured.
                    </p>
                  )}
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Capability fit is evaluated before affiliate metadata. This
                    matrix is local fixture data and never activates a provider.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-cyan-200/20 bg-cyan-200/[0.04] text-white shadow-none">
              <CardHeader className="border-b border-cyan-200/10 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-medium">
                      Local orchestration guidance
                    </CardTitle>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      deterministic fixtures · owner view · no live provider
                      calls
                    </p>
                  </div>
                  <Badge className="border border-amber-300/20 bg-amber-300/10 text-amber-100 hover:bg-amber-300/10">
                    routing locked
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    Refresh reads the deterministic local fixture only.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label="Refresh local provider guidance"
                    disabled={localHealthQuery.isLoading}
                    onClick={() => localHealthQuery.refetch()}
                    className="border-white/10 bg-white/5 text-[10px] text-slate-200 hover:bg-white/10 hover:text-white"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Refresh guidance
                  </Button>
                </div>
                {localHealthQuery.isLoading ? (
                  <p
                    role="status"
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100"
                  >
                    Loading local provider guidance…
                  </p>
                ) : localHealthQuery.error ? (
                  <p role="alert" className="text-xs text-rose-200">
                    Local provider guidance is unavailable. No provider action
                    was attempted.
                  </p>
                ) : localHealthQuery.data?.length ? (
                  <div
                    role="region"
                    aria-label="Local provider health and recovery guidance"
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {localHealthQuery.data.map(item => (
                      <div
                        key={item.providerId}
                        className="rounded-lg border border-white/10 bg-black/10 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-200">
                            {item.providerId}
                          </p>
                          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-100">
                            {item.connection.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {localRecoveryGuidance(
                            item.connection,
                            item.retryAfterMs
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No local health fixtures are configured.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-white/10 px-5 py-4">
                <div>
                  <CardTitle className="text-base font-medium">
                    Affiliate traffic stream
                  </CardTitle>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    deterministic mock telemetry · no external calls
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  stream healthy
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <CollectionState
                  state={datasetStates.affiliates}
                  emptyLabel="No affiliate telemetry yet."
                >
                  <div className="flex h-44 items-end gap-3 border-b border-l border-white/10 px-3 pb-0 pt-4 sm:gap-6">
                    {trafficSeries.map(item => (
                      <div
                        key={item.label}
                        className="flex h-full flex-1 items-end gap-1"
                      >
                        <div className="relative flex h-full flex-1 items-end">
                          <div
                            className="w-full rounded-t-sm bg-cyan-200/70 transition-all"
                            style={{
                              height: `${(item.clicks / trafficMax) * 100}%`,
                            }}
                          />
                          <div
                            className="absolute bottom-0 left-1/2 w-1/2 -translate-x-1/2 rounded-t-sm bg-pink-200/70"
                            style={{
                              height: `${(item.signups / trafficMax) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="absolute mt-48 font-mono text-[9px] text-slate-500">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 bg-cyan-200" />
                      clicks
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 bg-pink-200" />
                      signups
                    </span>
                    <span className="ml-auto text-slate-400">
                      conversion rate{" "}
                      <span className="text-white">
                        {(trafficSummary.conversionRate * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </CollectionState>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-white/10 px-5 py-4">
                <div>
                  <CardTitle className="text-base font-medium">
                    Recovery event log
                  </CardTitle>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    append-only · prompts and secrets excluded
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => simulateRecovery("rate_limit")}
                  className="border-white/10 bg-white/5 text-[10px] text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Test recovery
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-white/10 p-0">
                <CollectionState
                  state={datasetStates.recovery}
                  emptyLabel="No recovery events recorded."
                >
                  <>
                    {displayedRecovery.map(event => (
                      <div
                        key={event.id}
                        className="grid gap-3 px-5 py-4 sm:grid-cols-[1.1fr_1fr_1.6fr_auto] sm:items-center"
                      >
                        <div>
                          <p className="font-mono text-xs text-slate-200">
                            {event.kind.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {event.provider}
                          </p>
                        </div>
                        <span
                          className={`w-fit rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${event.status === "resolved" ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200" : event.status === "awaiting_user" ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-white/10 bg-white/5 text-slate-400"}`}
                        >
                          {event.status.replaceAll("_", " ")}
                        </span>
                        <p className="text-xs text-slate-400">{event.action}</p>
                        <span className="font-mono text-[10px] text-slate-600">
                          {event.timestamp}
                        </span>
                      </div>
                    ))}
                  </>
                </CollectionState>
              </CardContent>
            </Card>
          </section>

          <AffiliateTelemetryChart />

          <aside className="space-y-6">
            <Card className="border-cyan-200/20 bg-cyan-200/[0.06] text-white shadow-none">
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Route selector
                  </CardTitle>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100/60">
                    project: ATLAS_07
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <div className="relative">
                  <select
                    aria-label={dashboardA11yContract.providerSelectLabel}
                    value={selectedProvider.id}
                    onChange={event => {
                      const next = providers.find(
                        item => item.id === event.target.value
                      );
                      if (next) {
                        setSelectedProviderId(next.id);
                        setSelectedState(next.state);
                      }
                    }}
                    className="w-full appearance-none rounded-lg border border-white/10 bg-[#07111f] px-3 py-3 pr-10 text-sm text-white outline-none ring-cyan-200/40 focus:ring-2"
                  >
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} · {provider.category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["fit", selectedProvider.capabilities[0] ?? "chat"],
                    ["privacy", selectedProvider.privacy],
                    ["free tier", selectedProvider.freeTier],
                    ["cost", selectedProvider.costTier],
                    [
                      "latency",
                      selectedProvider.health.latencyMs
                        ? `${selectedProvider.health.latencyMs}ms`
                        : "offline",
                    ],
                    [
                      "uptime",
                      selectedProvider.health.uptimePct
                        ? `${selectedProvider.health.uptimePct}%`
                        : "—",
                    ],
                    [
                      "disclosure",
                      selectedProvider.affiliateEligible
                        ? "affiliate eligible"
                        : "none",
                    ],
                    ["routing", "disabled by policy"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-white/10 bg-black/10 p-3"
                    >
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 text-xs text-slate-200">{value}</p>
                    </div>
                  ))}
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Live affiliate routing
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-200">
                    locked
                  </span>
                </div>
                <Button
                  onClick={simulateCheck}
                  disabled={!isAdmin}
                  className="w-full bg-cyan-200 text-[#07111f] hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {isAdmin ? "Run mock health check" : "Admin gate required"}
                </Button>
                <p
                  aria-live={dashboardA11yContract.liveRegionPoliteness}
                  className="text-[11px] leading-5 text-slate-500"
                >
                  {flash}
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
              <CardHeader className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">
                      Adapter matrix
                    </CardTitle>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      phase two connectors
                    </p>
                  </div>
                  <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-3">
                <CollectionState
                  state={datasetStates.adapters}
                  emptyLabel="No integration adapters configured."
                >
                  <>
                    {adapters.map(adapter => {
                      const Icon = adapter.icon;
                      return (
                        <button
                          key={adapter.name}
                          onClick={() => setSelectedAdapter(adapter.name)}
                          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${selectedAdapter === adapter.name ? "border-pink-200/30 bg-pink-200/[0.06]" : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"}`}
                        >
                          <Icon className="h-4 w-4 text-pink-100/70" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs text-slate-200">
                              {adapter.name}
                            </span>
                            <span className="mt-1 block truncate font-mono text-[9px] text-slate-600">
                              {adapter.contract} · {adapter.detail}
                            </span>
                          </span>
                          <StatePill state={adapter.state} />
                        </button>
                      );
                    })}
                  </>
                </CollectionState>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
              <CardHeader className="border-b border-white/10 px-5 py-4">
                <CardTitle className="text-base font-medium">
                  Attribution ledger
                </CardTitle>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  only model_switch / referral_click
                </p>
              </CardHeader>
              <CardContent className="divide-y divide-white/10 p-0">
                {(
                  attributionQuery.data?.map(event => ({
                    id: event.eventId,
                    type: event.eventType,
                    provider: event.provider,
                    consent: event.consent,
                    timestamp: event.occurredAt.toLocaleString(),
                  })) ?? attributionEvents
                ).map(event => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${event.type === "referral_click" ? "bg-pink-200/10 text-pink-100" : "bg-cyan-200/10 text-cyan-100"}`}
                    >
                      {event.type === "referral_click" ? (
                        <ExternalLink className="h-3.5 w-3.5" />
                      ) : (
                        <Code2 className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-slate-200">
                        {event.type === "referral_click"
                          ? "Referral click"
                          : "Model switch"}{" "}
                        · {event.provider}
                      </p>
                      <p className="mt-1 font-mono text-[9px] text-slate-600">
                        {event.consent} consent · {event.timestamp}
                      </p>
                    </div>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Referral preview
                  </CardTitle>
                  <LockKeyhole className="h-4 w-4 text-slate-500" />
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Parameter injection is isolated to the consent-gated redirect
                  boundary.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={consent === "granted" ? "default" : "outline"}
                    onClick={() => setConsent("granted")}
                    className="border-white/10 bg-white/5 text-xs hover:bg-white/10"
                  >
                    Grant consent
                  </Button>
                  <Button
                    size="sm"
                    variant={consent === "declined" ? "default" : "outline"}
                    onClick={() => setConsent("declined")}
                    className="border-white/10 bg-white/5 text-xs hover:bg-white/10"
                  >
                    Decline
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={recordReferralClick}
                  disabled={!referralPreview || attributionAppend.isPending}
                  className="border-white/10 bg-pink-200/10 text-xs text-pink-100 hover:bg-pink-200/20"
                >
                  Record consented referral click
                </Button>
                <div className="rounded-lg border border-dashed border-white/10 bg-black/10 p-3 font-mono text-[10px] leading-5 text-slate-500">
                  {referralPreview ? (
                    <>
                      source=agentos
                      <br />
                      placement=provider_selector
                      <br />
                      <span className="text-emerald-200">
                        project_data=false · thread_data=false · network=false
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-200">
                      No referral redirect generated. Consent or eligibility is
                      missing.
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="border-t border-white/10 bg-black/10 px-5 py-3 sm:px-8">
          <div className="flex flex-col gap-2 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-mono uppercase tracking-[0.14em]">
              {selectedAdapter} adapter selected · state machine order enforced
            </span>
            <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.14em]">
              <WifiOff className="h-3.5 w-3.5" />
              external connections disabled
            </span>
          </div>
        </div>
        <DashboardAccessibilityProbe />
      </div>
    </DashboardLayout>
  );
}
