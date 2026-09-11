import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const task = Object.freeze({ project_id: 'agentos', mission_id: 'mission-level2-fixture', task_id: 'task-project-file-write', worker_id: 'windows-worker-fixture' });

function persistenceHarness({ failCreate = false } = {}) {
  const artifacts = new Map();
  return {
    artifacts,
    api: {
      get: async (type, id) => type === 'artifact' ? artifacts.get(id) ?? null : null,
      create: async (type, input) => {
        if (failCreate) throw new Error('receipt store failed');
        if (type !== 'artifact') throw new Error('unexpected type');
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

test('creates a bounded file and records exact correlated mutation receipt', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const target = path.join(f.root, 'fixture.txt');
    const result = await writer.execute({ task, targetPath: target, content: 'hello level2\n', idempotencyKey: 'idem-create-1' });
    assert.equal(result.success, true);
    assert.equal(result.replayed, false);
    assert.equal(await readFile(target, 'utf8'), 'hello level2\n');
    const receipt = p.artifacts.get(result.receipt_id);
    assert.equal(receipt.project_id, task.project_id);
    assert.equal(receipt.mission_id, task.mission_id);
    assert.equal(receipt.task_id, task.task_id);
    assert.equal(receipt.worker_id, task.worker_id);
    assert.equal(receipt.postimage_sha256, hash(Buffer.from('hello level2\n')));
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
    assert.equal(p.artifacts.size, 1);
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

test('crash before publication leaves target unchanged', async () => {
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
    await assert.rejects(writer.execute({ task, targetPath: target, content: 'new\n', expectedPreimageSha256: hash(Buffer.from('old\n')), idempotencyKey: 'idem-before-crash' }), /simulated crash/);
    assert.equal(await readFile(target, 'utf8'), 'old\n');
    assert.equal(p.artifacts.size, 0);
  } finally { await f.cleanup(); }
});

test('crash after publication is explicitly recovery-required', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness();
    const target = path.join(f.root, 'fixture.txt');
    const writer = await createProjectFileWriter({
      approvedRoots: [f.root],
      persistence: p.api,
      hooks: { afterPublish: async () => { throw new Error('simulated crash after publish'); } },
    });
    await assert.rejects(
      writer.execute({ task, targetPath: target, content: 'published\n', idempotencyKey: 'idem-after-crash' }),
      (error) => error.recovery_required === true
    );
    assert.equal(await readFile(target, 'utf8'), 'published\n');
    assert.equal(p.artifacts.size, 0);
  } finally { await f.cleanup(); }
});

test('receipt persistence failure after publication never retries mutation blindly', async () => {
  const f = await fixture();
  try {
    const p = persistenceHarness({ failCreate: true });
    const target = path.join(f.root, 'fixture.txt');
    const writer = await createProjectFileWriter({ approvedRoots: [f.root], persistence: p.api });
    const args = { task, targetPath: target, content: 'published\n', idempotencyKey: 'idem-receipt-fail' };
    await assert.rejects(writer.execute(args), (error) => error.code === 'PROJECT_FILE_RECEIPT_PERSISTENCE_FAILED' && error.recovery_required === true);
    await assert.rejects(writer.execute(args), (error) => error.code === 'PROJECT_FILE_RECONCILIATION_REQUIRED');
    assert.equal(await readFile(target, 'utf8'), 'published\n');
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
