import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { spawnSync } from 'node:child_process';
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

test('published prepared recovery cannot finalize success while another writer owns target', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness({ failReceiptCount: 1 });
    const target = path.join(f.root, 'recovery.txt');
    const args = { task, targetPath: target, content: 'published', idempotencyKey: 'recovery-held-lock' };
    const first = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    await assert.rejects(first.execute(args), { code: 'PROJECT_FILE_RECEIPT_PERSISTENCE_FAILED' });
    let entered;
    let release;
    const enteredGate = new Promise(resolve => { entered = resolve; });
    const releaseGate = new Promise(resolve => { release = resolve; });
    const holder = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api,
      hooks: { afterLockAcquired: async () => { entered(); await releaseGate; } } });
    const holding = holder.execute({ ...args, content: 'successor', expectedPreimageSha256: hash('published'), idempotencyKey: 'successor' });
    // Attach the handler before any assertion can fail and ensure the holder is released.
    const settled = holding.then(value => ({ value }), error => ({ error }));
    try {
      await enteredGate;
      await assert.rejects(first.execute(args), { code: 'PROJECT_FILE_LIVE_CONTENTION' });
      assert.equal(artifactByKind(p.artifacts, 'project.file.write.receipt'), undefined);
      assert.equal(await readFile(target, 'utf8'), 'published');
    } finally { release(); await settled; }
    assert.equal((await settled).error, undefined);
  } finally { await f.cleanup(); }
});

test('ownership metadata loss after publish forbids a success receipt', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'ownership.txt');
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api,
      hooks: { afterPublish: async () => {
        const lock = `${target}.agentos-write-lock`;
        await writeFile(process.platform === 'win32' ? lock : path.join(lock, 'owner.json'), '{}');
      } } });
    await assert.rejects(writer.execute({ task, targetPath: target, content: 'published', idempotencyKey: 'lost-metadata' }),
      error => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED' && error.recovery_required);
    assert.equal(await readFile(target, 'utf8'), 'published');
    assert.equal(artifactByKind(p.artifacts, 'project.file.write.receipt'), undefined);
    assert.ok(artifactByKind(p.artifacts, 'project.file.write.prepared'));
  } finally { await f.cleanup(); }
});

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
    await writeFile(target, 'old');
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforePublish: async () => { await writeFile(target, 'external'); } },
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'new', expectedPreimageSha256: hash(Buffer.from('old')), idempotencyKey: 'idem-external-mutation' }),
      (error) => error.code === 'PROJECT_FILE_EXTERNAL_MUTATION' && error.recovery_required === true
    );
    assert.equal(await readFile(target, 'utf8'), 'external');
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
      hooks: { beforePublish: async () => { await writeFile(target, 'external'); } },
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'new', idempotencyKey: 'idem-external-create' }),
      (error) => error.code === 'PROJECT_FILE_EXTERNAL_MUTATION' && error.recovery_required === true
    );
    assert.equal(await readFile(target, 'utf8'), 'external');
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
    await writeFile(target, 'old');
    const writerWithCrash = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforePublish: async () => { throw new Error('simulated crash before publish'); } },
    });
    const args = { task, targetPath: target, content: 'new', expectedPreimageSha256: hash(Buffer.from('old')), idempotencyKey: 'idem-recovery-external' };
    await assert.rejects(writerWithCrash.execute(args), /simulated crash/);
    assert.equal(await readFile(target, 'utf8'), 'old');
    const writerWithRecoveryHook = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { beforeRecoveryPublish: async () => { await writeFile(target, 'external'); } },
      reconcilePreparedWrite: async () => ({ status: 'RESUME', evidence_id: 'recovery-evidence-external' }),
    });
    await assert.rejects(
      writerWithRecoveryHook.execute(args),
      (error) => error.code === 'PROJECT_FILE_EXTERNAL_MUTATION' && error.recovery_required === true
    );
    assert.equal(await readFile(target, 'utf8'), 'external');
    const prepared = [...p.artifacts.values()].find((a) => a.artifact_kind === 'project.file.write.prepared');
    assert.ok(prepared);
    const receipt = [...p.artifacts.values()].find((a) => a.artifact_kind === 'project.file.write.receipt');
    assert.equal(receipt, undefined);
  } finally { await f.cleanup(); }
});

test('normal lock release removes only its own lock', async () => {
  const f = await fixture();
  try {
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: persistenceHarness().api });
    const target = path.join(f.root, 'normal.txt');
    await writer.execute({ task, targetPath: target, content: 'ok', idempotencyKey: 'normal-release' });
    await assert.rejects(readFile(path.join(`${target}.agentos-write-lock`, 'owner.json')), (error) => error.code === 'ENOENT');
  } finally { await f.cleanup(); }
});

test('old writer cannot remove replacement live lock during release', async () => {
  const f = await fixture();
  try {
    const target = path.join(f.root, 'replacement.txt');
    const lock = `${target}.agentos-write-lock`;
    const replacement = { lock_id: 'replacement-live', intent_hash: 'replacement-intent', worker_id: 'replacement-worker', pid: process.pid };
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root], persistence: persistenceHarness().api,
      hooks: { beforeLockRetire: async ({ reason }) => {
        if (reason !== 'release') return;
        await rename(lock, `${lock}.old`);
        await mkdir(lock);
        await writeFile(path.join(lock, 'owner.json'), JSON.stringify(replacement));
      } },
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'old result', idempotencyKey: 'replacement-release' }),
      (error) => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED',
    );
    assert.deepEqual(JSON.parse(await readFile(path.join(lock, 'owner.json'), 'utf8')), replacement);
  } finally { await f.cleanup(); }
});

test('replacement immediately after acquisition blocks mutation and survives predecessor cleanup', async () => {
  const f = await fixture();
  try {
    const target = path.join(f.root, 'acquired-replacement.txt');
    const lock = `${target}.agentos-write-lock`;
    const replacement = { lock_id: 'new-owner', intent_hash: 'new-intent', worker_id: 'new-worker', pid: process.pid };
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root], persistence: persistenceHarness().api,
      hooks: { afterLockAcquired: async () => {
        await rename(lock, `${lock}.old`);
        await mkdir(lock);
        await writeFile(path.join(lock, 'owner.json'), JSON.stringify(replacement));
      } },
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'must not publish', idempotencyKey: 'acquired-replacement' }),
      (error) => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED',
    );
    assert.deepEqual(JSON.parse(await readFile(path.join(lock, 'owner.json'), 'utf8')), replacement);
    await assert.rejects(readFile(target), (error) => error.code === 'ENOENT');
  } finally { await f.cleanup(); }
});

test('abandoned lock replaced during takeover is preserved and never treated as stale', async () => {
  const f = await fixture();
  try {
    const target = path.join(f.root, 'takeover.txt');
    const lock = `${target}.agentos-write-lock`;
    const abandoned = { lock_id: 'abandoned', intent_hash: 'old-intent', worker_id: 'old-worker', pid: 999999 };
    const replacement = { lock_id: 'replacement-live', intent_hash: 'new-intent', worker_id: 'new-worker', pid: process.pid };
    await mkdir(lock);
    await writeFile(path.join(lock, 'owner.json'), JSON.stringify(abandoned));
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root], persistence: persistenceHarness().api,
      reconcileAbandonedLock: async () => ({ status: 'ABANDONED', evidence_id: 'abandoned-evidence' }),
      hooks: { beforeLockRetire: async ({ reason }) => {
        if (reason !== 'takeover') return;
        await rename(lock, `${lock}.old`);
        await mkdir(lock);
        await writeFile(path.join(lock, 'owner.json'), JSON.stringify(replacement));
      } },
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'not published', idempotencyKey: 'replacement-takeover' }),
      (error) => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED',
    );
    assert.deepEqual(JSON.parse(await readFile(path.join(lock, 'owner.json'), 'utf8')), process.platform === 'win32' ? abandoned : replacement);
    await assert.rejects(readFile(target), (error) => error.code === 'ENOENT');
  } finally { await f.cleanup(); }
});

test('Windows three-writer race cannot displace successor after predecessor validation', { skip: process.platform !== 'win32' }, async () => {
  const f = await fixture();
  let successorHandle;
  try {
    const target = path.join(f.root, 'three-writer.txt');
    const lock = `${target}.agentos-write-lock`;
    const successor = { lock_id: 'writer-b', intent_hash: 'intent-b', worker_id: 'worker-b', pid: process.pid };
    let thirdWriterBlocked = false;
    const flags = fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_RDWR | fsConstants.UV_FS_O_TEMPORARY;
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root], persistence: persistenceHarness().api,
      hooks: { afterLockValidation: async ({ reason }) => {
        if (reason !== 'release') return;
        await rename(lock, `${lock}.predecessor`);
        successorHandle = await open(lock, flags, 0o600);
        await successorHandle.writeFile(JSON.stringify(successor));
        await successorHandle.sync();
        try { const third = await open(lock, flags, 0o600); await third.close(); }
        catch (error) { thirdWriterBlocked = error?.code === 'EEXIST'; }
      } },
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'predecessor result', idempotencyKey: 'three-writer' }),
      (error) => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED',
    );
    assert.equal(thirdWriterBlocked, true);
    assert.deepEqual(JSON.parse(await readFile(lock, 'utf8')), successor);
  } finally {
    if (successorHandle) await successorHandle.close();
    await f.cleanup();
  }
});

test('Windows delete-on-close lock is removed when holder process exits abruptly', { skip: process.platform !== 'win32' }, async () => {
  const f = await fixture();
  try {
    const lock = path.join(f.root, 'crash.agentos-write-lock');
    const script = `const fs=require('fs'); const p=process.argv[1]; const c=fs.constants; const h=fs.openSync(p,c.O_CREAT|c.O_EXCL|c.O_RDWR|c.UV_FS_O_TEMPORARY,0o600); fs.writeSync(h,'owned'); process.stdout.write(String(fs.existsSync(p))); process.exit(42);`;
    const child = spawnSync(process.execPath, ['-e', script, lock], { encoding: 'utf8' });
    assert.equal(child.status, 42);
    assert.equal(child.stdout, 'true');
    await assert.rejects(readFile(lock), (error) => error.code === 'ENOENT');
  } finally { await f.cleanup(); }
});

test('missing or malformed owner metadata requires recovery without mutation', async () => {
  for (const owner of [null, '{broken']) {
    const f = await fixture();
    try {
      const target = path.join(f.root, 'metadata.txt');
      const lock = `${target}.agentos-write-lock`;
      await mkdir(lock);
      if (owner !== null) await writeFile(path.join(lock, 'owner.json'), owner);
      const writer = await createProjectFileWriter({
        approvedRoots: [f.root], persistence: persistenceHarness().api,
        reconcileAbandonedLock: async () => ({ status: 'ABANDONED', evidence_id: 'untrusted-evidence' }),
      });
      await assert.rejects(
        writer.execute({ task, targetPath: target, content: 'blocked', idempotencyKey: `metadata-${owner}` }),
        (error) => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED',
      );
      await assert.rejects(readFile(target), (error) => error.code === 'ENOENT');
    } finally { await f.cleanup(); }
  }
});

