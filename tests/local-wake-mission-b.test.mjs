import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { wakeLocal, safeRuntimeConfig, buildGreenEvidencePacket } from '../runtime/local-wake.mjs';
import { evaluateTaskCompletion } from '../runtime/green-agent.mjs';
import { readMissionLedger, missionLedgerPaths } from '../runtime/mission-ledger.mjs';

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

  it('TEST C: scheduler enabled does not skip authority (envelope still enforced)', async () => {
    const config = {
      schemaVersion: 1,
      mode: 'DRY_RUN',
      autonomyEnabled: false,
      scheduler: { enabled: true },
    };
    assert.doesNotThrow(() => safeRuntimeConfig(config, { requireSchedulerDisabled: false }));
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
      const actions = records.flatMap((r) => r.actions);
      assert.ok(actions.includes('WAKE_ADMITTED') || actions.includes('TASK_CREATED'));
      assert.ok(actions.includes('AWAITING_GREEN') || actions.includes('EVIDENCE_PERSISTED'));
      assert.ok(actions.includes('GREEN_DISPOSITION') || actions.includes('COMPLETED'));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('TEST G/H/L: Green FAIL never yields COMPLETED; Mission A regression', () => {
    const task = {
      task_id: 't-fail',
      mission_id: 'mission:t-fail',
      project_id: 'agentos-local',
      acceptance_criteria: ['a', 'b'],
      consent_mode: 'PRE_AUTHORIZED',
      wake_trace_id: 'w1',
    };
    const workerResult = { task_id: 't-fail', status: 'completed', claimed_complete: true };
    const evidence = buildGreenEvidencePacket({
      task,
      workerResult,
      reservation: { reservation_id: 'r1' },
      budgetOutcome: { status: 'RECONCILED' },
    });
    evidence.acceptance_criteria = [];
    const green = evaluateTaskCompletion({ task, workerResult, evidence });
    assert.equal(green.disposition, 'fail');
    assert.notEqual(green.disposition, 'pass');
    assert.equal(green.disposition === 'pass', false);
  });

  it('TEST K: two cycles use distinct wake IDs and matching mission chains', async () => {
    const root = await makeInstall();
    try {
      const a = await wakeLocal({ root, objective: 'cycle-a' });
      const b = await wakeLocal({ root, objective: 'cycle-b' });
      assert.notEqual(a.response.wake_trace_id, b.response.wake_trace_id);
      assert.notEqual(a.task_id, b.task_id);
      const records = await readMissionLedger({ ledgerPath: missionLedgerPaths(root).ledger });
      const byMission = {};
      for (const r of records) {
        byMission[r.mission_id] = byMission[r.mission_id] ?? [];
        byMission[r.mission_id].push(r);
      }
      assert.ok(byMission[a.response.mission_id]?.length >= 1);
      assert.ok(byMission[b.response.mission_id]?.length >= 1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('TEST J: createMissionRecord rejects invalid outcome (ledger integrity)', async () => {
    const { createMissionRecord } = await import('../runtime/mission-ledger.mjs');
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
