import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { planLocalUninstall } from '../scripts/plan-local-uninstall.mjs';

test('uninstall preflight is read-only and returns an owner-gated plan', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-uninstall-plan-'));
  const installed = await installLocal({ root });
  const configBefore = await readFile(installed.configPath, 'utf8');
  const stateBefore = await readFile(installed.statePath, 'utf8');

  const plan = await planLocalUninstall({ root });

  assert.equal(plan.status, 'PLAN_ONLY');
  assert.equal(plan.mutationPerformed, false);
  assert.equal(plan.ownerGateRequired, true);
  assert.equal(await readFile(installed.configPath, 'utf8'), configBefore);
  assert.equal(await readFile(installed.statePath, 'utf8'), stateBefore);
});

test('uninstall preflight fails closed on incomplete installation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-uninstall-incomplete-'));
  const installed = await installLocal({ root });
  const { rm } = await import('node:fs/promises');
  await rm(installed.statePath);

  await assert.rejects(
    planLocalUninstall({ root }),
    /LOCAL_UNINSTALL_PREFLIGHT_FAILED: canonical state unavailable/,
  );
});

test('uninstall preflight refuses unsafe scheduler/autonomy state', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-uninstall-unsafe-'));
  const installed = await installLocal({ root });
  const config = JSON.parse(await readFile(installed.configPath, 'utf8'));
  config.scheduler.enabled = true;
  await writeFile(installed.configPath, `${JSON.stringify(config, null, 2)}\n`);

  await assert.rejects(
    planLocalUninstall({ root }),
    /LOCAL_UNINSTALL_PREFLIGHT_FAILED: installation is not in the safe disabled pre-acceptance state/,
  );
});
