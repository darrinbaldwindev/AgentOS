import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { doctorLocal } from '../scripts/doctor-local.mjs';
import { bootLocal } from '../scripts/boot-local.mjs';

test('installed local path reaches doctor GREEN then boot online and persists event', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-first-boot-'));
  await installLocal({ root });
  const doctor = await doctorLocal({ root });
  assert.equal(doctor.status, 'GREEN');

  const first = await bootLocal({ root });
  assert.equal(first.status, 'online');
  assert.equal(first.mode, 'DRY_RUN');
  assert.equal(first.autonomyEnabled, false);
  assert.equal(first.overseer.id, 'agentos:overseer');

  const second = await bootLocal({ root });
  assert.equal(second.status, 'online');
  assert.equal(second.overseer.id, first.overseer.id);
  assert.equal(second.overseer.status, 'online');

  const state = JSON.parse(await readFile(join(root, 'state', 'agentos.json'), 'utf8'));
  assert.equal(Object.keys(state.records.agent).length, 1);
  assert.equal(Object.values(state.records.event).filter((e) => e.eventType === 'agentos.boot.completed').length, 2);
});

test('installed local boot refuses non-safe configuration', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-unsafe-boot-'));
  await installLocal({ root });
  const configPath = join(root, 'config.json');
  const { readFile: read, writeFile: write } = await import('node:fs/promises');
  const config = JSON.parse(await read(configPath, 'utf8'));
  config.autonomyEnabled = true;
  await write(configPath, `${JSON.stringify(config, null, 2)}\n`);
  await assert.rejects(() => bootLocal({ root }), /LOCAL_BOOT_REQUIRES_SAFE_MODE/);
});
