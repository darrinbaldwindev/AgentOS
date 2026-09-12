import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';
import { createProjectFileRecoveryGovernance } from '../runtime/project-file-recovery-governance.mjs';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const task = Object.freeze({ project_id: 'agentos', mission_id: 'mission-process-kill', task_id: 'task-process-kill', worker_id: 'windows-worker-fixture' });

async function waitFor(pathname, timeoutMs = 5000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try { await stat(pathname); return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`timeout waiting for ${pathname}`);
}

function correlatedAuthority(id, decisionId, intentHash, target) {
  return {
    id, artifact_kind: 'approval.receipt', disposition: 'ALLOW_RECOVERY', recovery_decision_id: decisionId,
    ...task, target_path: target, intent_hash: intentHash,
  };
}

test('abrupt child-process death leaves recoverable state and restart publishes exactly once', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-level2-kill-'));
  try {
    const target = path.join(root, 'fixture.txt');
    const stateFile = path.join(root, 'state.json');
    const marker = path.join(root, 'prepared.marker');
    await writeFile(target, 'old\n');

    const content = 'new\n';
    const idempotencyKey = 'idem-process-kill';
    const expectedPreimageSha256 = sha256(Buffer.from('old\n'));
    const keyHash = sha256(idempotencyKey);
    const posthash = sha256(Buffer.from(content));
    const intent = { ...task, path: target, expected_preimage_sha256: expectedPreimageSha256, postimage_sha256: posthash };
    const intentHash = sha256(JSON.stringify(intent));

    const childSource = `
      import { createProjectFileWriter } from ${JSON.stringify(pathToFileURL(path.resolve('runtime/project-file-writer.mjs')).href)};
      import { createLocalPersistence } from ${JSON.stringify(pathToFileURL(path.resolve('runtime/local-persistence.mjs')).href)};
      import { writeFile } from 'node:fs/promises';
      const persistence = await createLocalPersistence({ filePath: ${JSON.stringify(stateFile)} });
      const writer = await createProjectFileWriter({
        approvedRoots: [${JSON.stringify(root)}], persistence,
        hooks: { beforePublish: async () => {
          await writeFile(${JSON.stringify(marker)}, 'prepared');
          await new Promise(() => { setInterval(() => {}, 1000); });
        } },
      });
      await writer.execute({ task: ${JSON.stringify(task)}, targetPath: ${JSON.stringify(target)}, content: ${JSON.stringify(content)}, expectedPreimageSha256: ${JSON.stringify(expectedPreimageSha256)}, idempotencyKey: ${JSON.stringify(idempotencyKey)} });
    `;
    const child = spawn(process.execPath, ['--input-type=module', '-e', childSource], { stdio: ['ignore', 'pipe', 'pipe'] });
    await waitFor(marker);
    const exited = new Promise((resolve) => child.once('exit', resolve));
    child.kill('SIGKILL');
    await exited;

    assert.equal(await readFile(target, 'utf8'), 'old\n');
    const lock = `${target}.agentos-write-lock`;
    const owner = JSON.parse(await readFile(path.join(lock, 'owner.json'), 'utf8'));
    const tempNames = (await readdir(root)).filter((name) => name.startsWith('.fixture.txt.agentos-') && name.endsWith('.tmp'));
    assert.equal(tempNames.length, 1);

    const persistence = await createLocalPersistence({ filePath: stateFile });
    const preparedId = `project_file_write_prepared_${keyHash.slice(0, 32)}`;
    const prepared = await persistence.get('artifact', preparedId);
    assert.ok(prepared);

    const issuedAt = new Date().toISOString();
    await persistence.create('artifact', correlatedAuthority('authority-lock', 'decision-lock', intentHash, target));
    await persistence.create('artifact', {
      id: 'decision-lock', artifact_kind: 'project.file.write.recovery-decision', status: 'ABANDONED', decision_kind: 'ABANDONED_LOCK',
      issued_at: issuedAt, authority_artifact_id: 'authority-lock', ...task, target_path: target, intent_hash: intentHash,
      idempotency_key_sha256: keyHash, lock_id: owner.lock_id,
    });
    await persistence.create('artifact', correlatedAuthority('authority-prepared', 'decision-prepared', intentHash, target));
    await persistence.create('artifact', {
      id: 'decision-prepared', artifact_kind: 'project.file.write.recovery-decision', status: 'RESUME', decision_kind: 'PREPARED_WRITE',
      issued_at: issuedAt, authority_artifact_id: 'authority-prepared', ...task, target_path: target, intent_hash: intentHash,
      idempotency_key_sha256: keyHash, prepared_id: preparedId,
    });

    const governance = createProjectFileRecoveryGovernance({ persistence });
    const writer = await createProjectFileWriter({
      approvedRoots: [root], persistence,
      reconcileAbandonedLock: governance.abandonedLock({ evidenceId: 'decision-lock', intentHash, idempotencyKeySha256: keyHash }),
      reconcilePreparedWrite: governance.prepared({ evidenceId: 'decision-prepared', intentHash, idempotencyKeySha256: keyHash }),
    });
    const args = { task, targetPath: target, content, expectedPreimageSha256, idempotencyKey };
    const recovered = await writer.execute(args);
    assert.equal(recovered.recovered, true);
    assert.equal(await readFile(target, 'utf8'), content);

    const replay = await writer.execute(args);
    assert.equal(replay.replayed, true);
    assert.equal(await readFile(target, 'utf8'), content);
    assert.equal((await readdir(root)).filter((name) => name.startsWith('.fixture.txt.agentos-') && name.endsWith('.tmp')).length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
