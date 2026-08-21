import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { attributionRecords, recoveryRecords } from "../drizzle/schema";
import {
  affiliateTelemetry,
  filterTelemetryByDateRange,
  selectTelemetryRange,
  summarizeTelemetry,
  telemetryToCsv,
} from "../shared/agentosTelemetry";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardAccessibilityProbe } from "../client/src/components/DashboardAccessibilityProbe";
import {
  dashboardA11yContract,
  dashboardNavItems,
  CONTROL_PLANE_BADGE_LABELS,
} from "../client/src/lib/dashboardContracts";
import { getEndUserChatStatus } from "../client/src/pages/EndUserChat";
import {
  AppendOnlyRecoveryLog,
  CONNECTION_STATES,
  attributionEvents,
  buildReferralPreview,
  executeRecovery,
  integrationAdapters,
  createMockDatasetStates,
  nextConnectionState,
  nextMockDataState,
  providers,
  recoveryAction,
  recoveryEvents,
  summarizeTraffic,
} from "../client/src/lib/agentosMock";

describe("AgentOS dashboard safety invariants", () => {
  it("enforces the declared connection state order", () => {
    expect(CONNECTION_STATES).toEqual([
      "unknown",
      "checking",
      "available",
      "needs_connection",
      "limited",
      "degraded",
      "offline",
    ]);
    expect(nextConnectionState("unknown")).toBe("checking");
    expect(nextConnectionState("degraded")).toBe("offline");
    expect(nextConnectionState("offline")).toBe("offline");
  });

  it("filters telemetry by date and serializes a governed CSV export", () => {
    const filtered = filterTelemetryByDateRange(
      affiliateTelemetry,
      "2026-08-17",
      "2026-08-19"
    );
    expect(filtered).toHaveLength(3);
    expect(summarizeTelemetry(filtered).clicks).toBe(404);
    expect(telemetryToCsv(filtered)).toContain(
      "date,label,clicks,signups,active_users,conversion_rate"
    );
    expect(telemetryToCsv(filtered)).toContain("2026-08-17,MON,98,22");
  });

  it("exposes explicit end-user typing and control-plane identity labels", () => {
    expect(getEndUserChatStatus(true)).toBe("AgentOS is typing");
    expect(getEndUserChatStatus(false)).toBe("Ready for your next message");
    expect(CONTROL_PLANE_BADGE_LABELS.admin).toBe("ADMIN CONTROL");
    expect(CONTROL_PLANE_BADGE_LABELS.owner).toBe("OWNER CONTROL");
  });

  it("keeps live affiliate routing disabled in the preload catalog", () => {
    expect(
      providers.every(provider => provider.liveRoutingEnabled === false)
    ).toBe(true);
  });

  it("allows only the two attribution event types", () => {
    expect(
      attributionEvents.every(event =>
        ["model_switch", "referral_click"].includes(event.type)
      )
    ).toBe(true);
    expect(
      attributionEvents.every(
        event => !("projectId" in event) && !("threadId" in event)
      )
    ).toBe(true);
  });

  it("keeps recovery events append-only and free of prompt or secret fields", () => {
    expect(
      recoveryEvents.every(
        event =>
          event.containsPrompt === false && event.containsSecret === false
      )
    ).toBe(true);
    expect(recoveryAction("rate_limit")).toContain("local route");
    expect(recoveryAction("referral_failure")).toContain("Continue core task");
  });

  it("exposes cost and health metadata for every provider selector record", () => {
    expect(
      providers.every(provider =>
        ["free", "credits", "paid"].includes(provider.costTier)
      )
    ).toBe(true);
    expect(
      providers.every(
        provider =>
          typeof provider.health.latencyMs === "number" &&
          typeof provider.health.uptimePct === "number"
      )
    ).toBe(true);
  });

  it("types every phase-two adapter with an owner approval gate", () => {
    expect(integrationAdapters.length).toBeGreaterThan(0);
    expect(
      integrationAdapters.every(
        adapter =>
          adapter.ownerApprovalRequired === true && adapter.contract.length > 0
      )
    ).toBe(true);
  });

  it("executes a safe recovery result for every declared failure scenario", () => {
    const kinds = [
      "rate_limit",
      "quota_exhausted",
      "provider_offline",
      "capability_mismatch",
      "permission_denied",
      "tool_timeout",
      "partial_stream",
      "artifact_conflict",
      "referral_failure",
    ] as const;
    for (const kind of kinds) {
      const result = executeRecovery(kind);
      expect(result.kind).toBe(kind);
      expect(result.action.length).toBeGreaterThan(10);
    }
  });

  it("appends sanitized recovery entries without mutating prior snapshots", () => {
    const log = new AppendOnlyRecoveryLog(recoveryEvents);
    const before = log.snapshot();
    log.append({
      id: "new",
      kind: "tool_timeout",
      provider: "Ollama Local",
      action: "Retry idempotent action",
      status: "resolved",
      timestamp: "now",
    });
    const after = log.snapshot();
    expect(after).toHaveLength(before.length + 1);
    expect(before).toHaveLength(recoveryEvents.length);
    expect(after.at(-1)).toMatchObject({
      containsPrompt: false,
      containsSecret: false,
    });
  });

  it("keeps the dashboard interaction contract keyboard- and screen-reader-oriented", () => {
    expect(dashboardNavItems).toHaveLength(6);
    expect(dashboardNavItems.map(item => item.label)).toContain(
      "Recovery + policy"
    );
    expect(dashboardNavItems.map(item => item.label)).toContain(
      "Model-switch chat"
    );
    expect(dashboardA11yContract.providerSelectLabel).toBe(
      "Choose provider route"
    );
    expect(dashboardA11yContract.liveRegionPoliteness).toBe("polite");
    expect(dashboardA11yContract.loadingStatusRole).toBe("status");
    expect(dashboardA11yContract.recoveryAlertRole).toBe("alert");
  });

  it("cycles and creates meaningful mock dataset states", () => {
    expect(nextMockDataState("ready")).toBe("loading");
    expect(nextMockDataState("loading")).toBe("empty");
    expect(nextMockDataState("empty")).toBe("error");
    expect(nextMockDataState("error")).toBe("ready");
    expect(createMockDatasetStates("error")).toEqual({
      providers: "error",
      affiliates: "error",
      adapters: "error",
      recovery: "error",
    });
  });

  it("renders the dashboard accessibility probe with real DOM semantics", () => {
    const markup = renderToStaticMarkup(
      createElement(DashboardAccessibilityProbe)
    );
    expect(markup).toContain('aria-label="AgentOS control plane navigation"');
    expect(markup).toContain('aria-label="Choose provider route"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Run mock health check");
    expect(markup).toContain('href="/providers"');
  });

  it("derives deterministic traffic metrics", () => {
    expect(summarizeTraffic()).toEqual({
      clicks: 922,
      signups: 218,
      conversionRate: 0.236,
    });
  });

  it("shapes telemetry ranges deterministically for the interactive chart", () => {
    expect(affiliateTelemetry).toHaveLength(7);
    expect(selectTelemetryRange("4D")).toHaveLength(4);
    expect(summarizeTelemetry(selectTelemetryRange("4D"))).toEqual({
      clicks: 626,
      signups: 151,
      activeUsers: 112,
      conversionRate: 151 / 626,
    });
  });

  it("keeps persistence records append-only and context-free", () => {
    expect(recoveryRecords.eventId).toBeDefined();
    expect(recoveryRecords.userId).toBeDefined();
    expect(recoveryRecords.containsPrompt).toBeDefined();
    expect(recoveryRecords.containsSecret).toBeDefined();
    expect("prompt" in recoveryRecords).toBe(false);
    expect("threadId" in recoveryRecords).toBe(false);
    expect("projectId" in recoveryRecords).toBe(false);
    expect(attributionRecords.eventType).toBeDefined();
    expect(attributionRecords.userId).toBeDefined();
    expect("referralParams" in attributionRecords).toBe(false);
  });

  it("does not construct referral parameters without consent or eligibility", () => {
    const eligible = providers.find(provider => provider.id === "taskade")!;
    const ineligible = providers.find(provider => provider.id === "ollama")!;
    expect(buildReferralPreview(eligible, "declined")).toBeNull();
    expect(buildReferralPreview(ineligible, "granted")).toBeNull();
    expect(buildReferralPreview(eligible, "granted")).toMatchObject({
      containsProjectData: false,
      containsThreadData: false,
      opensNetwork: false,
    });
  });
});
