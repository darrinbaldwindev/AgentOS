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
  if (typeof value !== 'string' || value.length === 0) throw fail('PROJECT_FILE_RECOVERY_DECISION_INVALID', { field: name });
  return value;
}

function exactCorrelation(record, intent) {
  return record.project_id === intent.project_id &&
    record.mission_id === intent.mission_id &&
    record.task_id === intent.task_id &&
    record.worker_id === intent.worker_id &&
    record.target_path === intent.path &&
    record.intent_hash === record.expected_intent_hash;
}

export function createProjectFileRecoveryGovernance({ persistence, now = () => Date.now(), maxDecisionAgeMs = DEFAULT_MAX_AGE_MS } = {}) {
  if (!persistence || typeof persistence.get !== 'function') throw new TypeError('persistence.get is required');
  if (typeof now !== 'function') throw new TypeError('now must be a function');
  if (!Number.isInteger(maxDecisionAgeMs) || maxDecisionAgeMs < 1) throw new TypeError('maxDecisionAgeMs must be a positive integer');

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
    const age = now() - issued;
    if (!Number.isFinite(issued) || age < 0 || age > maxDecisionAgeMs) {
      throw fail('PROJECT_FILE_RECOVERY_DECISION_STALE', { evidence_id: evidenceId });
    }
    if (!exactCorrelation(record, expected.intent) || record.expected_intent_hash !== expected.intentHash) {
      throw fail('PROJECT_FILE_RECOVERY_CORRELATION_MISMATCH', { evidence_id: evidenceId });
    }
    if (record.idempotency_key_sha256 !== expected.idempotencyKeySha256) {
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
      throw fail('PROJECT_FILE_RECOVERY_AUTHORITY_UNPROVEN', { evidence_id: evidenceId, authority_artifact_id: authorityId });
    }
    if (authority.project_id !== expected.intent.project_id || authority.mission_id !== expected.intent.mission_id ||
        authority.task_id !== expected.intent.task_id || authority.target_path !== expected.intent.path ||
        authority.intent_hash !== expected.intentHash || authority.recovery_decision_id !== record.id) {
      throw fail('PROJECT_FILE_RECOVERY_AUTHORITY_MISMATCH', { evidence_id: evidenceId, authority_artifact_id: authorityId });
    }
    return record;
  }

  function prepared({ intentHash, idempotencyKeySha256 }) {
    return async ({ prepared, intent }) => {
      const evidenceId = required(prepared.recovery_decision_id, 'prepared.recovery_decision_id');
      await loadDecision(evidenceId, {
        status: 'RESUME', kind: 'PREPARED_WRITE', intent, intentHash,
        idempotencyKeySha256, preparedId: prepared.id,
      });
      return { status: 'RESUME', evidence_id: evidenceId };
    };
  }

  function abandonedLock({ intentHash, idempotencyKeySha256, evidenceId }) {
    return async ({ owner, intent }) => {
      const id = required(evidenceId, 'evidence_id');
      await loadDecision(id, {
        status: 'ABANDONED', kind: 'ABANDONED_LOCK', intent, intentHash,
        idempotencyKeySha256, lockId: owner?.lock_id,
      });
      return { status: 'ABANDONED', evidence_id: id };
    };
  }

  return Object.freeze({ loadDecision, prepared, abandonedLock });
}
