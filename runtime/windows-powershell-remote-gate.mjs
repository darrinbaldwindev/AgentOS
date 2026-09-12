// AGENTOS-WINDOWS-WORKER-004
// Composition-only bridge from real host capability evidence to the existing
// canonical remote-pickup eligibility gate. This does NOT authorize execution.

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
} = {}) {
  if (!taskRequiresPowerShell(admittedTask)) {
    throw new TypeError('admittedTask must require a shell.powershell capability');
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

  // Deliberately fail closed even when host pickup eligibility is proven. The
  // actual PowerShell runner is not connected to local-wake/scheduler yet.
  const disposition = canonicalGate.eligible
    ? 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED'
    : canonicalGate.disposition;

  return Object.freeze({
    pickup_eligible: canonicalGate.eligible,
    execution_authorized: false,
    disposition,
    host_capabilities: hostCapabilities,
    host_capability_evidence: capabilityEvidence,
    canonical_gate: canonicalGate,
  });
}
