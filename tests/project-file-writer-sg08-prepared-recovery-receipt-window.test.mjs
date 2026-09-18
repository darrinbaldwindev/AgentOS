import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const task = Object.freeze({
  project_id: 'agentos',
  mission_id: 'mission-sg08-prepared-recovery-window',
  task_id: 'task-sg08-prepared-recovery-window',
  worker_id: 'worker-sg08-prepared-recovery-window',
});

function persistenceHarness() {
  const artifacts = new Map();
  let beforeReceipt = null;
  return {
    artifacts,
    setBeforeReceipt(fn) { beforeReceipt = fn; },
    api: {
      get: async (type, id) => type === 'artifact' ? artifacts.get(id) ?? null : null,
      create: async (type, input) => {
        if (type !== 'artifact') throw new Error('unexpected type');
        if (input.artifact_kind === 'project.file.write.receipt' && beforeReceipt) {
          await beforeReceipt(input);
        }
        if (artifacts.has(input.id)) throw new Error('duplicate');
        artifacts.set(input.id, structuredClone(input));
        return structuredClone(input);
      },
    },
  };
}

async function installSuccessor(lock, displaced) {
  await rename(lock, displaced);
  await mkdir(lock);
  await writeFile(path.join(lock, 'owner.json'), JSON.stringify({
    lock_id: 'successor-prepared-recovery-receipt',
    intent_hash: 'successor-prepared-recovery-receipt-intent',
    worker_id: 'successor-prepared-recovery-receipt-worker',
  }));
}

test('SG-08: prepared recovery can lose ownership immediately before durable success receipt', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-sg08-prepared-recovery-window-'));
  const target = path.join(root, 'fixture.txt');
  const lock = `${target}.agentos-write-lock`;
  const displaced = `${lock}.displaced`;
  const persistence = persistenceHarness();
  const args = {
    task,
    targetPath: target,
    content: 'prepared-recovery-published-before-receipt\n',
    idempotencyKey: 'sg08-prepared-recovery-receipt-window',
  };

  try {
    const firstWriter = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      hooks: {
        beforePublish: async () => { throw new Error('simulated crash before publish'); },
      },
    });

    await assert.rejects(firstWriter.execute(args), /simulated crash before publish/);
    assert.equal((await readFile(target, 'utf8').catch(() => null)), null);

    let injected = false;
    persistence.setBeforeReceipt(async () => {
      if (injected) return;
      injected = true;
      await installSuccessor(lock, displaced);
    });

    const recoveryWriter = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      reconcilePreparedWrite: async () => ({ status: 'RESUME', evidence_id: 'recovery-evidence-sg08-window' }),
    });

    await assert.rejects(
      recoveryWriter.execute(args),
      (error) => error?.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED'
    );

    assert.equal(injected, true);
    assert.equal(await readFile(target, 'utf8'), 'prepared-recovery-published-before-receipt\n');
    const receipts = [...persistence.artifacts.values()].filter(
      (artifact) => artifact.artifact_kind === 'project.file.write.receipt'
    );
    assert.equal(receipts.length, 1);
    assert.equal(receipts[0].result, 'RECOVERED_PREPARED_AND_VERIFIED');
    assert.equal(receipts[0].recovery_required, false);
    assert.equal(receipts[0].recovery_evidence_id, 'recovery-evidence-sg08-window');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
