import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appendMissionRecord, createMissionRecord, readMissionLedger, summarizeMissionLedger, writeMissionLedgerIndex } from '../runtime/mission-ledger.mjs';

const base = { stage: 'A', scheduleId: 'AgentOS Control Loop A', predecessorCheckpointId: 'C-000', repoHead: 'abc123', intendedNextAction: 'verify exact predecessor state', outcome: 'no_op_recovery' };

test('mission record has unique identity and exact UTC plus Brisbane timestamp', () => {
  const record = createMissionRecord({ ...base, missionId: 'mission:test-001', now: new Date('2026-09-06T13:00:00.000Z') });
  assert.equal(record.mission_id, 'mission:test-001');
  assert.equal(record.timestamps.utc, '2026-09-06T13:00:00.000Z');
  assert.match(record.timestamps.brisbane, /2026|Sep/);
  assert.equal(record.scheduler_firing_is_not_completion, true);
});

test('A to B to C records correlate through predecessor checkpoint ids', () => {
  const a = createMissionRecord({ ...base, missionId: 'A-1', nextCheckpointId: 'A-CP-1' });
  const b = createMissionRecord({ ...base, stage: 'B', missionId: 'B-1', predecessorCheckpointId: 'A-CP-1', nextCheckpointId: 'B-CP-1', outcome: 'green_verified' });
  const c = createMissionRecord({ ...base, stage: 'C', missionId: 'C-1', predecessorCheckpointId: 'B-CP-1', outcome: 'prs_verified' });
  assert.equal(b.predecessor_checkpoint_id, a.next_checkpoint_id);
  assert.equal(c.predecessor_checkpoint_id, b.next_checkpoint_id);
});

test('blocked, failed and awaiting-verification outcomes remain explicit', () => {
  for (const outcome of ['blocked', 'failed', 'executed_awaiting_green']) {
    const record = createMissionRecord({ ...base, missionId: `mission:${outcome}`, outcome });
    assert.equal(record.outcome, outcome);
  }
});

test('append/read ledger is durable and index exposes current state', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-ledger-'));
  try {
    const ledger = join(root, 'state', 'mission-ledger.ndjson'); const index = join(root, 'state', 'mission-ledger-index.json');
    const a = createMissionRecord({ ...base, missionId: 'A-1', nextCheckpointId: 'A-CP-1' });
    const b = createMissionRecord({ ...base, stage: 'B', missionId: 'B-1', predecessorCheckpointId: 'A-CP-1', outcome: 'executed_awaiting_green' });
    await appendMissionRecord({ ledgerPath: ledger, record: a }); await appendMissionRecord({ ledgerPath: ledger, record: b });
    const records = await readMissionLedger({ ledgerPath: ledger }); const summary = await writeMissionLedgerIndex({ indexPath: index, records });
    assert.equal(records.length, 2); assert.deepEqual(summary.awaiting_verification, ['B-1']); assert.equal(JSON.parse(await readFile(index, 'utf8')).latest_mission_id, 'B-1');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('summary includes blockers and latest stage state', () => {
  const blocked = createMissionRecord({ ...base, missionId: 'C-1', stage: 'C', blockers: ['awaiting Green evidence'], outcome: 'blocked' });
  const summary = summarizeMissionLedger([blocked]);
  assert.equal(summary.latest_by_stage.C.outcome, 'blocked'); assert.equal(summary.blockers[0].blocker, 'awaiting Green evidence');
});

test('malformed NDJSON fails with a controlled mission-ledger parse error', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-ledger-malformed-'));
  try {
    const ledger = join(root, 'state', 'mission-ledger.ndjson');
    await appendMissionRecord({ ledgerPath: ledger, record: createMissionRecord({ ...base, missionId: 'valid-1' }) });
    const existing = await readFile(ledger, 'utf8');
    await import('node:fs/promises').then(({ appendFile }) => appendFile(ledger, '{not-json}\n', 'utf8'));
    await assert.rejects(() => readMissionLedger({ ledgerPath: ledger }), /Failed to parse mission record/);
    assert.match(existing, /valid-1/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('mission records reject invalid outcomes and required fields', () => {
  assert.throws(() => createMissionRecord({ ...base, outcome: 'completed' }), /invalid mission outcome/);
  assert.throws(() => createMissionRecord({ ...base, repoHead: '' }), /repoHead must be a non-empty string/);
});
