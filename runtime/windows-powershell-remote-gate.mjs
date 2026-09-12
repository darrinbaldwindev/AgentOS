// AGENTOS-WINDOWS-WORKER-004
// Composition-only bridge from real host capability evidence to the existing
// canonical remote-pickup eligibility gate. Execution remains disabled by default.

import { evaluateRemotePickupEligibility } from './remote-pickup-eligibility.mjs';
import { createDefaultWindowsWorkerHostProbe } from './windows-worker-default-host-probe.mjs';

const POWERSHELL_CAPABILITY_PREFIX = 'shell.powershell.';
const BASE_CAPABILITIES = Object.freeze(['repository:read']);

function taskRequiresPowerShell(task) {
  return Array.isArray(task?.required_capabilities) &&
    task.required_capabilities.some((capability) =>
      typeof capability === 'string' && capability.startsWith(POWERSHELL_CAPABILITY_PREFIX));
}

export async function evaluateWindowsPowerShellRemotePickup({
  admittedTask,
  hostIdentity,
  workspaceRoot,
  hostProbe,
  runtimeExecutionEnabled = false,
} = {}) {
  if (!taskRequiresPowerShell(admittedTask)) {
    throw new TypeError('admittedTask must require a shell.powershell capability');
  }
  if (typeof runtimeExecutionEnabled !== 'boolean') {
    throw new TypeError('runtimeExecutionEnabled must be boolean');
  }

  const probe = hostProbe ?? createDefaultWindowsWorkerHostProbe({ workspaceRoot });
  if (!probe || typeof probe.probe !== 'function') throw new TypeError('hostProbe.probe is required');

  const capabilityEvidence = await probe.probe(hostIdentity?.host_id ?? null);
  const hostCapabilities = Object.freeze([
    ...new Set([...BASE_CAPABILITIES, ...(capabilityEvidence?.capabilities ?? [])]),
  ]);
  const canonicalGate = evaluateRemotePickupEligibility({
    admittedTask,
    hostIdentity,
    hostCapabilities,
  });

  const executionAuthorized = canonicalGate.eligible && runtimeExecutionEnabled === true;
  const disposition = !canonicalGate.eligible
    ? canonicalGate.disposition
    : executionAuthorized
      ? 'ELIGIBLE_FOR_BOUNDED_POWERSHELL_EXECUTION'
      : 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED';

  return Object.freeze({
    pickup_eligible: canonicalGate.eligible,
    execution_authorized: executionAuthorized,
    runtime_execution_enabled: runtimeExecutionEnabled,
    disposition,
    host_capabilities: hostCapabilities,
    host_capability_evidence: capabilityEvidence,
    canonical_gate: canonicalGate,
  });
}
