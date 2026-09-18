import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const task = Object.freeze({
  project_id: 'agentos',
  mission_id: 'mission-sg08-receipt-window',
  task_id: 'task-sg08-receipt-window',
  worker_id: 'worker-sg08-receipt-window',
});

function persistenceHarness({ beforeSuccessReceipt } = {}) {
  const artifacts = new Map();
  return {
    artifacts,
    api: {
      get: async (type, id) => type === 'artifact' ? artifacts.get(id) ?? null : null,
      create: async (type, input) => {
        if (type !== 'artifact') throw new Error('unexpected type');
        if (input.artifact_kind === 'project.file.write.receipt' && beforeSuccessReceipt) {
          await beforeSuccessReceipt(input);
        }
        if (artifacts.has(input.id)) throw new Error('duplicate');
        artifacts.set(input.id, structuredClone(input));
        return structuredClone(input);
      },
    },
  };
}

async function displaceOwner(lock, displaced) {
  await rename(lock, displaced);
  await mkdir(lock);
  await writeFile(path.join(lock, 'owner.json'), JSON.stringify({
    lock_id: 'successor-before-receipt',
    intent_hash: 'successor-before-receipt-intent',
    worker_id: 'successor-before-receipt-worker',
  }));
}

test('SG-08: ownership can be displaced after postwrite verification but before success receipt persistence', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-sg08-receipt-window-'));
  const target = path.join(root, 'fixture.txt');
  const lock = `${target}.agentos-write-lock`;
  const displaced = `${lock}.displaced`;
  let injected = false;
  const persistence = persistenceHarness({
    beforeSuccessReceipt: async () => {
      if (injected) return;
      injected = true;
      await displaceOwner(lock, displaced);
    },
  });

  try {
    await assert.rejects(
      (await createProjectFileWriter({ approvedRoots: [root], persistence: persistence.api })).execute({
        task,
        targetPath: target,
        content: 'published-before-receipt-ownership-loss\n',
        idempotencyKey: 'sg08-receipt-window',
      }),
      (error) => error?.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED'
    );

    assert.equal(injected, true);
    assert.equal(await readFile(target, 'utf8'), 'published-before-receipt-ownership-loss\n');
    const receipts = [...persistence.artifacts.values()].filter(
      (artifact) => artifact.artifact_kind === 'project.file.write.receipt'
    );
    assert.equal(receipts.length, 1);
    assert.equal(receipts[0].result, 'MUTATED_VERIFIED');
    assert.equal(receipts[0].recovery_required, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
