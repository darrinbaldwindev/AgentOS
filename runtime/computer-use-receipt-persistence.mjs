// AGENTOS-OPERATOR-FIRST-WAVE-PERSISTENCE-001
// Computer-use receipt persistence composed strictly through the canonical
// remote execution receipt persistence adapter. This creates no second
// persistence vocabulary or receipt authority.

import { createRemoteExecutionReceiptPersistence } from './remote-execution-receipt-persistence.mjs';

const ALLOWED_INTERMEDIATE_STATUSES = new Set(['AWAITING_GREEN', 'GREEN_BLOCKED', 'FAILED', 'BLOCKED']);

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} is required`);
  return value;
}

export function createComputerUseReceiptPersistence({ persistence } = {}) {
  const canonical = createRemoteExecutionReceiptPersistence({ persistence });

  return Object.freeze({
    async record({ receipt } = {}) {
      requireObject(receipt, 'receipt');
      requireObject(receipt.execution, 'receipt.execution');
      if (!ALLOWED_INTERMEDIATE_STATUSES.has(receipt.status)) {
        throw new Error('COMPUTER_USE_RECEIPT_PERSISTENCE_FINAL_COMPLETION_FORBIDDEN');
      }
      if (typeof receipt.execution.action !== 'string' || !receipt.execution.action.startsWith('computer.')) {
        throw new Error('COMPUTER_USE_RECEIPT_PERSISTENCE_EXECUTION_EVIDENCE_REQUIRED');
      }
      return canonical.record({ receipt });
    },

    async listForDelivery(deliveryId) {
      const receipts = await canonical.listForDelivery(deliveryId);
      return Object.freeze(receipts.filter((receipt) =>
        receipt?.execution &&
        typeof receipt.execution.action === 'string' &&
        receipt.execution.action.startsWith('computer.')
      ));
    },
  });
}
