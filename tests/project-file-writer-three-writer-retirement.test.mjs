import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const taskA = Object.freeze({ project_id: 'agentos', mission_id: 'lock-race', task_id: 'writer-a', worker_id: 'writer-a' });
const taskC = Object.freeze({ project_id: 'agentos', mission_id: 'lock-race', task_id: 'writer-c', worker_id: 'writer-c' });

function persistenceHarness() {
  const artifacts = new Map();
  return {
    artifacts,
    get: async (type, id) => type === 'artifact' ? artifacts.get(id) ?? null : null,
    create: async (type, input) => {
      if (type !== 'artifact') throw new Error('unexpected type');
      if (artifacts.has(input.id)) throw new Error('duplicate');
      artifacts.set(input.id, structuredClone(input));
      return structuredClone(input);
    },
  };
}

test('POSIX continuous fence preserves replacement metadata and blocks a third governed writer', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-three-writer-retire-'));
  try {
    const target = path.join(root, 'fixture.txt');
    const lock = `${target}.agentos-write-lock`;
    const guard = `${lock}.namespace-guard`;
    const predecessor = `${lock}.predecessor`;
    const successor = { lock_id: 'writer-b-lock', intent_hash: 'writer-b-intent', worker_id: 'writer-b', pid: process.pid };
    let thirdWriterError = null;
    const persistenceA = persistenceHarness();
    const persistenceC = persistenceHarness();

    const writerC = await createProjectFileWriter({ approvedRoots: [root], persistence: persistenceC });
    const writerA = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistenceA,
      hooks: {
        afterLockValidation: async ({ reason }) => {
          if (reason !== 'release') return;
          await rename(lock, predecessor);
          await mkdir(lock);
          await writeFile(path.join(lock, 'owner.json'), JSON.stringify(successor));
          try {
            await writerC.execute({ task: taskC, targetPath: target, content: 'writer-c', idempotencyKey: 'writer-c-race' });
          } catch (error) {
            thirdWriterError = error;
          }
        },
      },
    });

    await assert.rejects(
      writerA.execute({ task: taskA, targetPath: target, content: 'writer-a', idempotencyKey: 'writer-a-race' }),
      (error) => error.code === 'PROJECT_FILE_LOCK_RECOVERY_REQUIRED',
    );

    assert.equal(thirdWriterError?.code, 'PROJECT_FILE_LIVE_CONTENTION');
    assert.deepEqual(JSON.parse(await readFile(path.join(lock, 'owner.json'), 'utf8')), successor);
    assert.equal(await readFile(target, 'utf8'), 'writer-a');
    assert.equal([...persistenceA.artifacts.values()].filter(
      (artifact) => artifact.artifact_kind === 'project.file.write.receipt' && artifact.result === 'MUTATED_VERIFIED'
    ).length, 0);
    assert.equal([...persistenceC.artifacts.values()].filter(
      (artifact) => artifact.artifact_kind === 'project.file.write.receipt'
    ).length, 0);
    await assert.rejects(readFile(guard), (error) => error.code === 'ENOENT');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
