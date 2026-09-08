import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { schedulerTick } from '../scripts/scheduler-tick.mjs';
import { readMissionLedger } from '../runtime/mission-ledger.mjs';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'agentos-scheduler-ledger-'));
}

test('scheduler tick appends an execution mission record and current-state index', async () => {
  const root = await tempRoot();
  const result = await schedulerTick({
    root,
    stage: 'A',
    scheduleId: 'test:A',
    predecessorCheckpointId: 'checkpoint:C:previous',
    nextCheckpointId: 'checkpoint:A:test',
    objective: 'execute exact scheduled control-loop action',
    now: new Date('2026-09-07T00:00:00.000Z'),
    wake: async ({ objective }) => ({
      status: 'COMPLETED',
      task_id: 'task:test',
      response: {
        mission_id: 'mission:test',
        wake_trace_id: 'wake:test',
        source_agent: 'worker:test',
        completed_at: '2026-09-07T00:00:01.000Z',
        repository_commit: 'repo:test-head',
        verification: ['bounded execution verified'],
        evidence: ['evidence:test'],
        blockers: [],
        objective,
      },
    }),
  });

  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.mission_record.mission_id, 'mission:test');
  assert.equal(result.mission_record.stage, 'A');
  assert.equal(result.mission_record.schedule_id, 'test:A');
  assert.equal(result.mission_record.predecessor_checkpoint_id, 'checkpoint:C:previous');
  assert.equal(result.mission_record.starting_repo_head, 'repo:test-head');
  assert.equal(result.mission_record.outcome, 'executed_awaiting_green');
  assert.equal(result.mission_record.next_checkpoint_id, 'checkpoint:A:test');
  assert.equal(result.mission_record.scheduler_firing_is_not_completion, true);
  assert.ok(result.mission_record.evidence.includes('wake-trace:wake:test'));

  const ledger = await readMissionLedger({ ledgerPath: join(root, 'state', 'mission-ledger.ndjson') });
  assert.equal(ledger.length, 1);
  const index = JSON.parse(await readFile(join(root, 'state', 'mission-ledger-index.json'), 'utf8'));
  assert.equal(index.latest_mission_id, 'mission:test');
  assert.equal(index.latest_by_stage.A.outcome, 'executed_awaiting_green');
});

test('scheduler failure is durably recorded as failed mission evidence', async () => {
  const root = await tempRoot();
  const result = await schedulerTick({
    root,
    stage: 'B',
    scheduleId: 'test:B',
    objective: 'verify scheduled control-loop action',
    wake: async () => { throw Object.assign(new Error('WAKE_TEST_FAILURE'), { code: 'WAKE_TEST_FAILURE' }); },
  });

  assert.equal(result.status, 'FAILED');
  assert.equal(result.mission_record.stage, 'B');
  assert.equal(result.mission_record.outcome, 'failed');
  assert.deepEqual(result.mission_record.blockers, ['WAKE_TEST_FAILURE']);

  const ledger = await readMissionLedger({ ledgerPath: join(root, 'state', 'mission-ledger.ndjson') });
  assert.equal(ledger.length, 1);
  assert.equal(ledger[0].mission_id.startsWith('scheduler:test:B:'), true);
  assert.equal(ledger[0].outcome, 'failed');
});

test('mission-ledger persistence verification failure returns a controlled fail-closed result', async () => {
  const root = await tempRoot();
  let attempts = 0;
  const result = await schedulerTick({
    root,
    stage: 'C',
    scheduleId: 'test:C',
    predecessorCheckpointId: 'checkpoint:B:test',
    objective: 'assure exact scheduled control-loop action',
    now: new Date('2026-09-08T01:00:00.000Z'),
    wake: async () => ({
      status: 'COMPLETED',
      task_id: 'task:persistence-failure',
      response: {
        mission_id: 'mission:persistence-failure',
        wake_trace_id: 'wake:persistence-failure',
        source_agent: 'worker:test',
        completed_at: '2026-09-08T01:00:01.000Z',
        repository_commit: 'repo:test-head',
        verification: [],
        evidence: [],
        blockers: [],
      },
    }),
    missionAppender: async () => {
      attempts += 1;
      throw new Error('MISSION_LEDGER_PERSISTENCE_VERIFICATION_FAILED');
    },
  });

  assert.equal(attempts, 2);
  assert.equal(result.status, 'FAILED');
  assert.equal(result.mission_record, null);
  assert.equal(result.mission_persistence_failed, true);
  assert.equal(result.fail_closed, true);
  assert.equal(result.mission_persistence_error.message, 'MISSION_LEDGER_PERSISTENCE_VERIFICATION_FAILED');
  assert.ok(result.fallback_evidence_path.endsWith('scheduler-runs.jsonl'));

  const schedulerRuns = (await readFile(join(root, 'state', 'scheduler-runs.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(schedulerRuns.length, 3);
  const fallback = schedulerRuns.at(-1);
  assert.equal(fallback.status, 'FAILED');
  assert.equal(fallback.stage, 'C');
  assert.equal(fallback.schedule_id, 'test:C');
  assert.equal(fallback.predecessor_checkpoint_id, 'checkpoint:B:test');
  assert.equal(fallback.outcome, 'failed');
  assert.equal(fallback.fail_closed, true);
  assert.equal(fallback.mission_persistence_error.message, 'MISSION_LEDGER_PERSISTENCE_VERIFICATION_FAILED');
});
