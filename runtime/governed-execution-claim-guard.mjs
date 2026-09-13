// AGENTOS-P0-GOVERNED-EXECUTION-003
// Thin replay/idempotency guard around the existing governed execution boundary.
// Ownership remains with remote-delivery-claim-store + remote-delivery-recovery.
// A claim is never deleted or auto-reclaimed here. Any uncertain post-claim failure
// therefore blocks blind replay and requires correlated recovery evidence.

import { assessRemoteDeliveryClaimRecovery } from './remote-delivery-recovery.mjs';

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} is required`);
  return value;
}

function requireText(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function codedError(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  return error;
}

function classifyExistingClaim({ claim, task, hostId, assessRecovery, recoveryOptions }) {
  if (claim.request_id !== task.request_id || claim.host_id !== hostId) {
    throw codedError('GOVERNED_EXECUTION_CLAIM_CORRELATION_MISMATCH', {
      delivery_id: task.delivery_id,
      expected_request_id: task.request_id,
      actual_request_id: claim.request_id,
      expected_host_id: hostId,
      actual_host_id: claim.host_id,
    });
  }
  const recovery = assessRecovery({ claim, ...(recoveryOptions ?? {}) });
  if (recovery.recovery_required === true) {
    throw codedError('GOVERNED_EXECUTION_RECOVERY_REQUIRED', recovery);
  }
  throw codedError('GOVERNED_EXECUTION_DUPLICATE_DELIVERY', recovery);
}

export function createGovernedExecutionClaimGuard({
  boundary,
  claims,
  hostId,
  assessRecovery = assessRemoteDeliveryClaimRecovery,
  recoveryOptions = null,
} = {}) {
  requireObject(boundary, 'boundary');
  if (typeof boundary.execute !== 'function') throw new TypeError('boundary.execute is required');
  requireObject(claims, 'claims');
  if (typeof claims.get !== 'function' || typeof claims.claim !== 'function') {
    throw new TypeError('claims.get and claims.claim are required');
  }
  const normalizedHostId = requireText(hostId, 'hostId');
  if (typeof assessRecovery !== 'function') throw new TypeError('assessRecovery is required');

  return Object.freeze({
    async execute({ actorContext, task, invoke, ...boundaryOptions } = {}) {
      requireObject(actorContext, 'actorContext');
      requireObject(task, 'task');
      const deliveryId = requireText(task.delivery_id, 'task.delivery_id');
      const requestId = requireText(task.request_id, 'task.request_id');
      if (typeof invoke !== 'function') throw new TypeError('invoke is required');

      const existing = await claims.get(deliveryId);
      if (existing) {
        classifyExistingClaim({
          claim: existing,
          task,
          hostId: normalizedHostId,
          assessRecovery,
          recoveryOptions,
        });
      }

      const claimResult = await claims.claim({
        deliveryId,
        requestId,
        hostId: normalizedHostId,
      });
      if (claimResult.claimed !== true) {
        if (claimResult.disposition === 'CLAIM_CORRELATION_MISMATCH') {
          throw codedError('GOVERNED_EXECUTION_CLAIM_CORRELATION_MISMATCH', claimResult.record);
        }
        classifyExistingClaim({
          claim: claimResult.record,
          task,
          hostId: normalizedHostId,
          assessRecovery,
          recoveryOptions,
        });
      }

      try {
        return await boundary.execute({ actorContext, task, invoke, ...boundaryOptions });
      } catch (error) {
        // Retain the durable claim. The caller receives explicit uncertainty metadata;
        // a later attempt cannot blindly execute again.
        error.delivery_claim = claimResult.record;
        error.claim_retained = true;
        error.replay_safe_to_invoke = false;
        throw error;
      }
    },
  });
}
