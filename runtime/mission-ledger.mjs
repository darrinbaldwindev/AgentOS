import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';

export const MISSION_OUTCOMES = Object.freeze([
  'no_op_recovery',
  'blocked',
  'executed_awaiting_green',
  'green_verified',
  'prs_verified',
  'failed',
]);

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${field} must be a non-empty string`);
  return value;
}

function timestampPacket(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (!Number.isFinite(date.getTime())) throw new TypeError('timestamp must be valid');
  const utc = date.toISOString();
  const brisbane = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Brisbane',
    dateStyle: 'medium',
    timeStyle: 'long',
    hour12: false,
  }).format(date);
  return Object.freeze({ utc, brisbane });
}

export function createMissionRecord({ stage, scheduleId, predecessorCheckpointId = null, repoHead, intendedNextAction, actions = [], worker = null, touched = {}, tests = [], evidence = [], safety = [], blockers = [], outcome, nextCheckpointId = null, now = new Date(), missionId = `mission:${randomUUID()}` } = {}) {
  if (!['A', 'B', 'C'].includes(stage)) throw new TypeError('stage must be A, B or C');
  requireText(scheduleId, 'scheduleId');
  requireText(repoHead, 'repoHead');
  requireText(intendedNextAction, 'intendedNextAction');
  if (!MISSION_OUTCOMES.includes(outcome)) throw new TypeError(`invalid mission outcome: ${outcome}`);
  const timestamps = timestampPacket(now);
  return Object.freeze({
    schema_version: 1,
    mission_id: requireText(missionId, 'missionId'),
    timestamps,
    stage,
    schedule_id: scheduleId,
    predecessor_checkpoint_id: predecessorCheckpointId,
    starting_repo_head: repoHead,
    intended_next_action: intendedNextAction,
    actions: Object.freeze([...actions]),
    worker,
    touched: Object.freeze({ ...touched }),
    tests: Object.freeze([...tests]),
    evidence: Object.freeze([...evidence]),
    safety: Object.freeze([...safety]),
    blockers: Object.freeze([...blockers]),
    outcome,
    next_checkpoint_id: nextCheckpointId,
    scheduler_firing_is_not_completion: true,
  });
}

export function validateMissionRecord(record) {
  if (!record || typeof record !== 'object') throw new TypeError('record is required');
  for (const field of ['mission_id', 'schedule_id', 'starting_repo_head', 'intended_next_action', 'outcome']) requireText(record[field], field);
  if (!record.timestamps?.utc || !record.timestamps?.brisbane) throw new TypeError('timestamps are required');
  if (!['A', 'B', 'C'].includes(record.stage)) throw new TypeError('invalid stage');
  if (!MISSION_OUTCOMES.includes(record.outcome)) throw new TypeError('invalid outcome');
  if (record.scheduler_firing_is_not_completion !== true) throw new TypeError('completion boundary flag is required');
  return record;
}

export async function appendMissionRecord({ ledgerPath, record }) {
  requireText(ledgerPath, 'ledgerPath');
  validateMissionRecord(record);
  await fs.mkdir(dirname(ledgerPath), { recursive: true });
  const line = `${JSON.stringify(record)}\n`;
  await fs.appendFile(ledgerPath, line, 'utf8');
  return record;
}

export async function readMissionLedger({ ledgerPath }) {
  requireText(ledgerPath, 'ledgerPath');
  try {
    const text = await fs.readFile(ledgerPath, 'utf8');
    return text.split('\n').filter(Boolean).map((line) => {
      try {
        return validateMissionRecord(JSON.parse(line));
      } catch (error) {
        throw new Error(`Failed to parse mission record: ${error.message}`);
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export function summarizeMissionLedger(records = []) {
  const ordered = [...records].map(validateMissionRecord).sort((a, b) => a.timestamps.utc.localeCompare(b.timestamps.utc));
  const latestByStage = {};
  for (const record of ordered) latestByStage[record.stage] = record;
  const latest = ordered.at(-1) ?? null;
  return Object.freeze({
    schema_version: 1,
    latest_mission_id: latest?.mission_id ?? null,
    latest_timestamp_utc: latest?.timestamps.utc ?? null,
    latest_timestamp_brisbane: latest?.timestamps.brisbane ?? null,
    latest_by_stage: Object.freeze(Object.fromEntries(Object.entries(latestByStage).map(([stage, record]) => [stage, Object.freeze({ mission_id: record.mission_id, timestamp_utc: record.timestamps.utc, schedule_id: record.schedule_id, predecessor_checkpoint_id: record.predecessor_checkpoint_id, outcome: record.outcome, next_action: record.intended_next_action, next_checkpoint_id: record.next_checkpoint_id })]))),
    awaiting_verification: ordered.filter((record) => record.outcome === 'executed_awaiting_green').map((record) => record.mission_id),
    blockers: ordered.flatMap((record) => record.blockers.map((blocker) => ({ mission_id: record.mission_id, blocker }))),
  });
}

export function missionLedgerPaths(root) {
  requireText(root, 'root');
  return Object.freeze({ ledger: join(root, 'state', 'mission-ledger.ndjson'), index: join(root, 'state', 'mission-ledger-index.json') });
}

export async function writeMissionLedgerIndex({ indexPath, records }) {
  requireText(indexPath, 'indexPath');
  await fs.mkdir(dirname(indexPath), { recursive: true });
  const summary = summarizeMissionLedger(records);
  await fs.writeFile(indexPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  return summary;
}
