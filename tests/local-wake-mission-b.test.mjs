import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { wakeLocal, safeRuntimeConfig, buildGreenEvidencePacket } from '../runtime/local-wake.mjs';
import { evaluateTaskCompletion } from '../runtime/green-agent.mjs';
import { readMissionLedger, missionLedgerPaths, createMissionRecord } from '../runtime/mission-ledger.mjs';

async function makeInstall() {
  const root = await mkdtemp(join(tmpdir(), 'agentos-mb-'));
  await installLocal({ root });
  return root;
}

describe('Mission B — canonical local-wake + ledger', () => {
  it('TEST A: requireSchedulerDisabled fails closed when scheduler enabled', async () => {
    const root = await makeInstall();
    try {
      const configPath = join(root, 'config.json');
      const config = JSON.parse(await readFile(configPath, 'utf8'));
      config.scheduler = { ...(config.scheduler ?? {}), enabled: true };
      await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
      await assert.rejects(
        () => wakeLocal({ root, requireSchedulerDisabled: true }),
        /LOCAL_WAKE_REQUIRES_SCHEDULER_DISABLED/,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('TEST B: scheduler path allowed when requireSchedulerDisabled is false', () => {
    const config = {
      schemaVersion: 1,
      mode: 'DRY_RUN',
      autonomyEnabled: false,
      scheduler: { enabled: true },
    };
    assert.doesNotThrow(() => safeRuntimeConfig(config, { requireSchedulerDisabled: false }));
  });

  it('TEST C: scheduler enabled does not grant autonomy (still fails if autonomy true)', () => {
    const config = {
      schemaVersion: 1,
      mode: 'DRY_RUN',
      autonomyEnabled: true,
      scheduler: { enabled: true },
    };
    assert.throws(() => safeRuntimeConfig(config, { requireSchedulerDisabled: false }), /LOCAL_WAKE_REQUIRES_SAFE_MODE/);
  });

  it('TEST D: DRY_RUN still required regardless of scheduler flag', () => {
    const config = {
      schemaVersion: 1,
      mode: 'LIVE',
      autonomyEnabled: false,
      scheduler: { enabled: false },
    };
    assert.throws(() => safeRuntimeConfig(config, { requireSchedulerDisabled: true }), /LOCAL_WAKE_REQUIRES_SAFE_MODE/);
  });

  it('TEST E: autonomy enabled fails closed', () => {
    const config = {
      schemaVersion: 1,
      mode: 'DRY_RUN',
      autonomyEnabled: true,
      scheduler: { enabled: false },
    };
    assert.throws(() => safeRuntimeConfig(config), /LOCAL_WAKE_REQUIRES_SAFE_MODE/);
  });

  it('TEST F: successful cycle leaves reconstructable ledger chain ending COMPLETED', async () => {
    const root = await makeInstall();
    try {
      const result = await wakeLocal({ root, objective: 'mission-b success cycle' });
      assert.equal(result.status, 'COMPLETED');
      assert.equal(result.green?.disposition, 'pass');
      const paths = missionLedgerPaths(root);
      const records = await readMissionLedger({ ledgerPath: paths.ledger });
      assert.ok(records.length >= 3);
      const outcomes = records.map((r) => r.outcome);
      assert.ok(outcomes.includes('executed_awaiting_green'));
      assert.ok(outcomes.includes('green_verified'));
      const missionIds = new Set(records.map((r) => r.mission_id));
      assert.equal(missionIds.size, 1);
      assert.equal([...missionIds][0], result.response.mission_id);
      const state = JSON.parse(await readFile(join(root, DEFAULT_CONFIG.stateFile), 'utf8'));
      const completed = Object.values(state.records.artifact).filter(
        (a) => a.artifactType === 'project-overseer.response' && a.payload?.status === 'COMPLETED',
      );
      assert.equal(completed.length, 1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('TEST G: identity-mismatch Green FAIL yields no PASS', () => {
    const task = {
      task_id: 't-fail',
      mission_id: 'mission:t-fail',
      project_id: 'agentos-local',
      acceptance_criteria: ['a', 'b'],
      consent_mode: 'PRE_AUTHORIZED',
      wake_trace_id: 'w1',
    };
    const workerResult = { task_id: 'wrong', status: 'completed', claimed_complete: true };
    const evidence = buildGreenEvidencePacket({
      task,
      workerResult: { task_id: 't-fail', status: 'completed', claimed_complete: true },
      reservation: { reservation_id: 'r1' },
      budgetOutcome: { status: 'RECONCILED' },
    });
    const green = evaluateTaskCompletion({ task, workerResult, evidence });
    assert.equal(green.disposition, 'fail');
  });

  it('TEST H: Green exception path is fail-closed', () => {
    assert.throws(() => evaluateTaskCompletion({ task: null, workerResult: {} }), /task is required/);
  });

  it('TEST K: two cycles use distinct wake IDs', async () => {
    const root = await makeInstall();
    try {
      const a = await wakeLocal({ root, objective: 'cycle-a' });
      const b = await wakeLocal({ root, objective: 'cycle-b' });
      assert.notEqual(a.response.wake_trace_id, b.response.wake_trace_id);
      assert.notEqual(a.task_id, b.task_id);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('TEST J: createMissionRecord rejects invalid outcome', () => {
    assert.throws(
      () =>
        createMissionRecord({
          stage: 'A',
          scheduleId: 's1',
          repoHead: 'local',
          intendedNextAction: 'x',
          outcome: 'not_a_real_outcome',
        }),
      /invalid mission outcome/,
    );
  });
});
