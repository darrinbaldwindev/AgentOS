// AGENTOS-P0-REMOTE-RECOVERY-001
// Read-only recovery evidence reconciliation for retained remote delivery claims.
// This module never mutates, deletes, releases or reclaims a claim. A correlated
// durable receipt can prove that blind replay is unsafe; missing/ambiguous evidence
// remains RECOVERY_REQUIRED.

const RECEIPT_STATUSES = new Set(['AWAITING_GREEN', 'GREEN_BLOCKED', 'COMPLETED', 'FAILED', 'BLOCKED']);

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} is required`);
  return value;
}

function requireText(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function matchesClaimIdentity(receipt, claim, field) {
  const claimed = claim[field];
  return claimed === undefined || claimed === null || claimed === '' || receipt[field] === claimed;
}

function correlated(receipt, claim) {
  return receipt.delivery_id === claim.delivery_id &&
    receipt.request_id === claim.request_id &&
    receipt.host_id === claim.host_id &&
    matchesClaimIdentity(receipt, claim, 'mission_id') &&
    matchesClaimIdentity(receipt, claim, 'task_id') &&
    matchesClaimIdentity(receipt, claim, 'wake_trace_id');
}

export function reconcileRemoteDeliveryRecoveryEvidence({ claim, receipts = [] } = {}) {
  requireObject(claim, 'claim');
  const deliveryId = requireText(claim.delivery_id, 'claim.delivery_id');
  const requestId = requireText(claim.request_id, 'claim.request_id');
  const hostId = requireText(claim.host_id, 'claim.host_id');
  if (claim.state !== 'CLAIMED') throw new Error('REMOTE_CLAIM_STATE_UNSUPPORTED');
  if (!Array.isArray(receipts)) throw new TypeError('receipts must be an array');

  const sameDelivery = receipts.filter((receipt) => receipt?.delivery_id === deliveryId);
  const conflicting = sameDelivery.filter((receipt) => !correlated(receipt, claim));
  if (conflicting.length > 0) {
    return Object.freeze({
      delivery_id: deliveryId,
      request_id: requestId,
      host_id: hostId,
      disposition: 'RECOVERY_CORRELATION_CONFLICT',
      recovery_required: true,
      replay_allowed: false,
      receipt_count: sameDelivery.length,
      reason: 'DELIVERY_RECEIPT_IDENTITY_CONFLICT',
    });
  }

  const exact = sameDelivery.filter((receipt) => correlated(receipt, claim));
  if (exact.length === 0) {
    return Object.freeze({
      delivery_id: deliveryId,
      request_id: requestId,
      host_id: hostId,
      disposition: 'RECOVERY_EVIDENCE_MISSING',
      recovery_required: true,
      replay_allowed: false,
      receipt_count: 0,
      reason: 'NO_CORRELATED_DURABLE_RECEIPT',
    });
  }

  if (exact.length !== 1) {
    return Object.freeze({
      delivery_id: deliveryId,
      request_id: requestId,
      host_id: hostId,
      disposition: 'RECOVERY_EVIDENCE_AMBIGUOUS',
      recovery_required: true,
      replay_allowed: false,
      receipt_count: exact.length,
      reason: 'MULTIPLE_CORRELATED_RECEIPTS_REQUIRE_RECONCILIATION',
    });
  }

  const receipt = exact[0];
  requireText(receipt.task_id, 'receipt.task_id');
  requireText(receipt.mission_id, 'receipt.mission_id');
  requireText(receipt.wake_trace_id, 'receipt.wake_trace_id');
  requireText(receipt.worker_id, 'receipt.worker_id');
  requireText(receipt.code_identity, 'receipt.code_identity');
  const status = requireText(receipt.status, 'receipt.status');
  if (!RECEIPT_STATUSES.has(status)) throw new Error('REMOTE_RECEIPT_STATUS_INVALID');

  return Object.freeze({
    delivery_id: deliveryId,
    request_id: requestId,
    host_id: hostId,
    disposition: 'CORRELATED_DURABLE_RECEIPT_PRESENT',
    recovery_required: true,
    replay_allowed: false,
    receipt_count: 1,
    receipt: Object.freeze({
      mission_id: receipt.mission_id,
      task_id: receipt.task_id,
      wake_trace_id: receipt.wake_trace_id,
      worker_id: receipt.worker_id,
      status,
      budget_status: receipt.budget_status ?? null,
      code_identity: receipt.code_identity,
      created_at: receipt.created_at ?? null,
    }),
    reason: 'CORRELATED_RECEIPT_MUST_BE_RECONCILED_NEVER_BLINDLY_RERUN',
  });
}
