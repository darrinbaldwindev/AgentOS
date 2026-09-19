import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const task = Object.freeze({
  project_id: 'agentos',
  mission_id: 'mission-sg08-baseline',
  task_id: 'task-sg08-baseline',
  worker_id: 'worker-sg08-baseline',
});

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

function successReceipts(persistence) {
  return [...persistence.artifacts.values()].filter(
    (artifact) => artifact.artifact_kind === 'project.file.write.receipt' && artifact.result === 'MUTATED_VERIFIED'
  );
}

async function installSuccessor(lock, displaced, suffix) {
  await rename(lock, displaced);
  await mkdir(lock);
  await writeFile(path.join(lock, 'owner.json'), JSON.stringify({
    lock_id: `successor-lock-${suffix}`,
    intent_hash: `successor-intent-${suffix}`,
    worker_id: `successor-worker-${suffix}`,
  }));
}

test('SG-08 regression: ownership loss during retirement cannot persist a success receipt', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-sg08-baseline-'));
  const target = path.join(root, 'fixture.txt');
  const displaced = `${target}.agentos-write-lock.displaced`;
  const persistence = persistenceHarness();
  let injected = false;

  try {
    const writer = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      hooks: {
        beforeLockRetire: async ({ lock, reason }) => {
          if (reason !== 'release' || injected) return;
          injected = true;
          await installSuccessor(lock, displaced, 'retire');
        },
      },
    });

    await assert.rejects(
      writer.execute({
        task,
        targetPath: target,
        content: 'published-before-retirement-check\n',
        idempotencyKey: 'sg08-false-success-baseline',
      }),
      (error) => error?.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED'
    );

    assert.equal(injected, true);
    assert.equal(await readFile(target, 'utf8'), 'published-before-retirement-check\n');
    assert.equal(successReceipts(persistence).length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('SG-08 repair fixture: successor installed after publish forbids durable success', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-sg08-after-publish-'));
  const target = path.join(root, 'fixture.txt');
  const displaced = `${target}.agentos-write-lock.displaced`;
  const persistence = persistenceHarness();
  let injected = false;

  try {
    const writer = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      hooks: {
        afterPublish: async () => {
          if (injected) return;
          injected = true;
          await installSuccessor(`${target}.agentos-write-lock`, displaced, 'after-publish');
        },
      },
    });

    await assert.rejects(
      writer.execute({
        task: { ...task, task_id: 'task-sg08-after-publish' },
        targetPath: target,
        content: 'published-before-successor-check\n',
        idempotencyKey: 'sg08-after-publish-successor',
      }),
      (error) => error?.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED'
    );

    assert.equal(injected, true);
    assert.equal(await readFile(target, 'utf8'), 'published-before-successor-check\n');
    assert.equal(successReceipts(persistence).length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('SG-08 regression: replacement at release preserves prepared intent without false success receipt', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-sg08-prepared-order-'));
  const target = path.join(root, 'fixture.txt');
  const displaced = `${target}.agentos-write-lock.displaced`;
  const persistence = persistenceHarness();
  let injected = false;

  try {
    const writer = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      hooks: {
        beforeLockRetire: async ({ lock, reason }) => {
          if (reason !== 'release' || injected) return;
          injected = true;
          await installSuccessor(lock, displaced, 'prepared-order');
        },
      },
    });

    await assert.rejects(
      writer.execute({
        task: { ...task, task_id: 'task-sg08-prepared-order' },
        targetPath: target,
        content: 'prepared-and-published\n',
        idempotencyKey: 'sg08-prepared-order',
      }),
      (error) => error?.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED'
    );

    const prepared = [...persistence.artifacts.values()].filter(
      (artifact) => artifact.artifact_kind === 'project.file.write.prepared'
    );
    assert.equal(injected, true);
    assert.equal(await readFile(target, 'utf8'), 'prepared-and-published\n');
    assert.equal(prepared.length, 1);
    assert.equal(typeof prepared[0].postimage_sha256, 'string');
    assert.equal(successReceipts(persistence).length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
