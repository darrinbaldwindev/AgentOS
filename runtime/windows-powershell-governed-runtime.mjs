// AGENTOS-WINDOWS-WORKER-008
// Production composition factory for the existing governed PowerShell execution boundary.
// This owns no authority, consent, policy, risk, budget, approval, receipt, verification,
// scheduler, queue, Green, PRS, or persistence semantics. It only binds existing primitives.

import { createGovernedExecutionBoundary } from './governed-execution-boundary.mjs';
import {
  createCanonicalContextGate,
  createCanonicalAuthorityGate,
  createCanonicalPowerShellCapabilityGate,
  createCanonicalToolPolicyGate,
  createCanonicalHumanApprovalGate,
  createCanonicalPowerShellReceiptGate,
  createCanonicalVerificationGate,
} from './governed-execution-canonical-adapters.mjs';

export const WINDOWS_POWERSHELL_GOVERNED_WORKER_ID = 'agentos:windows-powershell-worker';

export function createWindowsPowerShellGovernedRuntime({
  canonicalContext,
  authorityPolicy,
  consentGate,
  hostIdentity,
  workspaceRoot,
  hostProbe,
  runtimeExecutionEnabled = false,
  toolPolicy,
  riskPolicy,
  budget,
  humanGate,
  workerId = WINDOWS_POWERSHELL_GOVERNED_WORKER_ID,
  codeIdentity,
  createdAt,
  recordReceipt,
  resolveBudgetStatus,
  verificationRouter,
  runVerifier,
} = {}) {
  if (typeof runtimeExecutionEnabled !== 'boolean') {
    throw new TypeError('runtimeExecutionEnabled must be boolean');
  }

  return createGovernedExecutionBoundary({
    context: createCanonicalContextGate({ canonicalContext }),
    authority: createCanonicalAuthorityGate({ authorityPolicy }),
    consent: consentGate,
    capability: createCanonicalPowerShellCapabilityGate({
      hostIdentity,
      workspaceRoot,
      hostProbe,
      runtimeExecutionEnabled,
    }),
    policy: createCanonicalToolPolicyGate({ toolPolicy }),
    risk: riskPolicy,
    budget,
    approval: createCanonicalHumanApprovalGate({ humanGate }),
    receipts: createCanonicalPowerShellReceiptGate({
      hostId: hostIdentity?.host_id,
      workerId,
      codeIdentity,
      createdAt,
      recordReceipt,
      resolveBudgetStatus,
    }),
    verification: createCanonicalVerificationGate({ verificationRouter, runVerifier }),
  });
}
