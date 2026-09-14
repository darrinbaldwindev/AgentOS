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

function evidencePacket(receipt) {
  requireObject(receipt, 'receipt');
  const deliveryId = requireText(receipt.delivery_id, 'receipt.delivery_id');
  const requestId = requireText(receipt.request_id, 'receipt.request_id');
  const missionId = requireText(receipt.mission_id, 'receipt.mission_id');
  const taskId = requireText(receipt.task_id, 'receipt.task_id');
  const wakeTraceId = requireText(receipt.wake_trace_id, 'receipt.wake_trace_id');
  const hostId = requireText(receipt.host_id, 'receipt.host_id');
  const workerId = requireText(receipt.worker_id, 'receipt.worker_id');
  const status = requireText(receipt.status, 'receipt.status');
  const codeIdentity = requireText(receipt.code_identity, 'receipt.code_identity');
  const authorityEvidenceId = receipt.authority_evidence_id == null
    ? null
    : requireText(receipt.authority_evidence_id, 'receipt.authority_evidence_id');
  return Object.freeze({
    receipt_id: `remote-receipt:${deliveryId}`,
    delivery_id: deliveryId,
    request_id: requestId,
    mission_id: missionId,
    task_id: taskId,
    wake_trace_id: wakeTraceId,
    host_id: hostId,
    worker_id: workerId,
    status,
    code_identity: codeIdentity,
    authority_evidence_id: authorityEvidenceId,
  });
}

export function createRemoteExecutionReceiptPersistence({ persistence } = {}) {
  requireObject(persistence, 'persistence');
  if (typeof persistence.create !== 'function' || typeof persistence.list !== 'function') {
    throw new TypeError('persistence.create and persistence.list are required');
  }

  async function listArtifactsForDelivery(deliveryId) {
    const id = requireText(deliveryId, 'deliveryId');
    const artifacts = await persistence.list('artifact');
    return Object.freeze(artifacts
      .filter((artifact) => artifact?.artifactType === 'remote.execution.receipt' && artifact?.payload?.delivery_id === id));
  }

  async function listForDelivery(deliveryId) {
    const artifacts = await listArtifactsForDelivery(deliveryId);
    return Object.freeze(artifacts.map((artifact) => Object.freeze({ ...artifact.payload })));
  }

  async function evidencePacketForDelivery(deliveryId) {
    const id = requireText(deliveryId, 'deliveryId');
    const artifacts = await listArtifactsForDelivery(id);
    if (artifacts.length !== 1) throw new Error('REMOTE_RECEIPT_EVIDENCE_EXACTLY_ONE_REQUIRED');
    if (artifacts[0]?.id !== `remote-receipt:${id}`) throw new Error('REMOTE_RECEIPT_EVIDENCE_ID_MISMATCH');
    return evidencePacket(artifacts[0].payload);
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

    listForDelivery,

    evidencePacketForDelivery,

    async evidencePacketForCorrelation({ deliveryId, missionId, taskId, wakeTraceId } = {}) {
      const expectedDeliveryId = requireText(deliveryId, 'deliveryId');
      const expectedMissionId = requireText(missionId, 'missionId');
      const expectedTaskId = requireText(taskId, 'taskId');
      const expectedWakeTraceId = requireText(wakeTraceId, 'wakeTraceId');
      const packet = await evidencePacketForDelivery(expectedDeliveryId);
      if (
        packet.mission_id !== expectedMissionId ||
        packet.task_id !== expectedTaskId ||
        packet.wake_trace_id !== expectedWakeTraceId
      ) {
        throw new Error('REMOTE_RECEIPT_EVIDENCE_CORRELATION_MISMATCH');
      }
      return packet;
    },
  });
}
