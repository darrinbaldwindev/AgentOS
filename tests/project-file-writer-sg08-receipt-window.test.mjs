import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
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

test('SG-08 regression: governed successor cannot enter after verification but before durable success receipt', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-sg08-receipt-window-'));
  const target = path.join(root, 'fixture.txt');
  let successorError = null;
  let challenged = false;
  const successorPersistence = persistenceHarness();
  const successorWriter = await createProjectFileWriter({ approvedRoots: [root], persistence: successorPersistence.api });
  const persistence = persistenceHarness({
    beforeSuccessReceipt: async () => {
      if (challenged) return;
      challenged = true;
      try {
        await successorWriter.execute({
          task: { ...task, task_id: 'task-sg08-receipt-window-successor', worker_id: 'worker-sg08-receipt-window-successor' },
          targetPath: target,
          content: 'successor-must-not-publish\n',
          idempotencyKey: 'sg08-receipt-window-successor',
        });
      } catch (error) {
        successorError = error;
      }
    },
  });

  try {
    await (await createProjectFileWriter({ approvedRoots: [root], persistence: persistence.api })).execute({
      task,
      targetPath: target,
      content: 'published-before-receipt-successor-challenge\n',
      idempotencyKey: 'sg08-receipt-window',
    });

    assert.equal(challenged, true);
    assert.equal(successorError?.code, 'PROJECT_FILE_LIVE_CONTENTION');
    assert.equal(await readFile(target, 'utf8'), 'published-before-receipt-successor-challenge\n');
    const receipts = [...persistence.artifacts.values()].filter(
      (artifact) => artifact.artifact_kind === 'project.file.write.receipt'
    );
    assert.equal(receipts.length, 1);
    assert.equal(receipts[0].result, 'MUTATED_VERIFIED');
    assert.equal(receipts[0].recovery_required, false);
    assert.equal([...successorPersistence.artifacts.values()].filter(
      (artifact) => artifact.artifact_kind === 'project.file.write.receipt'
    ).length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
