import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';
import { missionLedgerPaths } from '../runtime/mission-ledger.mjs';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { main, wakeLocal } from '../runtime/local-wake.mjs';

async function makeInstall() {
  const root = await mkdtemp(join(tmpdir(), 'agentos-wake-'));
  await installLocal({ root });
  return root;
}

test('final response write failure cannot publish ledger completion', async (t) => {
  const root = await makeInstall();
  const statePath = join(root, DEFAULT_CONFIG.stateFile);
  const rename = fs.rename;
  let rejected = false;
  t.mock.method(fs, 'rename', async (source, target) => {
    if (target === statePath) {
      const candidate = JSON.parse(await readFile(source, 'utf8'));
      if (Object.values(candidate.records.artifact).some((a) =>
        a.artifactType === 'project-overseer.response' && a.payload?.status === 'COMPLETED')) {
        rejected = true;
        throw new Error('INJECTED_RESPONSE_WRITE_FAILURE');
      }
    }
    return rename(source, target);
  });
  try {
    await assert.rejects(wakeLocal({ root }), /INJECTED_RESPONSE_WRITE_FAILURE/);
    assert.equal(rejected, true);
    const state = JSON.parse(await readFile(statePath, 'utf8'));
    assert.equal(Object.values(state.records.artifact).some((a) => a.payload?.status === 'COMPLETED'), false);
    const ledger = (await readFile(missionLedgerPaths(root).ledger, 'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(ledger.some((r) => r.actions.includes('COMPLETED')), false);
    assert.equal(Object.values(state.records.event).some((e) => e.eventType === 'agentos.manual-wake.completed'), false);
  } finally {
    t.mock.restoreAll();
    await rm(root, { recursive: true, force: true });
  }
});

test('wake executes its exact task when an older queued task survives recovery', async () => {
  const root = await makeInstall();
  try {
    const first = await wakeLocal({ root, objective: 'older task' });
    const path = join(root, DEFAULT_CONFIG.stateFile);
    const state = JSON.parse(await readFile(path, 'utf8'));
    const old = state.records.artifact[first.task_id].payload;
    old.status = 'queued';
    old.created_at = '2020-01-01T00:00:00.000Z';
    delete old.evidence;
    await writeFile(path, JSON.stringify(state));
    const second = await wakeLocal({ root, objective: 'new exact task' });
    assert.equal(second.task.task_id, second.task_id);
    assert.equal(second.task.mission_id, second.response.mission_id);
    assert.equal(second.task.wake_trace_id, second.response.wake_trace_id);
    assert.equal(second.task.objective, 'new exact task');
    const after = JSON.parse(await readFile(path, 'utf8'));
    assert.equal(after.records.artifact[first.task_id].payload.status, 'queued');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('installed runtime wake persists task, response, event and Overseer reuse', async () => {
  const root = await makeInstall();
  try {
    const first = await wakeLocal({ root, objective: 'first bounded wake' });
    const second = await wakeLocal({ root, objective: 'second bounded wake' });
    assert.equal(first.status, 'COMPLETED');
    assert.equal(second.status, 'COMPLETED');
    assert.equal(first.green?.disposition, 'pass');
    assert.equal(second.green?.disposition, 'pass');
    assert.notEqual(first.response.wake_trace_id, second.response.wake_trace_id);
    assert.equal(first.boot.overseer.id, second.boot.overseer.id);
    assert.equal(first.boot.capabilities.mode, 'DRY_RUN');
    assert.equal(first.response.source_agent, 'agentos:deterministic-skill-agent');
    assert.equal(second.response.source_agent, 'agentos:deterministic-skill-agent');
    assert.ok(first.response.evidence.some((item) => item === 'worker:agentos:deterministic-skill-agent'));
    assert.ok(first.response.verification.some((item) => item.includes('registered worker was enabled, executable and matched every required capability')));
    assert.ok(first.response.verification.some((item) => item.includes('Green evaluateTaskCompletion disposition=pass')));

    const state = JSON.parse(await readFile(join(root, DEFAULT_CONFIG.stateFile), 'utf8'));
    const artifacts = Object.values(state.records.artifact);
    const responses = artifacts.filter((a) => a.artifactType === 'project-overseer.response');
    const finalCompleted = responses.filter((a) => a.payload?.status === 'COMPLETED');
    const awaitingGreen = responses.filter((a) => a.payload?.status === 'AWAITING_GREEN');
    const greenDispositions = artifacts.filter((a) => a.artifactType === 'green.disposition');
    const tasks = artifacts.filter((a) => a.artifactType === 'dispatch.task');
    const wakes = Object.values(state.records.event).filter((e) => e.eventType === 'agentos.manual-wake.completed');
    assert.equal(tasks.length, 2);
    assert.equal(finalCompleted.length, 2);
    assert.equal(awaitingGreen.length, 2);
    assert.equal(greenDispositions.length, 2);
    assert.equal(wakes.length, 2);
    assert.equal(wakes[0].workerId, 'agentos:deterministic-skill-agent');
    assert.equal(wakes[0].greenDisposition, 'pass');
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

test('manual wake honours explicit AGENTOS_HOME and preserves safe defaults', async () => {
  const root = await makeInstall();
  try {
    const result = await main({
      env: { AGENTOS_HOME: root },
      argv: ['node', 'runtime/local-wake.mjs', 'explicit root wake'],
    });
    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.green?.disposition, 'pass');
    assert.equal(result.boot.capabilities.mode, 'DRY_RUN');
    const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
    assert.equal(config.autonomyEnabled, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('manual wake defaults to the platform home .agentos directory', async () => {
  const platformHome = await mkdtemp(join(tmpdir(), 'agentos-home-'));
  const root = join(platformHome, '.agentos');
  try {
    await installLocal({ root });
    const result = await main({
      env: {},
      argv: ['node', 'runtime/local-wake.mjs', 'default root wake'],
      platformHome,
    });
    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.green?.disposition, 'pass');
  } finally {
    await rm(platformHome, { recursive: true, force: true });
  }
});
