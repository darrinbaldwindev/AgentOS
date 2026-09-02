import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { wakeLocal } from '../runtime/local-wake.mjs';

async function makeInstall() {
  const root = await mkdtemp(join(tmpdir(), 'agentos-wake-'));
  await installLocal({ root });
  return root;
}

test('installed runtime wake persists task, response, event and Overseer reuse', async () => {
  const root = await makeInstall();
  try {
    const first = await wakeLocal({ root, objective: 'first bounded wake' });
    const second = await wakeLocal({ root, objective: 'second bounded wake' });
    assert.equal(first.status, 'COMPLETED');
    assert.equal(second.status, 'COMPLETED');
    assert.notEqual(first.response.wake_trace_id, second.response.wake_trace_id);
    assert.equal(first.boot.overseer.id, second.boot.overseer.id);
    assert.equal(first.boot.capabilities.mode, 'DRY_RUN');

    const state = JSON.parse(await readFile(join(root, DEFAULT_CONFIG.stateFile), 'utf8'));
    const artifacts = Object.values(state.records.artifact);
    const responses = artifacts.filter((a) => a.artifactType === 'project-overseer.response');
    const tasks = artifacts.filter((a) => a.artifactType === 'dispatch.task');
    const wakes = Object.values(state.records.event).filter((e) => e.eventType === 'agentos.manual-wake.completed');
    assert.equal(tasks.length, 2);
    assert.equal(responses.length, 2);
    assert.equal(wakes.length, 2);
    assert.equal(state.records.agent['agentos:overseer'].status, 'online');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('wake fails closed when local config leaves safe DRY_RUN mode', async () => {
  const root = await makeInstall();
  try {
    const configPath = join(root, 'config.json');
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    await writeFile(configPath, `${JSON.stringify({ ...config, autonomyEnabled: true }, null, 2)}\n`);
    await assert.rejects(() => wakeLocal({ root }), /LOCAL_WAKE_REQUIRES_SAFE_MODE/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
