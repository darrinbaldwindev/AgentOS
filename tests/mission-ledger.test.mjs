import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  appendMissionRecord,
  createMissionRecord,
  missionLedgerPaths,
  readMissionLedger,
  summarizeMissionLedger,
  writeMissionLedgerIndex,
} from '../runtime/mission-ledger.mjs';

test('mission record has unique identity and exact UTC plus Brisbane timestamp', () => {
  const record = createMissionRecord({
    stage: 'A',
    scheduleId: 'sched-1',
    repoHead: 'abc',
    intendedNextAction: 'run',
    outcome: 'no_op_recovery',
  });
  assert.equal(record.schema_version, 1);
  assert.ok(record.mission_id.startsWith('mission:'));
  assert.ok(record.timestamps.utc);
  assert.ok(record.timestamps.brisbane);
  assert.equal(record.scheduler_firing_is_not_completion, true);
});

test('A to B to C records correlate through predecessor checkpoint ids', () => {
  const a = createMissionRecord({ stage: 'A', scheduleId: 's', repoHead: 'h', intendedNextAction: 'b', outcome: 'no_op_recovery', missionId: 'mission:1' });
  const b = createMissionRecord({ stage: 'B', scheduleId: 's', repoHead: 'h', intendedNextAction: 'c', outcome: 'executed_awaiting_green', missionId: 'mission:1', predecessorCheckpointId: 'cp-a' });
  const c = createMissionRecord({ stage: 'C', scheduleId: 's', repoHead: 'h', intendedNextAction: 'none', outcome: 'green_verified', missionId: 'mission:1', predecessorCheckpointId: 'cp-b' });
  assert.equal(a.mission_id, b.mission_id);
  assert.equal(b.mission_id, c.mission_id);
  assert.equal(b.predecessor_checkpoint_id, 'cp-a');
  assert.equal(c.predecessor_checkpoint_id, 'cp-b');
});

test('blocked, failed and awaiting-verification outcomes remain explicit', () => {
  for (const outcome of ['blocked', 'failed', 'executed_awaiting_green', 'green_verified']) {
    const record = createMissionRecord({ stage: 'C', scheduleId: 's', repoHead: 'h', intendedNextAction: 'x', outcome });
    assert.equal(record.outcome, outcome);
  }
});

test('append/read ledger is durable and index exposes current state', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ledger-'));
  try {
    const paths = missionLedgerPaths(root);
    const record = createMissionRecord({ stage: 'A', scheduleId: 's1', repoHead: 'h', intendedNextAction: 'next', outcome: 'no_op_recovery', missionId: 'mission:x' });
    await appendMissionRecord({ ledgerPath: paths.ledger, record });
    const records = await readMissionLedger({ ledgerPath: paths.ledger });
    assert.equal(records.length, 1);
    assert.equal(records[0].mission_id, 'mission:x');
    const summary = await writeMissionLedgerIndex({ indexPath: paths.index, records });
    assert.equal(summary.latest_mission_id, 'mission:x');
    const indexText = await readFile(paths.index, 'utf8');
    assert.ok(indexText.includes('mission:x'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('summary includes blockers and latest stage state', () => {
  const records = [
    createMissionRecord({ stage: 'A', scheduleId: 's', repoHead: 'h', intendedNextAction: 'b', outcome: 'no_op_recovery', missionId: 'mission:1' }),
    createMissionRecord({ stage: 'B', scheduleId: 's', repoHead: 'h', intendedNextAction: 'c', outcome: 'executed_awaiting_green', missionId: 'mission:1', blockers: ['x'] }),
  ];
  const summary = summarizeMissionLedger(records);
  assert.equal(summary.awaiting_verification.length, 1);
  assert.equal(summary.blockers.length, 1);
});

test('malformed NDJSON fails with a controlled mission-ledger parse error', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ledger-bad-'));
  try {
    const paths = missionLedgerPaths(root);
    const { writeFile, mkdir } = await import('node:fs/promises');
    await mkdir(join(root, 'state'), { recursive: true });
    await writeFile(paths.ledger, '{not-json}\n', 'utf8');
    await assert.rejects(() => readMissionLedger({ ledgerPath: paths.ledger }), /Failed to parse mission record/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('mission records reject invalid outcomes and required fields', () => {
  assert.throws(() => createMissionRecord({ stage: 'A', scheduleId: 's', repoHead: 'h', intendedNextAction: 'x', outcome: 'nope' }), /invalid mission outcome/);
  assert.throws(() => createMissionRecord({ stage: 'Z', scheduleId: 's', repoHead: 'h', intendedNextAction: 'x', outcome: 'blocked' }), /stage must be/);
});
