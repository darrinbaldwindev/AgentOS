// Presentation-only readiness projection for AgentOS Basic Chat.
// Callers must supply canonical snapshots/probe results. This module performs no
// probing, persistence, authority mutation, execution, assurance or enablement.

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
  const workspace = evaluation.workspace && typeof evaluation.workspace === 'object' ? evaluation.workspace : null;
  const explicitCapabilityEvidence = Boolean(
    tools &&
    workspace &&
    tools['powershell.exe'] === true &&
    tools['git.exe'] === true &&
    tools['npm.cmd'] === true &&
    workspace.readable === true &&
    workspace.writable === true
  );

  if (explicitCapabilityEvidence) {
    return Object.freeze({ state: 'capable', reason: 'WINDOWS_HOST_CAPABILITY_FACTS_CONFIRMED', missingRequired });
  }

  if (evaluation.eligible === false || missingRequired.length > 0) {
    return Object.freeze({ state: 'not_capable', reason: 'WINDOWS_HOST_CAPABILITY_PROBE_FAIL', missingRequired });
  }

  // An asserted eligible=true Boolean is not enough. Only explicit canonical probe
  // facts can support a positive capability presentation.
  return Object.freeze({ state: 'unknown', reason: 'WINDOWS_CAPABILITY_CANONICAL_EVIDENCE_REQUIRED', missingRequired });
}

function physicalAcceptanceState(acceptance) {
  if (!acceptance || typeof acceptance !== 'object') {
    return Object.freeze({ state: 'not_established', reason: 'PHYSICAL_ACCEPTANCE_EVIDENCE_UNAVAILABLE', exactHead: null });
  }
  const exactHead = typeof acceptance.exact_head === 'string' ? acceptance.exact_head : null;
  const canonicalSchema = acceptance.schema === 'agentos.windows-powershell-physical-acceptance.v1';
  const safeBoundary =
    acceptance.local_wake_execution_enabled === false &&
    acceptance.scheduler_execution_enabled === false &&
    acceptance.production_autonomy_enabled === false &&
    acceptance.owner_supervision_required === true;
  if (
    canonicalSchema &&
    acceptance.platform === 'win32' &&
    acceptance.pass === true &&
    acceptance.disposition === 'PHYSICAL_POWERSHELL_ACCEPTANCE_PASS' &&
    exactHead &&
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
  windowsHostProbe = null,
  physicalAcceptance = null,
} = {}) {
  return Object.freeze({
    schemaVersion: 1,
    basicChat: basicChatState(chatSnapshot),
    windowsHostCapability: windowsCapabilityState(windowsHostProbe),
    physicalWindowsAcceptance: physicalAcceptanceState(physicalAcceptance),
    projectFileMutation: Object.freeze({
      state: 'unknown',
      reason: 'NO_CANONICAL_MUTATION_READINESS_SOURCE',
    }),
  });
}
