// AGENTOS-OPERATOR-FIRST-WAVE-PIPELINE-001
// Side-effect-free composition of the existing first-wave admission policy,
// deterministic mock adapter, canonical remote receipt evidence, and canonical
// receipt persistence. This grants no authority, invokes no live provider, and
// cannot set completion, Green, or PRS state.

import { validateFirstWaveComputerUseRequest } from './computer-use-action-policy.mjs';
import { executeMockComputerUse } from './computer-use-mock-adapter.mjs';
import { createComputerUseReceiptEvidence } from './computer-use-receipt-evidence.mjs';
import { createComputerUseReceiptPersistence } from './computer-use-receipt-persistence.mjs';

export async function executeMockComputerUsePipeline({
  governedTask,
  approvedScope,
  actionBudget,
  selectedProvider,
  selectedModel,
  script,
  candidate,
  task,
  hostId,
  workerId,
  budgetStatus,
  codeIdentity,
  createdAt,
  persistence,
} = {}) {
  const admittedRequest = validateFirstWaveComputerUseRequest({
    governedTask,
    approvedScope,
    actionBudget,
    selectedProvider,
    selectedModel,
  });

  const result = executeMockComputerUse({ admittedRequest, script });
  const receipt = createComputerUseReceiptEvidence({
    candidate,
    task,
    admittedRequest,
    hostId,
    workerId,
    status: 'AWAITING_GREEN',
    result,
    budgetStatus,
    codeIdentity,
    createdAt,
  });

  const receiptPersistence = createComputerUseReceiptPersistence({ persistence });
  let persistedReceiptArtifact;
  try {
    persistedReceiptArtifact = await receiptPersistence.record({ receipt });
  } catch (cause) {
    const error = new Error('COMPUTER_USE_RECEIPT_PERSISTENCE_FAILED', { cause });
    error.code = 'COMPUTER_USE_RECEIPT_PERSISTENCE_FAILED';
    throw error;
  }

  return Object.freeze({
    status: receipt.status,
    admittedRequest,
    result,
    receipt,
    persistedReceiptArtifact,
  });
}
