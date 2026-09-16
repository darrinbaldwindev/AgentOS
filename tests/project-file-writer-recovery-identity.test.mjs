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

test('same-content external replacement during recovery publish is rejected by filesystem identity', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-level2-recovery-identity-'));
  try {
    const persistence = persistenceHarness();
    const target = path.join(root, 'fixture.txt');
    await writeFile(target, 'old');

    const task = {
      project_id: 'agentos',
      mission_id: 'mission-level2-recovery-identity',
      task_id: 'task-level2-recovery-identity',
      worker_id: 'windows-worker-fixture',
    };
    const args = {
      task,
      targetPath: target,
      content: 'new',
      expectedPreimageSha256: hash(Buffer.from('old')),
      idempotencyKey: 'idem-recovery-same-content-replacement',
    };

    const interrupted = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      hooks: { beforePublish: async () => { throw new Error('simulated interruption'); } },
    });
    await assert.rejects(interrupted.execute(args), /simulated interruption/);
    assert.equal(await readFile(target, 'utf8'), 'old');

    const resumed = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      reconcilePreparedWrite: async () => ({ status: 'RESUME', evidence_id: 'recovery-identity-evidence' }),
      hooks: {
        beforeRecoveryPublish: async () => {
          const replacement = path.join(root, 'external-replacement.tmp');
          await writeFile(replacement, 'old');
          await rename(replacement, target);
        },
      },
    });

    await assert.rejects(
      resumed.execute(args),
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
