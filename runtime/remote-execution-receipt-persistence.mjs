// AGENTOS-P0-REMOTE-RECEIPT-001
// Thin adapter over the existing local persistence artifact vocabulary.
// Uses the same artifact id/type already emitted by local-wake for remote receipts.
// This is not a new persistence system.

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} is required`);
  return value;
}

function requireText(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

export function createRemoteExecutionReceiptPersistence({ persistence } = {}) {
  requireObject(persistence, 'persistence');
  if (typeof persistence.create !== 'function' || typeof persistence.list !== 'function') {
    throw new TypeError('persistence.create and persistence.list are required');
  }

  return Object.freeze({
    async record({ receipt } = {}) {
      requireObject(receipt, 'receipt');
      const deliveryId = requireText(receipt.delivery_id, 'receipt.delivery_id');
      requireText(receipt.request_id, 'receipt.request_id');
      requireText(receipt.host_id, 'receipt.host_id');
      const entity = await persistence.create('artifact', {
        id: `remote-receipt:${deliveryId}`,
        artifactType: 'remote.execution.receipt',
        payload: receipt,
      });
      if (!entity || entity.artifactType !== 'remote.execution.receipt') {
        throw new Error('REMOTE_RECEIPT_PERSISTENCE_INVALID');
      }
      return entity;
    },

    async listForDelivery(deliveryId) {
      const id = requireText(deliveryId, 'deliveryId');
      const artifacts = await persistence.list('artifact');
      return Object.freeze(artifacts
        .filter((artifact) => artifact?.artifactType === 'remote.execution.receipt' && artifact?.payload?.delivery_id === id)
        .map((artifact) => Object.freeze({ ...artifact.payload })));
    },
  });
}
