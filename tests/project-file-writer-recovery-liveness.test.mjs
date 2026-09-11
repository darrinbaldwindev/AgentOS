import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const task = Object.freeze({ project_id: 'agentos', mission_id: 'mission-level2-recovery', task_id: 'task-project-file-write-recovery', worker_id: 'windows-worker-fixture' });

function persistenceHarness() {
  const artifacts = new Map();
  return {
    artifacts,
    api: {
      get: async (type, id) => type === 'artifact' ? artifacts.get(id) ?? null : null,
      create: async (type, input) => {
        if (type !== 'artifact') throw new Error('unexpected type');
        if (artifacts.has(input.id)) throw new Error('duplicate');
        artifacts.set(input.id, structuredClone(input));
        return structuredClone(input);
      },
    },
  };
}

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-level2-recovery-'));
  return { root, cleanup: () => rm(root, { recursive: true, force: true }) };
}

function lockHold() {
  let release;
  let acquired;
  const releaseGate = new Promise((resolve) => { release = resolve; });
  const acquiredGate = new Promise((resolve) => { acquired = resolve; });
  return {
    acquired: acquiredGate,
    release: () => release(),
    hook: async () => { acquired(); await releaseGate; },
  };
}

test('prepared-before-publish interruption resumes exactly once under the target lock', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    await writeFile(target, 'old\n');
    const args = { task, targetPath: target, content: 'new\n', expectedPreimageSha256: hash(Buffer.from('old\n')), idempotencyKey: 'idem-prepublish-resume' };
    const interrupted = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforePublish: async () => { throw new Error('simulated interruption before publish'); } },
    });
    await assert.rejects(interrupted.execute(args), (error) => error.recovery_required === true);
    assert.equal(await readFile(target, 'utf8'), 'old\n');

    const resumed = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const result = await resumed.execute(args);
    assert.equal(result.success, true);
    assert.equal(result.replayed, true);
    assert.equal(result.recovered, true);
    assert.equal(await readFile(target, 'utf8'), 'new\n');

    const replay = await resumed.execute(args);
    assert.equal(replay.replayed, true);
    assert.equal(await readFile(target, 'utf8'), 'new\n');
  } finally { await f.cleanup(); }
});

test('actual same-key same-intent lock contention is explicit LIVE_CONTENTION then deterministic replay', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const hold = lockHold();
    const target = path.join(f.root, 'fixture.txt');
    const args = { task, targetPath: target, content: 'winner\n', idempotencyKey: 'idem-live-same' };
    const firstWriter = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api, hooks: { afterLockAcquired: hold.hook } });
    const secondWriter = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const firstPromise = firstWriter.execute(args);
    await hold.acquired;
    await assert.rejects(secondWriter.execute(args), (error) => error.code === 'PROJECT_FILE_LIVE_CONTENTION' && error.retryable === true && error.recovery_required === false);
    hold.release();
    const first = await firstPromise;
    assert.equal(first.replayed, false);
    const replay = await secondWriter.execute(args);
    assert.equal(replay.replayed, true);
    assert.equal(replay.receipt_id, first.receipt_id);
  } finally { await f.cleanup(); }
});

test('same-key different-intent contention remains zero-mutation for loser and resolves to idempotency conflict', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const hold = lockHold();
    const target = path.join(f.root, 'fixture.txt');
    const winnerArgs = { task, targetPath: target, content: 'winner\n', idempotencyKey: 'idem-live-conflict' };
    const loserArgs = { task, targetPath: target, content: 'loser\n', idempotencyKey: 'idem-live-conflict' };
    const firstWriter = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api, hooks: { afterLockAcquired: hold.hook } });
    const secondWriter = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const firstPromise = firstWriter.execute(winnerArgs);
    await hold.acquired;
    await assert.rejects(secondWriter.execute(loserArgs), (error) => error.code === 'PROJECT_FILE_LIVE_CONTENTION');
    hold.release();
    await firstPromise;
    await assert.rejects(secondWriter.execute(loserArgs), (error) => error.code === 'PROJECT_FILE_IDEMPOTENCY_CONFLICT');
    assert.equal(await readFile(target, 'utf8'), 'winner\n');
  } finally { await f.cleanup(); }
});

test('different keys targeting the same file are serialized by explicit live contention', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const hold = lockHold();
    const target = path.join(f.root, 'fixture.txt');
    const firstWriter = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api, hooks: { afterLockAcquired: hold.hook } });
    const secondWriter = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const firstPromise = firstWriter.execute({ task, targetPath: target, content: 'first\n', idempotencyKey: 'idem-key-a' });
    await hold.acquired;
    await assert.rejects(
      secondWriter.execute({ task, targetPath: target, content: 'second\n', idempotencyKey: 'idem-key-b' }),
      (error) => error.code === 'PROJECT_FILE_LIVE_CONTENTION'
    );
    hold.release();
    await firstPromise;
    assert.equal(await readFile(target, 'utf8'), 'first\n');
  } finally { await f.cleanup(); }
});

test('abandoned lock is removed only with explicit governed reconciliation evidence', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    const lock = `${target}.agentos-write-lock`;
    await mkdir(lock);
    await writeFile(path.join(lock, 'owner.json'), JSON.stringify({
      lock_id: 'abandoned-lock-id',
      pid: 999999,
      project_id: task.project_id,
      mission_id: task.mission_id,
      task_id: task.task_id,
      worker_id: 'dead-worker',
      target_path: target,
      intent_hash: 'old-intent',
      idempotency_key_sha256: 'old-key',
      acquired_at: '2026-09-11T00:00:00.000Z',
    }));

    let reconciled = false;
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      reconcileAbandonedLock: async ({ owner }) => {
        assert.equal(owner.lock_id, 'abandoned-lock-id');
        reconciled = true;
        return { status: 'ABANDONED', evidence_id: 'green-lock-recovery-fixture-001' };
      },
    });
    const result = await writer.execute({ task, targetPath: target, content: 'recovered\n', idempotencyKey: 'idem-abandoned-recovery' });
    assert.equal(reconciled, true);
    assert.equal(result.success, true);
    assert.equal(await readFile(target, 'utf8'), 'recovered\n');
  } finally { await f.cleanup(); }
});

test('ambiguous foreign lock remains fail-closed when reconciliation cannot prove abandonment', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    const lock = `${target}.agentos-write-lock`;
    await mkdir(lock);
    await writeFile(path.join(lock, 'owner.json'), JSON.stringify({ lock_id: 'ambiguous-lock-id', pid: 888888, intent_hash: 'unknown', worker_id: 'unknown' }));
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      reconcileAbandonedLock: async () => ({ status: 'UNKNOWN' }),
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'blocked\n', idempotencyKey: 'idem-ambiguous-lock' }),
      (error) => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED' && error.recovery_required === true
    );
  } finally { await f.cleanup(); }
});
