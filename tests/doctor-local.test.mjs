import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { doctorLocal } from '../scripts/doctor-local.mjs';

test('local doctor reports GREEN for a fresh safe installation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-doctor-test-'));
  await installLocal({ root });
  const result = await doctorLocal({ root });
  assert.equal(result.status, 'GREEN');
  assert.equal(result.failedChecks, 0);
  assert.ok(result.checks.length >= 7);
  assert.equal(result.checks.find(({ name }) => name === 'scheduler-config')?.status, 'PASS');
});

test('local doctor fails closed when state is missing', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-doctor-missing-state-'));
  await installLocal({ root });
  const statePath = join(root, 'state/agentos.json');
  const { unlink } = await import('node:fs/promises');
  await unlink(statePath);
  const result = await doctorLocal({ root });
  assert.equal(result.status, 'FAILED');
  assert.ok(result.failedChecks >= 1);
});

test('local doctor fails closed when installed state/workspace paths drift from safe defaults', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-doctor-path-drift-'));
  const installed = await installLocal({ root });
  const config = JSON.parse(await readFile(installed.configPath, 'utf8'));
  config.stateFile = '../borrowed-state.json';
  config.workspaceRoot = '../borrowed-workspace';
  await writeFile(installed.configPath, `${JSON.stringify(config, null, 2)}\n`);

  const result = await doctorLocal({ root });
  assert.equal(result.status, 'FAILED');
  assert.equal(result.checks.find(({ name }) => name === 'state-file-config')?.status, 'FAIL');
  assert.equal(result.checks.find(({ name }) => name === 'workspace-root-config')?.status, 'FAIL');
});

test('local doctor fails closed when scheduler is enabled before explicit acceptance', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-doctor-scheduler-enabled-'));
  const installed = await installLocal({ root });
  const config = JSON.parse(await readFile(installed.configPath, 'utf8'));
  config.scheduler.enabled = true;
  await writeFile(installed.configPath, `${JSON.stringify(config, null, 2)}\n`);

  const result = await doctorLocal({ root });
  assert.equal(result.status, 'FAILED');
  assert.equal(result.checks.find(({ name }) => name === 'scheduler-config')?.status, 'FAIL');
});
