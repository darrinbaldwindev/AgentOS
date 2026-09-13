// AGENTOS-WINDOWS-WORKER-009
// Thin composition seam for the existing bounded PowerShell worker.
// Reuses the canonical governed runtime boundary and durable remote-delivery claim guard.
// It does not schedule work, grant authority, enable execution, finalize Green/PRS,
// or create a second claim, queue, persistence, budget, or governance system.

import { createGovernedExecutionClaimGuard } from './governed-execution-claim-guard.mjs';
import { createWindowsPowerShellGovernedRuntime } from './windows-powershell-governed-runtime.mjs';
import { createWindowsPowerShellLocalWorker } from './windows-powershell-local-worker.mjs';

export function createWindowsPowerShellClaimedLocalRuntime({
  claims,
  hostIdentity,
  workspaceRoot,
  hostProbe,
  powerShellAdapter,
  runtimeExecutionEnabled = false,
  recoveryOptions = null,
  ...governedRuntimeOptions
} = {}) {
  if (!hostIdentity || typeof hostIdentity !== 'object') throw new TypeError('hostIdentity is required');
  if (typeof runtimeExecutionEnabled !== 'boolean') throw new TypeError('runtimeExecutionEnabled must be boolean');

  const governedBoundary = createWindowsPowerShellGovernedRuntime({
    ...governedRuntimeOptions,
    hostIdentity,
    workspaceRoot,
    hostProbe,
    runtimeExecutionEnabled,
  });

  const claimedBoundary = createGovernedExecutionClaimGuard({
    boundary: governedBoundary,
    claims,
    hostId: hostIdentity.host_id,
    recoveryOptions,
  });

  return createWindowsPowerShellLocalWorker({
    hostIdentity,
    workspaceRoot,
    hostProbe,
    powerShellAdapter,
    executionBoundary: claimedBoundary,
    runtimeExecutionEnabled,
  });
}
