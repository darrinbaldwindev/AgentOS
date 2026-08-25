// CORE-003: explicit evidence classification for autonomous work.

const TYPES = new Set(['commit', 'test', 'ci', 'artifact', 'reconciliation']);

export function createEvidence({ type, source, status = 'verified', details = null }) {
  if (!TYPES.has(type)) throw new TypeError(`unsupported evidence type: ${type}`);
  if (!source) throw new TypeError('evidence source is required');
  if (!['verified', 'unverified', 'conflict'].includes(status)) throw new TypeError(`invalid evidence status: ${status}`);
  return Object.freeze({ type, source, status, details });
}

export function assessEvidence(evidence = []) {
  const items = evidence.map((item) => createEvidence(item));
  const hasConflict = items.some((item) => item.status === 'conflict');
  const hasUnverified = items.some((item) => item.status === 'unverified');
  const status = hasConflict ? 'CONFLICT' : hasUnverified ? 'UNVERIFIED' : 'VERIFIED';
  return Object.freeze({ status, evidence: Object.freeze(items) });
}
