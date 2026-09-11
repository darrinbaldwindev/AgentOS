// AGENTOS-LEVEL2-PROJECT-FILE-RECOVERY-GOVERNANCE-001
// Validation/composition only. Reuses canonical persistence/governance evidence and
// grants no recovery authority itself.

const DEFAULT_MAX_AGE_MS = 15 * 60 * 1000;
const AUTHORITY_KINDS = new Set([
  'authority.decision',
  'approval.receipt',
  'green.disposition',
  'prs.disposition',
]);

function fail(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, details);
  return error;
}

function required(value, name) {
  if (typeof value !== 'string' || value.length === 0) {
    throw fail('PROJECT_FILE_RECOVERY_DECISION_INVALID', { field: name });
  }
  return value;
}

function sameCorrelation(record, intent, intentHash) {
  return record.project_id === intent.project_id &&
    record.mission_id === intent.mission_id &&
    record.task_id === intent.task_id &&
    record.worker_id === intent.worker_id &&
    record.target_path === intent.path &&
    record.intent_hash === intentHash;
}

export function createProjectFileRecoveryGovernance({
  persistence,
  now = () => Date.now(),
  maxDecisionAgeMs = DEFAULT_MAX_AGE_MS,
} = {}) {
  if (!persistence || typeof persistence.get !== 'function') throw new TypeError('persistence.get is required');
  if (typeof now !== 'function') throw new TypeError('now must be a function');
  if (!Number.isInteger(maxDecisionAgeMs) || maxDecisionAgeMs < 1) {
    throw new TypeError('maxDecisionAgeMs must be a positive integer');
  }

  async function loadDecision(evidenceId, expected) {
    required(evidenceId, 'evidence_id');
    const record = await persistence.get('artifact', evidenceId);
    if (!record || record.artifact_kind !== 'project.file.write.recovery-decision') {
      throw fail('PROJECT_FILE_RECOVERY_EVIDENCE_UNKNOWN', { evidence_id: evidenceId });
    }
    if (record.status !== expected.status || record.decision_kind !== expected.kind) {
      throw fail('PROJECT_FILE_RECOVERY_DECISION_MISMATCH', { evidence_id: evidenceId });
    }

    const issued = Date.parse(record.issued_at);
    const expires = record.expires_at == null ? null : Date.parse(record.expires_at);
    const current = now();
    if (!Number.isFinite(issued) || issued > current || current - issued > maxDecisionAgeMs ||
        (record.expires_at != null && (!Number.isFinite(expires) || current > expires))) {
      throw fail('PROJECT_FILE_RECOVERY_DECISION_STALE', { evidence_id: evidenceId });
    }

    if (!sameCorrelation(record, expected.intent, expected.intentHash) ||
        record.idempotency_key_sha256 !== expected.idempotencyKeySha256) {
      throw fail('PROJECT_FILE_RECOVERY_CORRELATION_MISMATCH', { evidence_id: evidenceId });
    }
    if (expected.preparedId && record.prepared_id !== expected.preparedId) {
      throw fail('PROJECT_FILE_RECOVERY_CORRELATION_MISMATCH', { evidence_id: evidenceId });
    }
    if (expected.lockId && record.lock_id !== expected.lockId) {
      throw fail('PROJECT_FILE_RECOVERY_CORRELATION_MISMATCH', { evidence_id: evidenceId });
    }

    const authorityId = required(record.authority_artifact_id, 'authority_artifact_id');
    const authority = await persistence.get('artifact', authorityId);
    if (!authority || !AUTHORITY_KINDS.has(authority.artifact_kind)) {
      throw fail('PROJECT_FILE_RECOVERY_AUTHORITY_UNPROVEN', {
        evidence_id: evidenceId,
        authority_artifact_id: authorityId,
      });
    }
    if (!sameCorrelation(authority, expected.intent, expected.intentHash) ||
        authority.recovery_decision_id !== record.id ||
        authority.disposition !== 'ALLOW_RECOVERY') {
      throw fail('PROJECT_FILE_RECOVERY_AUTHORITY_MISMATCH', {
        evidence_id: evidenceId,
        authority_artifact_id: authorityId,
      });
    }
    return record;
  }

  function prepared({ evidenceId, intentHash, idempotencyKeySha256 }) {
    return async ({ prepared, intent }) => {
      await loadDecision(evidenceId, {
        status: 'RESUME',
        kind: 'PREPARED_WRITE',
        intent,
        intentHash,
        idempotencyKeySha256,
        preparedId: prepared.id,
      });
      return { status: 'RESUME', evidence_id: evidenceId };
    };
  }

  function abandonedLock({ evidenceId, intentHash, idempotencyKeySha256 }) {
    return async ({ owner, intent }) => {
      await loadDecision(evidenceId, {
        status: 'ABANDONED',
        kind: 'ABANDONED_LOCK',
        intent,
        intentHash,
        idempotencyKeySha256,
        lockId: owner?.lock_id,
      });
      return { status: 'ABANDONED', evidence_id: evidenceId };
    };
  }

  return Object.freeze({ loadDecision, prepared, abandonedLock });
}
