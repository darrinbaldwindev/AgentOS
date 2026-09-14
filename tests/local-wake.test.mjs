import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { createLocalWakeDryRunCapabilityProbe, main, wakeLocal } from '../runtime/local-wake.mjs';

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
    assert.equal(first.boot.capabilities.classification, 'legacy-dry-run-fixture');
    assert.equal(first.boot.capabilities.physical, false);
    assert.equal(first.boot.capabilities.evaluation.localPreferred, false);
    assert.equal(first.response.source_agent, 'agentos:deterministic-skill-agent');
    assert.equal(second.response.source_agent, 'agentos:deterministic-skill-agent');
    assert.ok(first.response.evidence.some((item) => item === 'worker:agentos:deterministic-skill-agent'));
    assert.ok(first.response.verification.some((item) => item.includes('registered worker was enabled, executable and matched every required capability')));

    const state = JSON.parse(await readFile(join(root, DEFAULT_CONFIG.stateFile), 'utf8'));
    const artifacts = Object.values(state.records.artifact);
    const responses = artifacts.filter((a) => a.artifactType === 'project-overseer.response');
    const tasks = artifacts.filter((a) => a.artifactType === 'dispatch.task');
    const wakes = Object.values(state.records.event).filter((e) => e.eventType === 'agentos.manual-wake.completed');
    assert.equal(tasks.length, 2);
    assert.equal(responses.length, 2);
    assert.equal(wakes.length, 2);
    assert.equal(wakes[0].workerId, 'agentos:deterministic-skill-agent');
    assert.equal(state.records.agent['agentos:overseer'].status, 'online');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('explicit local wake fixture is canonical evidence but never physical capability proof', async () => {
  const probe = createLocalWakeDryRunCapabilityProbe();
  const result = await probe.probe('agentos:overseer');
  assert.equal(probe.classification, 'legacy-dry-run-fixture');
  assert.equal(probe.physical, false);
  assert.equal(result.mode, 'DRY_RUN');
  assert.equal(result.classification, 'legacy-dry-run-fixture');
  assert.equal(result.physical, false);
  assert.equal(result.evaluation.results['github.read'], true);
  assert.equal(result.evaluation.results['continuity.read'], true);
  assert.equal(result.evaluation.results.handoff, true);
  assert.equal(result.evaluation.results['workspace.read'], false);
  assert.equal(result.evaluation.results['workspace.write'], false);
});

test('wake rejects a naked pre-evaluated eligible claim before dispatch or worker completion', async () => {
  const root = await makeInstall();
  try {
    await assert.rejects(
      () => wakeLocal({
        root,
        capabilityProbe: { probe: async () => ({ mode: 'DRY_RUN', evaluation: { eligible: true } }) },
      }),
      (error) => error?.code === 'OVERSEER_CAPABILITY_EVIDENCE_REQUIRED',
    );

    const state = JSON.parse(await readFile(join(root, DEFAULT_CONFIG.stateFile), 'utf8'));
    const artifacts = Object.values(state.records.artifact);
    const tasks = artifacts.filter((a) => a.artifactType === 'dispatch.task');
    const wakes = Object.values(state.records.event).filter((e) => e.eventType === 'agentos.manual-wake.completed');
    assert.equal(tasks.length, 0);
    assert.equal(wakes.length, 0);
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
    assert.equal(result.boot.capabilities.mode, 'DRY_RUN');
    const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
    assert.equal(config.autonomyEnabled, false);
  } finally {
    await rm(platformHome, { recursive: true, force: true });
  }
});
