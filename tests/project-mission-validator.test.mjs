import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

function runValidator(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/validate-project-mission.mjs', file], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

const valid = {
  mission_id: 'PROJECT-001', issuer: 'CHATGPT OVERSEER', target_repository: 'darrinbaldwindev/example',
  project_overseer: 'Example Overseer', objective: 'inspect repository', scope: ['repository'], priority: 'P1',
  created_at: '2026-09-01T00:00:00Z', authority_class: 'PRE_AUTHORISED', required_evidence: ['scan'], status: 'pending',
};

test('valid mission envelope is accepted', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agentos-mission-'));
  const file = join(dir, 'mission.json');
  await writeFile(file, JSON.stringify(valid));
  const result = await runValidator(file);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /"outcome": "validated"/);
  await rm(dir, { recursive: true, force: true });
});

test('malformed mission fails closed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agentos-mission-'));
  const file = join(dir, 'mission.json');
  await writeFile(file, JSON.stringify({ ...valid, authority_class: '' }));
  const result = await runValidator(file);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /missing_required_fields/);
  await rm(dir, { recursive: true, force: true });
});

test('non-pending mission cannot be replayed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agentos-mission-'));
  const file = join(dir, 'mission.json');
  await writeFile(file, JSON.stringify({ ...valid, status: 'completed' }));
  const result = await runValidator(file);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /mission_not_pending/);
  await rm(dir, { recursive: true, force: true });
});
