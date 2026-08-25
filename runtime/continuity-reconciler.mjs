// CORE-003: minimal lifecycle reconciliation primitive.
// Repository lifecycle state remains authoritative; historical records are preserved.

export function reconcileLifecycle({ recordedStatus, authoritativeStatus }) {
  if (!recordedStatus || !authoritativeStatus) throw new TypeError('both statuses are required');
  const conflict = recordedStatus !== authoritativeStatus;
  return Object.freeze({
    conflict,
    recordedStatus,
    authoritativeStatus,
    resolution: conflict ? 'AUTHORITATIVE_STATE_WINS_HISTORICAL_RECORD_PRESERVED' : 'NO_CONFLICT',
  });
}
