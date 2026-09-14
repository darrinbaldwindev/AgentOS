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

test('SG-08 baseline: ownership loss during retirement rejects execution but current lineage has already persisted success receipt', { skip: process.platform === 'win32' }, async () => {
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
          await rename(lock, displaced);
          await mkdir(lock);
          await writeFile(path.join(lock, 'owner.json'), JSON.stringify({
            lock_id: 'successor-lock',
            intent_hash: 'successor-intent',
            worker_id: 'successor-worker',
          }));
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

    const successReceipts = [...persistence.artifacts.values()].filter(
      (artifact) => artifact.artifact_kind === 'project.file.write.receipt' && artifact.result === 'MUTATED_VERIFIED'
    );
    assert.equal(successReceipts.length, 1);
    assert.equal(successReceipts[0].recovery_required, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
