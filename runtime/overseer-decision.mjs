// CORE-003: evidence-aware Overseer decision gate.

const ALLOWED = new Set(['VERIFIED', 'UNVERIFIED', 'CONFLICT']);

export function decideFromEvidence({ evidenceStatus, requestedAction = 'continue' }) {
  if (!ALLOWED.has(evidenceStatus)) throw new TypeError(`invalid evidence status: ${evidenceStatus}`);

  if (evidenceStatus === 'CONFLICT') {
    return Object.freeze({ decision: 'HALT_AND_RECONCILE', requestedAction, reason: 'authoritative state conflicts with recorded evidence' });
  }

  if (evidenceStatus === 'UNVERIFIED') {
    return Object.freeze({ decision: 'REQUIRE_VERIFICATION', requestedAction, reason: 'completion claim lacks sufficient evidence' });
  }

  return Object.freeze({ decision: 'ALLOW', requestedAction, reason: 'required evidence is verified' });
}
