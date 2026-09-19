// Family Safety Check evidence contract.
// This module reports evidence state only. It does not inspect, remediate,
// elevate privileges, or claim that a device is globally safe.

export const FAMILY_SAFETY_FINDING_STATUSES = Object.freeze([
  'VERIFIED',
  'NEEDS_ATTENTION',
  'BLOCKED',
  'UNKNOWN',
]);

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function normalizeTimestamp(value) {
  if (value == null) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new TypeError('observedAt must be an ISO-compatible timestamp');
  return new Date(time).toISOString();
}

export function createFamilySafetyFinding({
  checkId,
  status,
  observedAt = null,
  evidenceSource = null,
  detail = null,
} = {}) {
  checkId = requiredString(checkId, 'checkId');
  status = requiredString(status, 'status').toUpperCase();
  if (!FAMILY_SAFETY_FINDING_STATUSES.includes(status)) {
    const error = new Error(`unsupported family safety finding status: ${status}`);
    error.code = 'FAMILY_SAFETY_STATUS_INVALID';
    throw error;
  }

  if (status === 'VERIFIED' || status === 'NEEDS_ATTENTION') {
    requiredString(evidenceSource, 'evidenceSource');
    if (!observedAt) throw new TypeError('observedAt is required for evidence-backed findings');
  }

  return Object.freeze({
    checkId,
    status,
    observedAt: normalizeTimestamp(observedAt),
    evidenceSource,
    detail,
  });
}

export function summarizeFamilySafetyCheck({
  findings = [],
  requiredCheckIds = [],
  now = new Date().toISOString(),
  maxEvidenceAgeMs = 24 * 60 * 60 * 1000,
} = {}) {
  if (!Array.isArray(findings)) throw new TypeError('findings must be an array');
  if (!Array.isArray(requiredCheckIds)) throw new TypeError('requiredCheckIds must be an array');
  if (!Number.isFinite(maxEvidenceAgeMs) || maxEvidenceAgeMs < 0) {
    throw new TypeError('maxEvidenceAgeMs must be a non-negative finite number');
  }

  const nowMs = Date.parse(now);
  if (!Number.isFinite(nowMs)) throw new TypeError('now must be an ISO-compatible timestamp');

  const required = [...new Set(requiredCheckIds.map((id) => requiredString(id, 'requiredCheckId')))];
  const byId = new Map();
  for (const finding of findings) {
    if (!finding || typeof finding !== 'object') throw new TypeError('findings must contain objects');
    const normalized = createFamilySafetyFinding(finding);
    if (byId.has(normalized.checkId)) {
      const error = new Error(`duplicate family safety finding: ${normalized.checkId}`);
      error.code = 'FAMILY_SAFETY_DUPLICATE_FINDING';
      throw error;
    }
    byId.set(normalized.checkId, normalized);
  }

  const evaluated = required.map((checkId) => {
    const finding = byId.get(checkId);
    if (!finding) {
      return Object.freeze({ checkId, status: 'UNKNOWN', reason: 'MISSING_REQUIRED_CHECK' });
    }

    if (finding.status === 'VERIFIED' || finding.status === 'NEEDS_ATTENTION') {
      const observedMs = Date.parse(finding.observedAt);
      if (!Number.isFinite(observedMs) || observedMs > nowMs || nowMs - observedMs > maxEvidenceAgeMs) {
        return Object.freeze({ checkId, status: 'UNKNOWN', reason: 'STALE_OR_INVALID_EVIDENCE' });
      }
    }

    return Object.freeze({ ...finding, reason: null });
  });

  const needsAttention = evaluated.filter((item) => item.status === 'NEEDS_ATTENTION');
  const blocked = evaluated.filter((item) => item.status === 'BLOCKED');
  const unknown = evaluated.filter((item) => item.status === 'UNKNOWN');
  const verified = evaluated.filter((item) => item.status === 'VERIFIED');

  let overallStatus = 'CHECKS_PASSED';
  if (needsAttention.length > 0) overallStatus = 'PARENT_ACTION_REQUIRED';
  else if (blocked.length > 0 || unknown.length > 0) overallStatus = 'UNKNOWN';

  return Object.freeze({
    overallStatus,
    assessedCheckCount: evaluated.length,
    verifiedCheckIds: Object.freeze(verified.map((item) => item.checkId)),
    needsAttentionCheckIds: Object.freeze(needsAttention.map((item) => item.checkId)),
    blockedCheckIds: Object.freeze(blocked.map((item) => item.checkId)),
    unknownCheckIds: Object.freeze(unknown.map((item) => item.checkId)),
    findings: Object.freeze(evaluated),
    safeClaimPermitted: false,
  });
}
