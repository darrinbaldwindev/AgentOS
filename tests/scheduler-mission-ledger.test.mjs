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
  assert.equal(result.mission_record.stage, 'A');
  assert.equal(result.mission_record.schedule_id, 'test:A');
  assert.equal(result.mission_record.predecessor_checkpoint_id, 'checkpoint:C:previous');
  assert.equal(result.mission_record.starting_repo_head, 'repo:test-head');
  assert.equal(result.mission_record.outcome, 'executed_awaiting_green');
  assert.equal(result.mission_record.next_checkpoint_id, 'checkpoint:A:test');
  assert.equal(result.mission_record.scheduler_firing_is_not_completion, true);

  const ledger = await readMissionLedger({ ledgerPath: join(root, 'state', 'mission-ledger.ndjson') });
  assert.equal(ledger.length, 1);
  const index = JSON.parse(await readFile(join(root, 'state', 'mission-ledger-index.json'), 'utf8'));
  assert.equal(index.latest_mission_id, result.mission_record.mission_id);
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
  assert.equal(ledger[0].outcome, 'failed');
});
