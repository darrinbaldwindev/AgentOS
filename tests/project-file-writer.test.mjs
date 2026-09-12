import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const task = Object.freeze({ project_id: 'agentos', mission_id: 'mission-level2-fixture', task_id: 'task-project-file-write', worker_id: 'windows-worker-fixture' });

function persistenceHarness({ failReceiptCount = 0 } = {}) {
  const artifacts = new Map();
  let remainingReceiptFailures = failReceiptCount;
  return {
    artifacts,
    api: {
      get: async (type, id) => type === 'artifact' ? artifacts.get(id) ?? null : null,
      create: async (type, input) => {
        if (type !== 'artifact') throw new Error('unexpected type');
        if (input.artifact_kind === 'project.file.write.receipt' && remainingReceiptFailures > 0) {
          remainingReceiptFailures -= 1;
          throw new Error('receipt store failed');
        }
        if (artifacts.has(input.id)) throw new Error('duplicate');
        artifacts.set(input.id, structuredClone(input));
        return structuredClone(input);
      },
    },
  };
}

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-level2-write-'));
  return { root, cleanup: () => rm(root, { recursive: true, force: true }) };
}

function twoCallLockBarrier() {
  let arrivals = 0;
  let releaseFirst;
  let releaseSecond;
  const firstGate = new Promise((resolve) => { releaseFirst = resolve; });
  const secondGate = new Promise((resolve) => { releaseSecond = resolve; });
  return {
    releaseSecond: () => releaseSecond(),
    hook: async () => {
      arrivals += 1;
      if (arrivals === 1) {
        await firstGate;
        return;
      }
      if (arrivals === 2) {
        releaseFirst();
        await secondGate;
      }
    },
  };
}

function artifactByKind(artifacts, kind) {
  return [...artifacts.values()].find((artifact) => artifact.artifact_kind === kind);
}

test('creates a bounded file and records prepared intent plus exact correlated mutation receipt', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const target = path.join(f.root, 'fixture.txt');
    const result = await writer.execute({ task, targetPath: target, content: 'hello level2\n', idempotencyKey: 'idem-create-1' });
    assert.equal(result.success, true);
    assert.equal(result.replayed, false);
    assert.equal(result.recovered, false);
    assert.equal(await readFile(target, 'utf8'), 'hello level2\n');
    const receipt = p.artifacts.get(result.receipt_id);
    const prepared = artifactByKind(p.artifacts, 'project.file.write.prepared');
    assert.ok(prepared);
    assert.equal(receipt.project_id, task.project_id);
    assert.equal(receipt.mission_id, task.mission_id);
    assert.equal(receipt.task_id, task.task_id);
    assert.equal(receipt.worker_id, task.worker_id);
    assert.equal(receipt.postimage_sha256, hash(Buffer.from('hello level2\n')));
    assert.equal(receipt.prepared_artifact_id, prepared.id);
    assert.equal(receipt.result, 'MUTATED_VERIFIED');
  } finally { await f.cleanup(); }
});

test('same idempotency key and same intent replays without a second mutation', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const target = path.join(f.root, 'fixture.txt');
    const args = { task, targetPath: target, content: 'same\n', idempotencyKey: 'idem-replay-1' };
    const first = await writer.execute(args);
    const second = await writer.execute(args);
    assert.equal(second.receipt_id, first.receipt_id);
    assert.equal(second.replayed, true);
    assert.equal(second.recovered, false);
    assert.equal(p.artifacts.size, 2);
  } finally { await f.cleanup(); }
});

test('concurrent same-key same-intent duplicate resolves as one mutation plus deterministic replay', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const barrier = twoCallLockBarrier();
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api, hooks: { beforeLock: barrier.hook } });
    const target = path.join(f.root, 'fixture.txt');
    const args = { task, targetPath: target, content: 'concurrent-same\n', idempotencyKey: 'idem-concurrent-same' };
    const firstPromise = writer.execute(args).then((result) => { barrier.releaseSecond(); return result; });
    const secondPromise = writer.execute(args);
    const [first, second] = await Promise.all([firstPromise, secondPromise]);
    assert.equal(first.replayed, false);
    assert.equal(second.replayed, true);
    assert.equal(second.receipt_id, first.receipt_id);
    assert.equal(await readFile(target, 'utf8'), 'concurrent-same\n');
  } finally { await f.cleanup(); }
});

test('same idempotency key with different intent fails closed', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const target = path.join(f.root, 'fixture.txt');
    await writer.execute({ task, targetPath: target, content: 'one\n', idempotencyKey: 'idem-conflict' });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'two\n', expectedPreimageSha256: hash(Buffer.from('one\n')), idempotencyKey: 'idem-conflict' }),
      (error) => error.code === 'PROJECT_FILE_IDEMPOTENCY_CONFLICT'
    );
    assert.equal(await readFile(target, 'utf8'), 'one\n');
  } finally { await f.cleanup(); }
});

test('concurrent same-key different-intent duplicate fails closed under the target lock', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const barrier = twoCallLockBarrier();
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api, hooks: { beforeLock: barrier.hook } });
    const target = path.join(f.root, 'fixture.txt');
    const firstPromise = writer.execute({ task, targetPath: target, content: 'winner\n', idempotencyKey: 'idem-concurrent-conflict' }).then((result) => { barrier.releaseSecond(); return result; });
    const secondPromise = writer.execute({ task, targetPath: target, content: 'conflict\n', idempotencyKey: 'idem-concurrent-conflict' });
    const first = await firstPromise;
    assert.equal(first.replayed, false);
    await assert.rejects(secondPromise, (error) => error.code === 'PROJECT_FILE_IDEMPOTENCY_CONFLICT');
    assert.equal(await readFile(target, 'utf8'), 'winner\n');
  } finally { await f.cleanup(); }
});

test('overwrite requires exact preimage identity', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    await writeFile(target, 'old\n');
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'new\n', expectedPreimageSha256: hash(Buffer.from('stale\n')), idempotencyKey: 'idem-stale' }),
      (error) => error.code === 'PROJECT_FILE_VERSION_CONFLICT'
    );
    assert.equal(await readFile(target, 'utf8'), 'old\n');
  } finally { await f.cleanup(); }
});

test('stale preimage introduced after inspection but before lock fails closed under the lock', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    await writeFile(target, 'old\n');
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforeLock: async () => { await writeFile(target, 'raced\n'); } },
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'new\n', expectedPreimageSha256: hash(Buffer.from('old\n')), idempotencyKey: 'idem-stale-between-observation-and-lock' }),
      (error) => error.code === 'PROJECT_FILE_VERSION_CONFLICT' && error.actual_preimage_sha256 === hash(Buffer.from('raced\n'))
    );
    assert.equal(await readFile(target, 'utf8'), 'raced\n');
  } finally { await f.cleanup(); }
});

test('existing lock is recovery-required and never stolen', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    await mkdir(`${target}.agentos-write-lock`);
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'blocked\n', idempotencyKey: 'idem-lock' }),
      (error) => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED'
    );
  } finally { await f.cleanup(); }
});

test('crash before publication leaves target unchanged and requires explicit recovery', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    await writeFile(target, 'old\n');
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforePublish: async () => { throw new Error('simulated crash before publish'); } },
    });
    const args = { task, targetPath: target, content: 'new\n', expectedPreimageSha256: hash(Buffer.from('old\n')), idempotencyKey: 'idem-before-crash' };
    await assert.rejects(writer.execute(args), /simulated crash/);
    assert.equal(await readFile(target, 'utf8'), 'old\n');
    assert.ok(artifactByKind(p.artifacts, 'project.file.write.prepared'));
    await assert.rejects(writer.execute(args), (error) => error.code === 'PROJECT_FILE_RECOVERY_STATE_MISMATCH' && error.recovery_required === true);
  } finally { await f.cleanup(); }
});

test('crash after publication recovers exact prepared mutation without a second publish', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    let publishes = 0;
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: {
        beforePublish: async () => { publishes += 1; },
        afterPublish: async () => { throw new Error('simulated crash after publish'); },
      },
    });
    const args = { task, targetPath: target, content: 'published\n', idempotencyKey: 'idem-after-crash' };
    await assert.rejects(writer.execute(args), (error) => error.recovery_required === true);
    assert.equal(await readFile(target, 'utf8'), 'published\n');
    const recovered = await writer.execute(args);
    assert.equal(recovered.replayed, true);
    assert.equal(recovered.recovered, true);
    assert.equal(publishes, 1);
    assert.ok(p.artifacts.get(recovered.receipt_id));
  } finally { await f.cleanup(); }
});

test('receipt persistence failure recovers from prepared identity and finalizes receipt without a second mutation', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness({ failReceiptCount: 1 });
    const target = path.join(f.root, 'fixture.txt');
    let publishes = 0;
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api, hooks: { beforePublish: async () => { publishes += 1; } } });
    const args = { task, targetPath: target, content: 'published\n', idempotencyKey: 'idem-receipt-fail' };
    await assert.rejects(writer.execute(args), (error) => error.code === 'PROJECT_FILE_RECEIPT_PERSISTENCE_FAILED' && error.recovery_required === true);
    const recovered = await writer.execute(args);
    assert.equal(recovered.recovered, true);
    assert.equal(recovered.replayed, true);
    assert.equal(publishes, 1);
    assert.equal(await readFile(target, 'utf8'), 'published\n');
  } finally { await f.cleanup(); }
});

test('tampered postimage cannot be finalized from prepared recovery evidence', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { afterPublish: async () => { throw new Error('simulated crash after publish'); } },
    });
    const args = { task, targetPath: target, content: 'published\n', idempotencyKey: 'idem-tampered-recovery' };
    await assert.rejects(writer.execute(args));
    await writeFile(target, 'tampered\n');
    await assert.rejects(writer.execute(args), (error) => error.code === 'PROJECT_FILE_RECOVERY_STATE_MISMATCH' && error.recovery_required === true);
  } finally { await f.cleanup(); }
});

test('unrelated same-content replacement is rejected by prepared filesystem identity', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { afterPublish: async () => { throw new Error('simulated crash after publish'); } },
    });
    const args = { task, targetPath: target, content: 'published\n', idempotencyKey: 'idem-unrelated-replacement' };
    await assert.rejects(writer.execute(args));
    const replacement = path.join(f.root, 'replacement.tmp');
    await writeFile(replacement, 'published\n');
    await rename(replacement, target);
    await assert.rejects(writer.execute(args), (error) => error.code === 'PROJECT_FILE_RECOVERY_STATE_MISMATCH' && error.recovery_required === true);
  } finally { await f.cleanup(); }
});

test('same idempotency key with different intent conflicts even when only prepared recovery evidence exists', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { afterPublish: async () => { throw new Error('simulated crash after publish'); } },
    });
    await assert.rejects(writer.execute({ task, targetPath: target, content: 'one\n', idempotencyKey: 'idem-prepared-conflict' }));
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'two\n', idempotencyKey: 'idem-prepared-conflict' }),
      (error) => error.code === 'PROJECT_FILE_IDEMPOTENCY_CONFLICT'
    );
  } finally { await f.cleanup(); }
});

test('postimage without receipt or prepared evidence never self-certifies', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    await writeFile(target, 'already-there\n');
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'already-there\n', idempotencyKey: 'idem-no-evidence' }),
      (error) => error.code === 'PROJECT_FILE_RECONCILIATION_REQUIRED'
    );
  } finally { await f.cleanup(); }
});

test('receipt mismatch and correlation failure fail closed', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const first = await writer.execute({ task, targetPath: target, content: 'expected\n', idempotencyKey: 'idem-mismatch' });
    await writeFile(target, 'tampered\n');
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'expected\n', idempotencyKey: 'idem-mismatch' }),
      (error) => error.code === 'PROJECT_FILE_RECEIPT_MISMATCH'
    );
    assert.ok(first.receipt_id);
    await assert.rejects(
      writer.execute({ task: { ...task, mission_id: '' }, targetPath: path.join(f.root, 'bad.txt'), content: 'x', idempotencyKey: 'idem-bad-correlation' }),
      /task.mission_id is required/
    );
  } finally { await f.cleanup(); }
});

test('external writer mutation during beforePublish is rejected and external content is preserved', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    await writeFile(target, 'old
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforePublish: async () => { await writeFile(target, 'external
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'new
      (error) => error.code === 'PROJECT_FILE_EXTERNAL_MUTATION' && error.recovery_required === true
    );
    assert.equal(await readFile(target, 'utf8'), 'external
    const prepared = [...p.artifacts.values()].find((a) => a.artifact_kind === 'project.file.write.prepared');
    assert.ok(prepared);
    const receipt = [...p.artifacts.values()].find((a) => a.artifact_kind === 'project.file.write.receipt');
    assert.equal(receipt, undefined);
  } finally { await f.cleanup(); }
});

test('external file creation during beforePublish when target originally absent is rejected', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforePublish: async () => { await writeFile(target, 'external
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'new
      (error) => error.code === 'PROJECT_FILE_EXTERNAL_MUTATION' && error.recovery_required === true
    );
    assert.equal(await readFile(target, 'utf8'), 'external
    const prepared = [...p.artifacts.values()].find((a) => a.artifact_kind === 'project.file.write.prepared');
    assert.ok(prepared);
    const receipt = [...p.artifacts.values()].find((a) => a.artifact_kind === 'project.file.write.receipt');
    assert.equal(receipt, undefined);
  } finally { await f.cleanup(); }
});

test('external writer mutation during beforeRecoveryPublish is rejected and external content is preserved', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    await writeFile(target, 'old
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { afterPublish: async () => { throw new Error('simulated crash after publish'); } },
    });
    const args = { task, targetPath: target, content: 'new
    await assert.rejects(writer.execute(args));
    assert.equal(await readFile(target, 'utf8'), 'new
    const writerWithRecoveryHook = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforeRecoveryPublish: async () => { await writeFile(target, 'external
      reconcilePreparedWrite: async () => ({ status: 'RESUME', evidence_id: 'recovery-evidence-external' }),
    });
    await assert.rejects(
      writerWithRecoveryHook.execute(args),
      (error) => error.code === 'PROJECT_FILE_EXTERNAL_MUTATION' && error.recovery_required === true
    );
    assert.equal(await readFile(target, 'utf8'), 'external
    const prepared = [...p.artifacts.values()].find((a) => a.artifact_kind === 'project.file.write.prepared');
    assert.ok(prepared);
    const receipt = [...p.artifacts.values()].find((a) => a.artifact_kind === 'project.file.write.receipt');
    assert.equal(receipt, undefined);
  } finally { await f.cleanup(); }
});
