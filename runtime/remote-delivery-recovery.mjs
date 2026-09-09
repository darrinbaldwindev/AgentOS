// Fail-closed recovery assessment for durable remote delivery claims.
// This module never steals or rewrites a claim. It only classifies whether the
// existing claim is still active or requires explicit recovery handling.

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

export function assessRemoteDeliveryClaimRecovery({
  claim,
  now = () => new Date(),
  staleAfterMs = 15 * 60 * 1000,
} = {}) {
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) throw new TypeError('claim is required');
  const deliveryId = requiredString(claim.delivery_id, 'claim.delivery_id');
  const requestId = requiredString(claim.request_id, 'claim.request_id');
  const hostId = requiredString(claim.host_id, 'claim.host_id');
  const state = requiredString(claim.state, 'claim.state');
  const claimedAt = requiredString(claim.claimed_at, 'claim.claimed_at');

  if (state !== 'CLAIMED') throw new Error('REMOTE_CLAIM_STATE_UNSUPPORTED');
  if (!Number.isFinite(staleAfterMs) || staleAfterMs <= 0) throw new TypeError('staleAfterMs must be > 0');

  const claimedMs = Date.parse(claimedAt);
  if (!Number.isFinite(claimedMs)) throw new Error('REMOTE_CLAIM_TIMESTAMP_INVALID');
  const ageMs = now().getTime() - claimedMs;
  if (ageMs < -60_000) throw new Error('REMOTE_CLAIM_TIMESTAMP_IN_FUTURE');

  if (ageMs <= staleAfterMs) {
    return Object.freeze({
      delivery_id: deliveryId,
      request_id: requestId,
      host_id: hostId,
      disposition: 'ACTIVE_CLAIM',
      reclaim_allowed: false,
      recovery_required: false,
      age_ms: Math.max(0, ageMs),
    });
  }

  return Object.freeze({
    delivery_id: deliveryId,
    request_id: requestId,
    host_id: hostId,
    disposition: 'RECOVERY_REQUIRED',
    reclaim_allowed: false,
    recovery_required: true,
    age_ms: ageMs,
    reason: 'STALE_CLAIM_REQUIRES_CORRELATED_RECOVERY_EVIDENCE',
  });
}
