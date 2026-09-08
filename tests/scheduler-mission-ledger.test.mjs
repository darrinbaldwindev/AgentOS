import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { appendFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installLocal } from '../scripts/install-local.mjs';
import { appendMission, parseSchedulerArgs, schedulerTick } from '../scripts/scheduler-tick.mjs';
import { readMissionLedger, writeMissionLedgerIndex } from '../runtime/mission-ledger.mjs';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'agentos-scheduler-ledger-'));
}

function completedWake(missionId = 'mission:test') {
  return async () => ({
    status: 'COMPLETED',
    task_id: `task:${missionId}`,
    response: {
      mission_id: missionId,
      wake_trace_id: `wake:${missionId}`,
      source_agent: 'worker:test',
      completed_at: '2026-09-08T01:00:01.000Z',
      repository_commit: 'repo:test-head',
      verification: [],
      evidence: [],
      blockers: [],
    },
  });
}

async function assertControlledVerificationFailure({ expectedError, missionAppender }) {
  const root = await tempRoot();
  const result = await schedulerTick({
    root,
    stage: 'C',
    scheduleId: `test:${expectedError}`,
    predecessorCheckpointId: 'checkpoint:B:test',
    objective: 'assure exact scheduled control-loop action',
    now: new Date('2026-09-08T01:00:00.000Z'),
    wake: completedWake(`mission:${expectedError}`),
    missionAppender,
  });

  assert.equal(result.status, 'FAILED');
  assert.equal(result.mission_record, null);
  assert.equal(result.mission_persistence_failed, true);
  assert.equal(result.fail_closed, true);
  assert.equal(result.mission_persistence_error.message, expectedError);
  assert.ok(result.fallback_evidence_path.endsWith('scheduler-runs.jsonl'));
  return { root, result };
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

test('scheduled CLI metadata preserves stage and predecessor correlation into the mission record', async () => {
  const root = await tempRoot();
  const args = parseSchedulerArgs([
    '--root', root,
    '--stage', 'B',
    '--schedule-id', 'AgentOS Control Loop B',
    '--predecessor-checkpoint-id', 'checkpoint:A:live-001',
    '--next-checkpoint-id', 'checkpoint:B:live-001',
    'verify live scheduled control-loop stage',
  ]);

  assert.equal(args.stage, 'B');
  assert.equal(args.scheduleId, 'AgentOS Control Loop B');
  assert.equal(args.predecessorCheckpointId, 'checkpoint:A:live-001');
  assert.equal(args.nextCheckpointId, 'checkpoint:B:live-001');

  const result = await schedulerTick({
    ...args,
    now: new Date('2026-09-08T03:00:00.000Z'),
    wake: completedWake('mission:live-cli-b'),
  });

  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.mission_record.stage, 'B');
  assert.equal(result.mission_record.schedule_id, 'AgentOS Control Loop B');
  assert.equal(result.mission_record.predecessor_checkpoint_id, 'checkpoint:A:live-001');
  assert.equal(result.mission_record.next_checkpoint_id, 'checkpoint:B:live-001');

  const ledger = await readMissionLedger({ ledgerPath: join(root, 'state', 'mission-ledger.ndjson') });
  assert.equal(ledger.at(-1).mission_id, 'mission:live-cli-b');
  assert.equal(ledger.at(-1).predecessor_checkpoint_id, 'checkpoint:A:live-001');
  const index = JSON.parse(await readFile(join(root, 'state', 'mission-ledger-index.json'), 'utf8'));
  assert.equal(index.latest_by_stage.B.mission_id, 'mission:live-cli-b');
});

test('fresh scheduler process writes and verifies correlated mission-ledger evidence', async () => {
  const root = await tempRoot();
  await installLocal({ root });
  const entrypoint = fileURLToPath(new URL('../scripts/scheduler-tick.mjs', import.meta.url));
  try {
    const args = [
      entrypoint,
      '--root', root,
      '--stage', 'A',
      '--schedule-id', 'AgentOS Control Loop A process test',
      '--predecessor-checkpoint-id', 'checkpoint:C:process-001',
      '--next-checkpoint-id', 'checkpoint:A:process-001',
      'execute fresh-process scheduled mission-ledger proof',
    ];
    const child = spawn(process.execPath, args, {
      env: { ...process.env, AGENTOS_REPO_HEAD: 'repo:process-test-head' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    const exitCode = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', resolve);
    });

    assert.equal(exitCode, 0, stderr || stdout);
    const result = JSON.parse(stdout);
    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.mission_record.stage, 'A');
    assert.equal(result.mission_record.schedule_id, 'AgentOS Control Loop A process test');
    assert.equal(result.mission_record.predecessor_checkpoint_id, 'checkpoint:C:process-001');
    assert.equal(result.mission_record.next_checkpoint_id, 'checkpoint:A:process-001');
    assert.equal(result.mission_record.outcome, 'executed_awaiting_green');

    const ledger = await readMissionLedger({ ledgerPath: join(root, 'state', 'mission-ledger.ndjson') });
    const persisted = ledger.find((record) => record.mission_id === result.mission_record.mission_id);
    assert.ok(persisted);
    assert.equal(persisted.stage, 'A');
    assert.equal(persisted.schedule_id, 'AgentOS Control Loop A process test');
    assert.equal(persisted.predecessor_checkpoint_id, 'checkpoint:C:process-001');
    assert.equal(persisted.next_checkpoint_id, 'checkpoint:A:process-001');
    assert.equal(persisted.outcome, 'executed_awaiting_green');

    const index = JSON.parse(await readFile(join(root, 'state', 'mission-ledger-index.json'), 'utf8'));
    assert.equal(index.latest_mission_id, persisted.mission_id);
    assert.equal(index.latest_by_stage.A.mission_id, persisted.mission_id);
    assert.equal(index.latest_by_stage.A.predecessor_checkpoint_id, 'checkpoint:C:process-001');
    assert.equal(index.latest_by_stage.A.next_checkpoint_id, 'checkpoint:A:process-001');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
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

test('missing mission re-read record reaches controlled fail-closed fallback with original error', async () => {
  await assertControlledVerificationFailure({
    expectedError: 'MISSION_LEDGER_PERSISTENCE_VERIFICATION_FAILED',
    missionAppender: (root, args) => appendMission(root, { ...args, ledgerReader: async () => [] }),
  });
});

test('mission correlation mismatch reaches controlled fail-closed fallback with original error', async () => {
  await assertControlledVerificationFailure({
    expectedError: 'MISSION_LEDGER_CORRELATION_VERIFICATION_FAILED',
    missionAppender: (root, args) => appendMission(root, {
      ...args,
      ledgerReader: async (options) => (await readMissionLedger(options)).map((record) => record.mission_id === args.missionId ? { ...record, stage: record.stage === 'A' ? 'B' : 'A' } : record),
    }),
  });
});

test('mission index verification failure reaches controlled fail-closed fallback with original error', async () => {
  await assertControlledVerificationFailure({
    expectedError: 'MISSION_LEDGER_INDEX_VERIFICATION_FAILED',
    missionAppender: (root, args) => appendMission(root, {
      ...args,
      indexWriter: async ({ indexPath, records }) => {
        const index = await writeMissionLedgerIndex({ indexPath, records });
        return { ...index, latest_by_stage: { ...index.latest_by_stage, [args.stage]: { ...index.latest_by_stage[args.stage], mission_id: 'mission:wrong-index-pointer' } } };
      },
    }),
  });
});

test('fallback evidence write failure surfaces explicitly and cannot return success', async () => {
  const root = await tempRoot();
  let evidenceWrites = 0;
  const evidenceAppender = async (targetRoot, record) => {
    evidenceWrites += 1;
    if (evidenceWrites === 3) throw new Error('SCHEDULER_FALLBACK_EVIDENCE_WRITE_FAILED');
    const stateDir = join(targetRoot, 'state');
    const path = join(stateDir, 'scheduler-runs.jsonl');
    await mkdir(stateDir, { recursive: true });
    await appendFile(path, `${JSON.stringify(record)}\n`, 'utf8');
    return path;
  };

  await assert.rejects(
    schedulerTick({
      root,
      stage: 'C',
      scheduleId: 'test:fallback-write-failure',
      predecessorCheckpointId: 'checkpoint:B:test',
      now: new Date('2026-09-08T01:00:00.000Z'),
      wake: completedWake('mission:fallback-write-failure'),
      missionAppender: async () => { throw new Error('MISSION_LEDGER_INDEX_VERIFICATION_FAILED'); },
      evidenceAppender,
    }),
    /SCHEDULER_FALLBACK_EVIDENCE_WRITE_FAILED/,
  );
  assert.equal(evidenceWrites, 3);
});
