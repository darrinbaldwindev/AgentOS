import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectFileRecoveryGovernance } from '../runtime/project-file-recovery-governance.mjs';

const NOW = Date.parse('2026-09-11T12:00:00.000Z');
const intent = Object.freeze({
  project_id: 'agentos', mission_id: 'mission-recovery', task_id: 'task-recovery',
  worker_id: 'windows-worker-fixture', path: '/fixture/target.txt',
});
const intentHash = 'intent-hash-001';
const keyHash = 'key-hash-001';

function harness(records = []) {
  const artifacts = new Map(records.map((record) => [record.id, structuredClone(record)]));
  return { artifacts, api: { get: async (type, id) => type === 'artifact' ? artifacts.get(id) ?? null : null } };
}

function authority(overrides = {}) {
  return {
    id: 'authority-1', artifact_kind: 'approval.receipt', disposition: 'ALLOW_RECOVERY',
    project_id: intent.project_id, mission_id: intent.mission_id, task_id: intent.task_id,
    worker_id: intent.worker_id, target_path: intent.path, intent_hash: intentHash,
    recovery_decision_id: 'decision-1', ...overrides,
  };
}

function decision(overrides = {}) {
  return {
    id: 'decision-1', artifact_kind: 'project.file.write.recovery-decision',
    status: 'RESUME', decision_kind: 'PREPARED_WRITE', issued_at: '2026-09-11T11:59:00.000Z',
    expires_at: '2026-09-11T12:05:00.000Z', authority_artifact_id: 'authority-1',
    project_id: intent.project_id, mission_id: intent.mission_id, task_id: intent.task_id,
    worker_id: intent.worker_id, target_path: intent.path, intent_hash: intentHash,
    idempotency_key_sha256: keyHash, prepared_id: 'prepared-1', ...overrides,
  };
}

const expected = {
  status: 'RESUME', kind: 'PREPARED_WRITE', intent, intentHash,
  idempotencyKeySha256: keyHash, preparedId: 'prepared-1',
};

test('accepts fresh exact durable recovery decision backed by correlated authority artifact', async () => {
  const p = harness([authority(), decision()]);
  const governance = createProjectFileRecoveryGovernance({ persistence: p.api, now: () => NOW });
  const loaded = await governance.loadDecision('decision-1', expected);
  assert.equal(loaded.id, 'decision-1');
});

test('unknown or fabricated recovery evidence fails closed', async () => {
  const p = harness([authority()]);
  const governance = createProjectFileRecoveryGovernance({ persistence: p.api, now: () => NOW });
  await assert.rejects(governance.loadDecision('fake-decision', expected), (error) => error.code === 'PROJECT_FILE_RECOVERY_EVIDENCE_UNKNOWN');
});

test('stale recovery decision fails closed', async () => {
  const p = harness([authority(), decision({ issued_at: '2026-09-11T11:30:00.000Z', expires_at: '2026-09-11T11:45:00.000Z' })]);
  const governance = createProjectFileRecoveryGovernance({ persistence: p.api, now: () => NOW });
  await assert.rejects(governance.loadDecision('decision-1', expected), (error) => error.code === 'PROJECT_FILE_RECOVERY_DECISION_STALE');
});

test('wrong mission worker target intent or prepared id fails closed', async () => {
  for (const change of [
    { mission_id: 'other-mission' }, { worker_id: 'other-worker' }, { target_path: '/other.txt' },
    { intent_hash: 'other-intent' }, { prepared_id: 'other-prepared' }, { idempotency_key_sha256: 'other-key' },
  ]) {
    const p = harness([authority(), decision(change)]);
    const governance = createProjectFileRecoveryGovernance({ persistence: p.api, now: () => NOW });
    await assert.rejects(governance.loadDecision('decision-1', expected), (error) => error.code === 'PROJECT_FILE_RECOVERY_CORRELATION_MISMATCH');
  }
});

test('authority artifact must be allowed, exact-correlated and bind the same decision', async () => {
  for (const auth of [
    authority({ artifact_kind: 'untrusted.claim' }),
    authority({ disposition: 'DENY' }),
    authority({ recovery_decision_id: 'different-decision' }),
    authority({ task_id: 'other-task' }),
  ]) {
    const p = harness([auth, decision()]);
    const governance = createProjectFileRecoveryGovernance({ persistence: p.api, now: () => NOW });
    await assert.rejects(
      governance.loadDecision('decision-1', expected),
      (error) => ['PROJECT_FILE_RECOVERY_AUTHORITY_UNPROVEN', 'PROJECT_FILE_RECOVERY_AUTHORITY_MISMATCH'].includes(error.code)
    );
  }
});

test('decision replay under a different exact intent is rejected', async () => {
  const p = harness([authority(), decision()]);
  const governance = createProjectFileRecoveryGovernance({ persistence: p.api, now: () => NOW });
  await assert.rejects(
    governance.loadDecision('decision-1', { ...expected, intentHash: 'new-intent-hash' }),
    (error) => error.code === 'PROJECT_FILE_RECOVERY_CORRELATION_MISMATCH'
  );
});
