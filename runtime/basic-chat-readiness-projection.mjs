// Presentation-only readiness projection for AgentOS Basic Chat.
// Callers must supply canonical snapshots/probe results. This module performs no
// probing, persistence, authority mutation, execution, assurance or enablement.

const HOST_LIFECYCLE_STATES = new Set(['idle', 'working', 'blocked', 'recovery_required', 'offline_or_stale']);
const HOST_FRESHNESS_STATES = new Set(['fresh', 'stale', 'unknown', 'conflicting']);
const EXACT_HEAD_RE = /^[a-f0-9]{40}$/u;
const WINDOWS_REQUIRED_TOOLS = Object.freeze(['powershell.exe', 'git.exe', 'npm.cmd']);

function basicChatState(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return Object.freeze({ state: 'unknown', reason: 'BASIC_CHAT_SNAPSHOT_UNAVAILABLE' });
  }
  if (snapshot.stopped === true) {
    return Object.freeze({ state: 'stopped', reason: 'BASIC_CHAT_STOP_REQUESTED' });
  }
  if (snapshot.paused === true) {
    return Object.freeze({ state: 'paused', reason: 'BASIC_CHAT_PAUSED' });
  }
  if (snapshot.ready === true) {
    return Object.freeze({ state: 'available', reason: 'BASIC_CHAT_READY' });
  }
  return Object.freeze({ state: 'unknown', reason: 'BASIC_CHAT_STATE_UNCONFIRMED' });
}

function localHostLifecycleState(status, expectedHostId) {
  if (!status || typeof status !== 'object') {
    return Object.freeze({ state: 'unknown', reason: 'LOCAL_HOST_STATUS_UNAVAILABLE', freshness: 'unknown', hostId: null });
  }
  if (status.schema_version !== 1 || typeof status.host_id !== 'string' || !status.host_id.trim()) {
    return Object.freeze({ state: 'unknown', reason: 'LOCAL_HOST_STATUS_SCHEMA_INVALID', freshness: 'unknown', hostId: null });
  }
  const hostId = status.host_id.trim();
  const expected = typeof expectedHostId === 'string' && expectedHostId.trim() ? expectedHostId.trim() : null;
  if (expected && hostId !== expected) {
    return Object.freeze({ state: 'blocked', reason: 'LOCAL_HOST_ID_MISMATCH', freshness: 'conflicting', hostId });
  }
  const lifecycle = typeof status.lifecycle_state === 'string' ? status.lifecycle_state : '';
  const freshness = HOST_FRESHNESS_STATES.has(status.evidence_freshness) ? status.evidence_freshness : 'unknown';
  if (!HOST_LIFECYCLE_STATES.has(lifecycle)) {
    return Object.freeze({ state: 'unknown', reason: 'LOCAL_HOST_LIFECYCLE_UNCONFIRMED', freshness, hostId });
  }
  if (freshness === 'conflicting') {
    return Object.freeze({ state: 'blocked', reason: status.reason ?? 'LOCAL_HOST_EVIDENCE_CONFLICT', freshness, hostId });
  }
  if ((lifecycle === 'idle' || lifecycle === 'working') && freshness !== 'fresh') {
    return Object.freeze({
      state: freshness === 'stale' ? 'offline_or_stale' : 'unknown',
      reason: freshness === 'stale' ? 'LOCAL_HOST_EVIDENCE_STALE' : 'LOCAL_HOST_FRESHNESS_UNCONFIRMED',
      freshness,
      hostId,
    });
  }
  return Object.freeze({ state: lifecycle, reason: status.reason ?? null, freshness, hostId });
}

function windowsCapabilityState(probe) {
  const evaluation = probe?.evaluation;
  if (!evaluation || typeof evaluation !== 'object') {
    return Object.freeze({ state: 'unknown', reason: 'WINDOWS_CAPABILITY_EVIDENCE_UNAVAILABLE', missingRequired: Object.freeze([]) });
  }
  const missingRequired = Array.isArray(evaluation.missingRequired)
    ? Object.freeze(evaluation.missingRequired.filter((value) => typeof value === 'string'))
    : Object.freeze([]);
  if (evaluation.windows !== true) {
    return Object.freeze({ state: 'not_capable', reason: 'WINDOWS_PLATFORM_NOT_CONFIRMED', missingRequired });
  }

  const tools = evaluation.tools && typeof evaluation.tools === 'object' ? evaluation.tools : null;
  const toolEvidence = evaluation.tool_evidence && typeof evaluation.tool_evidence === 'object' ? evaluation.tool_evidence : null;
  const workspace = evaluation.workspace && typeof evaluation.workspace === 'object' ? evaluation.workspace : null;
  const explicitToolAvailability = Boolean(
    tools && WINDOWS_REQUIRED_TOOLS.every((tool) => tools[tool] === true)
  );
  const executableIdentityEvidence = Boolean(
    toolEvidence && WINDOWS_REQUIRED_TOOLS.every((tool) => {
      const evidence = toolEvidence[tool];
      return evidence &&
        typeof evidence === 'object' &&
        evidence.available === true &&
        typeof evidence.path === 'string' &&
        evidence.path.trim().length > 0;
    })
  );
  const explicitCapabilityEvidence = Boolean(
    explicitToolAvailability &&
    executableIdentityEvidence &&
    workspace &&
    workspace.readable === true &&
    workspace.writable === true
  );

  if (explicitCapabilityEvidence) {
    return Object.freeze({ state: 'capable', reason: 'WINDOWS_HOST_CAPABILITY_FACTS_CONFIRMED', missingRequired });
  }

  if (evaluation.eligible === false || missingRequired.length > 0) {
    return Object.freeze({ state: 'not_capable', reason: 'WINDOWS_HOST_CAPABILITY_PROBE_FAIL', missingRequired });
  }

  return Object.freeze({
    state: 'unknown',
    reason: explicitToolAvailability && !executableIdentityEvidence
      ? 'WINDOWS_EXECUTABLE_IDENTITY_EVIDENCE_REQUIRED'
      : 'WINDOWS_CAPABILITY_CANONICAL_EVIDENCE_REQUIRED',
    missingRequired,
  });
}

function physicalAcceptanceState(acceptance, expectedExactHead) {
  if (!acceptance || typeof acceptance !== 'object') {
    return Object.freeze({ state: 'not_established', reason: 'PHYSICAL_ACCEPTANCE_EVIDENCE_UNAVAILABLE', exactHead: null });
  }
  const exactHead = typeof acceptance.exact_head === 'string' && acceptance.exact_head.trim() ? acceptance.exact_head.trim() : null;
  const expectedHead = typeof expectedExactHead === 'string' && expectedExactHead.trim() ? expectedExactHead.trim() : null;
  const canonicalSchema = acceptance.schema === 'agentos.windows-powershell-physical-acceptance.v1';
  const safeBoundary =
    acceptance.local_wake_execution_enabled === false &&
    acceptance.scheduler_execution_enabled === false &&
    acceptance.production_autonomy_enabled === false &&
    acceptance.owner_supervision_required === true;

  if (!expectedHead || !EXACT_HEAD_RE.test(expectedHead)) {
    return Object.freeze({ state: 'not_established', reason: 'PHYSICAL_ACCEPTANCE_EXPECTED_HEAD_REQUIRED', exactHead });
  }
  if (!exactHead || !EXACT_HEAD_RE.test(exactHead)) {
    return Object.freeze({ state: 'not_established', reason: 'PHYSICAL_ACCEPTANCE_EXACT_HEAD_INVALID', exactHead });
  }
  if (exactHead !== expectedHead) {
    return Object.freeze({ state: 'not_established', reason: 'PHYSICAL_ACCEPTANCE_HEAD_MISMATCH', exactHead });
  }
  if (
    canonicalSchema &&
    acceptance.platform === 'win32' &&
    acceptance.pass === true &&
    acceptance.disposition === 'PHYSICAL_POWERSHELL_ACCEPTANCE_PASS' &&
    safeBoundary
  ) {
    return Object.freeze({ state: 'passed_for_exact_head', reason: 'PHYSICAL_ACCEPTANCE_PASS', exactHead });
  }
  if (canonicalSchema && acceptance.pass === false) {
    return Object.freeze({ state: 'failed', reason: 'PHYSICAL_ACCEPTANCE_FAIL', exactHead });
  }
  return Object.freeze({ state: 'not_established', reason: 'PHYSICAL_ACCEPTANCE_EVIDENCE_INCOMPLETE', exactHead });
}

export function projectBasicChatReadiness({
  chatSnapshot = null,
  localHostStatus = null,
  expectedHostId = null,
  windowsHostProbe = null,
  physicalAcceptance = null,
  expectedExactHead = null,
} = {}) {
  return Object.freeze({
    schemaVersion: 1,
    basicChat: basicChatState(chatSnapshot),
    localHostLifecycle: localHostLifecycleState(localHostStatus, expectedHostId),
    windowsHostCapability: windowsCapabilityState(windowsHostProbe),
    physicalWindowsAcceptance: physicalAcceptanceState(physicalAcceptance, expectedExactHead),
    projectFileMutation: Object.freeze({
      state: 'unknown',
      reason: 'NO_CANONICAL_MUTATION_READINESS_SOURCE',
    }),
  });
}
