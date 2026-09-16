import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const task = Object.freeze({
  project_id: 'agentos',
  mission_id: 'mission-level2-canonical-containment',
  task_id: 'task-project-file-write-containment',
  worker_id: 'windows-worker-fixture',
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

async function fixture() {
  const base = await mkdtemp(path.join(tmpdir(), 'agentos-level2-containment-'));
  const approved = path.join(base, 'approved');
  const outside = path.join(base, 'outside');
  await mkdir(approved);
  await mkdir(outside);
  return { base, approved, outside, cleanup: () => rm(base, { recursive: true, force: true }) };
}

test('existing symlink target outside approved root fails closed before mutation', async (t) => {
  const f = await fixture();
  try {
    const outsideTarget = path.join(f.outside, 'outside.txt');
    const link = path.join(f.approved, 'linked.txt');
    await writeFile(outsideTarget, 'outside-original');
    try {
      await symlink(outsideTarget, link, 'file');
    } catch (error) {
      if (process.platform === 'win32' && (error?.code === 'EPERM' || error?.code === 'EACCES')) {
        t.skip('file symlink creation is not permitted on this Windows runner');
        return;
      }
      throw error;
    }

    const persistence = persistenceHarness();
    const writer = await createProjectFileWriter({ approvedRoots: [f.approved], persistence: persistence.api });

    await assert.rejects(
      writer.execute({ task, targetPath: link, content: 'should-not-write', idempotencyKey: 'idem-containment-file-link' }),
      (error) => error.code === 'PROJECT_FILE_TARGET_OUTSIDE_APPROVED_ROOT'
    );

    assert.equal(await readFile(outsideTarget, 'utf8'), 'outside-original');
    assert.equal(persistence.artifacts.size, 0);
  } finally {
    await f.cleanup();
  }
});

test('missing target through symlinked parent outside approved root fails closed before mutation', async (t) => {
  const f = await fixture();
  try {
    const linkedParent = path.join(f.approved, 'linked-parent');
    try {
      await symlink(f.outside, linkedParent, process.platform === 'win32' ? 'junction' : 'dir');
    } catch (error) {
      if (process.platform === 'win32' && (error?.code === 'EPERM' || error?.code === 'EACCES')) {
        t.skip('directory junction/symlink creation is not permitted on this Windows runner');
        return;
      }
      throw error;
    }

    const outsideTarget = path.join(f.outside, 'new.txt');
    const escapedRequest = path.join(linkedParent, 'new.txt');
    const persistence = persistenceHarness();
    const writer = await createProjectFileWriter({ approvedRoots: [f.approved], persistence: persistence.api });

    await assert.rejects(
      writer.execute({ task, targetPath: escapedRequest, content: 'should-not-write', idempotencyKey: 'idem-containment-parent-link' }),
      (error) => error.code === 'PROJECT_FILE_TARGET_OUTSIDE_APPROVED_ROOT'
    );

    await assert.rejects(readFile(outsideTarget, 'utf8'), (error) => error.code === 'ENOENT');
    assert.equal(persistence.artifacts.size, 0);
  } finally {
    await f.cleanup();
  }
});
