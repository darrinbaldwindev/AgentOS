import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
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
