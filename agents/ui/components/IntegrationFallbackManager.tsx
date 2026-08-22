import { useMemo, useState, type KeyboardEvent } from "react";

/**
 * Self-contained B1 replacement component. This is local UI state only: it
 * does not connect to a provider, read credentials, perform a redirect, or
 * persist a consent decision. The concrete integration layer may map the
 * public types to the deterministic fixtures and local API mock added in B2–B5.
 */

export type FallbackHealth = "available" | "rate_limited" | "degraded" | "offline";
export type RequiredCapability = "general" | "tools" | "vision" | "json";
export type StreamRecovery = "interrupted" | "resume" | "fallback" | "preserved";

export interface FallbackProviderView {
  readonly id: string;
  readonly name: string;
  readonly health: FallbackHealth;
  readonly detail: string;
  readonly supports: readonly RequiredCapability[];
  readonly referralStatus: "none" | "verified";
}

export interface IntegrationFallbackManagerProps {
  readonly providers?: readonly FallbackProviderView[];
  readonly initialCapability?: RequiredCapability;
}

export const LOCAL_FALLBACK_PROVIDERS: readonly FallbackProviderView[] = Object.freeze([
  Object.freeze({
    id: "local",
    name: "Local Runtime",
    health: "available",
    detail: "Private local fixture with tools and structured output support.",
    supports: Object.freeze(["general", "tools", "json"]),
    referralStatus: "none",
  }),
  Object.freeze({
    id: "free",
    name: "Free Community Gateway",
    health: "rate_limited",
    detail: "Local fixture: retry in 60 seconds; fallback preview is available.",
    supports: Object.freeze(["general", "tools", "vision", "json"]),
    referralStatus: "none",
  }),
  Object.freeze({
    id: "credit",
    name: "Verified Credit Provider",
    health: "degraded",
    detail: "Local fixture: degraded health; referral metadata is display-only.",
    supports: Object.freeze(["general", "tools", "vision", "json"]),
    referralStatus: "verified",
  }),
]);

const healthLabel: Record<FallbackHealth, string> = {
  available: "Available",
  rate_limited: "Rate limited",
  degraded: "Degraded",
  offline: "Offline",
};

const healthWeight: Record<FallbackHealth, number> = {
  available: 3,
  degraded: 2,
  rate_limited: 1,
  offline: 0,
};

/**
 * Returns a deterministic capability-first local ranking. Referral status is
 * intentionally not read, ensuring display metadata cannot change ordering.
 */
export function rankFallbackProviders(
  providers: readonly FallbackProviderView[],
  capability: RequiredCapability,
): readonly FallbackProviderView[] {
  return [...providers].sort((left, right) => {
    const leftCapability = Number(left.supports.includes(capability));
    const rightCapability = Number(right.supports.includes(capability));
    const capabilityDifference = rightCapability - leftCapability;
    if (capabilityDifference !== 0) return capabilityDifference;
    const healthDifference = healthWeight[right.health] - healthWeight[left.health];
    if (healthDifference !== 0) return healthDifference;
    return left.name.localeCompare(right.name);
  });
}

function recoveryMessage(recovery: StreamRecovery): string {
  const messages: Record<StreamRecovery, string> = {
    interrupted: "Partial output is preserved locally. Choose an explicit recovery action.",
    resume: "Recovery selected: resume from the last confirmed boundary.",
    fallback: "Recovery selected: preview a compatible fallback without contacting a provider.",
    preserved: "Recovery selected: preserve partial output locally and stop.",
  };
  return messages[recovery];
}

export function IntegrationFallbackManager({
  providers = LOCAL_FALLBACK_PROVIDERS,
  initialCapability = "general",
}: IntegrationFallbackManagerProps) {
  const [capability, setCapability] = useState<RequiredCapability>(initialCapability);
  const [selectedProviderId, setSelectedProviderId] = useState(providers[0]?.id ?? "");
  const [showContextPreview, setShowContextPreview] = useState(false);
  const [recovery, setRecovery] = useState<StreamRecovery>("interrupted");
  const [announcement, setAnnouncement] = useState("Offline fallback workspace is ready.");

  const rankedProviders = useMemo(
    () => rankFallbackProviders(providers, capability),
    [providers, capability],
  );
  const selected = providers.find((provider) => provider.id === selectedProviderId) ?? rankedProviders[0];

  function selectProvider(provider: FallbackProviderView) {
    setSelectedProviderId(provider.id);
    setAnnouncement(`${provider.name} selected. Health: ${healthLabel[provider.health]}. ${provider.detail}`);
  }

  function moveProvider(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % rankedProviders.length;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + rankedProviders.length) % rankedProviders.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = rankedProviders.length - 1;
    const next = rankedProviders[nextIndex];
    selectProvider(next);
    document.getElementById(`provider-${next.id}`)?.focus();
  }

  function previewRoute() {
    const candidate = rankedProviders[0];
    setSelectedProviderId(candidate.id);
    setAnnouncement(`Local route preview selected ${candidate.name} for ${capability}. Ranking uses capability fit and health only.`);
  }

  function chooseRecovery(nextRecovery: StreamRecovery) {
    setRecovery(nextRecovery);
    setAnnouncement(recoveryMessage(nextRecovery));
  }

  return (
    <section aria-labelledby="fallback-manager-title" className="agentos-fallback-manager">
      <header>
        <p className="eyebrow">Self-contained offline replacement</p>
        <h2 id="fallback-manager-title">Fallback and recovery manager</h2>
        <p>No provider connection, credential access, redirect, or persistence occurs in this component.</p>
      </header>

      <section aria-labelledby="context-limit-title" className="context-limit-warning">
        <h3 id="context-limit-title">Context window is nearly full</h3>
        <p><strong>28,480 of 32,768 tokens are allocated.</strong> Review a compacted preview before continuing.</p>
        <button
          aria-controls="context-compaction-preview"
          aria-expanded={showContextPreview}
          onClick={() => {
            setShowContextPreview((visible) => !visible);
            setAnnouncement(showContextPreview ? "Compaction preview hidden." : "Compaction preview shown.");
          }}
          type="button"
        >
          {showContextPreview ? "Hide compacted preview" : "Review compacted preview"}
        </button>
        {showContextPreview ? (
          <div id="context-compaction-preview">
            <p>Local preview: preserve active goals, selected model, recovery state, and verified artifacts. Prompt contents are not shown.</p>
          </div>
        ) : null}
      </section>

      <div aria-label="Fallback controls" role="toolbar">
        <label htmlFor="required-capability">Required capability</label>
        <select
          id="required-capability"
          onChange={(event) => setCapability(event.target.value as RequiredCapability)}
          value={capability}
        >
          <option value="general">General response</option>
          <option value="tools">Tool use</option>
          <option value="vision">Vision</option>
          <option value="json">Structured JSON</option>
        </select>
        <button onClick={previewRoute} type="button">Preview local route</button>
      </div>

      <section aria-labelledby="provider-health-title">
        <h3 id="provider-health-title">Provider health</h3>
        <ul aria-label="Provider fallback choices">
          {rankedProviders.map((provider, index) => (
            <li key={provider.id}>
              <button
                aria-pressed={selected?.id === provider.id}
                id={`provider-${provider.id}`}
                onClick={() => selectProvider(provider)}
                onKeyDown={(event) => moveProvider(event, index)}
                type="button"
              >
                <span>{provider.name}</span>
                <span aria-label={`Health: ${healthLabel[provider.health]}`}>{healthLabel[provider.health]}</span>
                <small>{provider.detail}</small>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stream-recovery-title">
        <h3 id="stream-recovery-title">Streaming recovery</h3>
        <p>{recoveryMessage(recovery)}</p>
        <div aria-label="Streaming recovery actions" role="group">
          <button onClick={() => chooseRecovery("resume")} type="button">Resume from last confirmed boundary</button>
          <button onClick={() => chooseRecovery("fallback")} type="button">Preview compatible fallback</button>
          <button onClick={() => chooseRecovery("preserved")} type="button">Keep partial output and stop</button>
        </div>
      </section>

      <p aria-live="polite" role="status">{announcement}</p>
    </section>
  );
}
