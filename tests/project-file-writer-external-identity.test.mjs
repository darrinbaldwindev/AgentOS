import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const hash = (value) => createHash('sha256').update(value).digest('hex');

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

test('same-content external replacement before publish is rejected by filesystem identity', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-level2-external-identity-'));
  try {
    const persistence = persistenceHarness();
    const target = path.join(root, 'fixture.txt');
    await writeFile(target, 'old');

    const writer = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      hooks: {
        beforePublish: async () => {
          const replacement = path.join(root, 'external-replacement.tmp');
          await writeFile(replacement, 'old');
          await rename(replacement, target);
        },
      },
    });

    await assert.rejects(
      writer.execute({
        task: {
          project_id: 'agentos',
          mission_id: 'mission-level2-external-identity',
          task_id: 'task-level2-external-identity',
          worker_id: 'windows-worker-fixture',
        },
        targetPath: target,
        content: 'new',
        expectedPreimageSha256: hash(Buffer.from('old')),
        idempotencyKey: 'idem-external-same-content-replacement',
      }),
      (error) => error.code === 'PROJECT_FILE_EXTERNAL_MUTATION' && error.recovery_required === true
    );

    assert.equal(await readFile(target, 'utf8'), 'old');
    const receipt = [...persistence.artifacts.values()].find(
      (artifact) => artifact.artifact_kind === 'project.file.write.receipt'
    );
    assert.equal(receipt, undefined);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
