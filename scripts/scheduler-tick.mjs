#!/usr/bin/env node
// SCHEDULER-BRIDGE-001: one governed external-scheduler wake. Safe by default.
import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import { appendMissionRecord, createMissionRecord, missionLedgerPaths, readMissionLedger, writeMissionLedgerIndex } from '../runtime/mission-ledger.mjs';
import { wakeLocal } from '../runtime/local-wake.mjs';
import { resolveInstallRoot } from './install-local.mjs';

export const CONTROL_LOOP_SCHEDULE_IDS = Object.freeze({ A: 'AgentOS Control Loop A', B: 'AgentOS Control Loop B', C: 'AgentOS Control Loop C' });

async function appendRecord(root, record) { const path = join(resolve(root), 'state', 'scheduler-runs.jsonl'); await fs.mkdir(join(resolve(root), 'state'), { recursive: true }); await fs.appendFile(path, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 }); try { await fs.chmod(path, 0o600); } catch {} return path; }
function resolveStage(stage = process.env.AGENTOS_CONTROL_STAGE || 'A') { if (!['A', 'B', 'C'].includes(stage)) throw new Error('CONTROL_STAGE_INVALID'); return stage; }
function resolveScheduleId(scheduleId = process.env.AGENTOS_SCHEDULE_ID || 'local-scheduler-tick') { if (typeof scheduleId !== 'string' || !scheduleId.trim()) throw new Error('SCHEDULE_ID_REQUIRED'); return scheduleId; }
function resolveCheckpointId(value, envName) { const resolved = value ?? process.env[envName] ?? null; if (resolved === null) return null; if (typeof resolved !== 'string' || !resolved.trim()) throw new Error(`${envName}_INVALID`); return resolved; }
function resolveRepoHead(result) { return result?.response?.repository_commit || process.env.AGENTOS_REPO_HEAD || 'unknown:local-runtime'; }

export function validateStrictControlChain({ stage, scheduleId, predecessorCheckpointId }) {
  const expected = CONTROL_LOOP_SCHEDULE_IDS[stage];
  if (!predecessorCheckpointId || typeof predecessorCheckpointId !== 'string' || !predecessorCheckpointId.trim()) throw new Error('CONTROL_PREDECESSOR_REQUIRED');
  if (scheduleId.startsWith('AgentOS Control Loop ') && scheduleId !== expected) throw new Error('CONTROL_STAGE_SCHEDULE_MISMATCH');
  return true;
}

export async function appendMission(root, { missionId, stage, scheduleId, predecessorCheckpointId, repoHead, intendedNextAction, actions, worker, touched, tests, evidence, safety, blockers, outcome, nextCheckpointId, now, missionWriter = appendMissionRecord, ledgerReader = readMissionLedger, indexWriter = writeMissionLedgerIndex }) {
  const paths = missionLedgerPaths(resolve(root));
  const record = createMissionRecord({ missionId, stage, scheduleId, predecessorCheckpointId, repoHead, intendedNextAction, actions, worker, touched, tests, evidence, safety, blockers, outcome, nextCheckpointId, now });
  await missionWriter({ ledgerPath: paths.ledger, record });
  const records = await ledgerReader({ ledgerPath: paths.ledger }); const persisted = records.find((candidate) => candidate.mission_id === record.mission_id);
  if (!persisted) throw new Error('MISSION_LEDGER_PERSISTENCE_VERIFICATION_FAILED');
  if (persisted.stage !== record.stage || persisted.schedule_id !== record.schedule_id || persisted.predecessor_checkpoint_id !== record.predecessor_checkpoint_id || persisted.outcome !== record.outcome) throw new Error('MISSION_LEDGER_CORRELATION_VERIFICATION_FAILED');
  const index = await indexWriter({ indexPath: paths.index, records }); if (index.latest_by_stage?.[record.stage]?.mission_id !== record.mission_id) throw new Error('MISSION_LEDGER_INDEX_VERIFICATION_FAILED'); return record;
}

export async function schedulerTick({ root = resolveInstallRoot(), objective, stage = resolveStage(), scheduleId = resolveScheduleId(), predecessorCheckpointId = resolveCheckpointId(undefined, 'AGENTOS_PREDECESSOR_CHECKPOINT_ID'), nextCheckpointId = resolveCheckpointId(undefined, 'AGENTOS_NEXT_CHECKPOINT_ID'), now = new Date(), wake = wakeLocal, missionAppender = appendMission, evidenceAppender = appendRecord } = {}) {
  const startedAt = now instanceof Date ? now.toISOString() : new Date(now).toISOString(); const intendedNextAction = objective || 'perform one bounded local AgentOS control-cycle action';
  try {
    validateStrictControlChain({ stage, scheduleId, predecessorCheckpointId });
    const result = await wake({ root, objective: intendedNextAction });
    const record = { status: result.status, task_id: result.task_id, mission_id: result.response.mission_id, wake_trace_id: result.response.wake_trace_id, source_agent: result.response.source_agent, worker_id: result.response.source_agent, started_at: startedAt, completed_at: result.response.completed_at, evidence: result.response.evidence };
    const evidencePath = await evidenceAppender(root, record);
    const mission = await missionAppender(root, { missionId: result.response.mission_id, stage, scheduleId, predecessorCheckpointId, repoHead: resolveRepoHead(result), intendedNextAction, actions: ['scheduler wake invoked governed local runtime'], worker: result.response.source_agent, touched: { evidence_path: evidencePath }, tests: result.response.verification || [], evidence: [...(result.response.evidence || []), `scheduler-run:${evidencePath}`, `wake-trace:${result.response.wake_trace_id}`], safety: ['scheduler firing is not completion', 'DRY_RUN/autonomy-disabled boundary preserved by local wake'], blockers: result.response.blockers || [], outcome: 'executed_awaiting_green', nextCheckpointId, now });
    return Object.freeze({ ...record, evidence_path: evidencePath, mission_record: mission });
  } catch (error) {
    const record = { status: 'FAILED', started_at: startedAt, completed_at: new Date().toISOString(), error: { code: error?.code ?? error?.message ?? 'SCHEDULER_TICK_FAILED', message: error?.message ?? String(error) } };
    const evidencePath = await evidenceAppender(root, record);
    // Missing/invalid strict-chain correlation is intentionally not converted into a mission record.
    if (['CONTROL_PREDECESSOR_REQUIRED', 'CONTROL_STAGE_SCHEDULE_MISMATCH'].includes(record.error.message)) return Object.freeze({ ...record, evidence_path: evidencePath, mission_record: null, fail_closed: true });
    try {
      const mission = await missionAppender(root, { missionId: `scheduler:${scheduleId}:${startedAt}`, stage, scheduleId, predecessorCheckpointId, repoHead: process.env.AGENTOS_REPO_HEAD || 'unknown:local-runtime', intendedNextAction, actions: ['scheduler wake attempted'], touched: { evidence_path: evidencePath }, evidence: [`scheduler-run:${evidencePath}`], safety: ['scheduler firing is not completion'], blockers: [record.error.message], outcome: 'failed', nextCheckpointId, now });
      return Object.freeze({ ...record, evidence_path: evidencePath, mission_record: mission });
    } catch (persistenceError) {
      const persistenceFailure = { status: 'FAILED', started_at: startedAt, completed_at: new Date().toISOString(), error: record.error, mission_persistence_error: { code: persistenceError?.code ?? 'MISSION_LEDGER_FAILURE_RECORDING_FAILED', message: persistenceError?.message ?? String(persistenceError) }, stage, schedule_id: scheduleId, predecessor_checkpoint_id: predecessorCheckpointId, outcome: 'failed', fail_closed: true };
      const fallbackEvidencePath = await evidenceAppender(root, persistenceFailure); return Object.freeze({ ...record, evidence_path: evidencePath, mission_record: null, mission_persistence_failed: true, mission_persistence_error: persistenceFailure.mission_persistence_error, fallback_evidence_path: fallbackEvidencePath, fail_closed: true });
    }
  }
}

export function parseSchedulerArgs(argv) { const args = [...argv]; let root; let stage; let scheduleId; let predecessorCheckpointId; let nextCheckpointId; const objective = []; while (args.length) { const value = args.shift(); if (value === '--root') { root = args.shift(); if (!root) throw new Error('SCHEDULER_ROOT_REQUIRED'); } else if (value === '--stage') stage = resolveStage(args.shift()); else if (value === '--schedule-id') scheduleId = resolveScheduleId(args.shift()); else if (value === '--predecessor-checkpoint-id') predecessorCheckpointId = resolveCheckpointId(args.shift(), 'AGENTOS_PREDECESSOR_CHECKPOINT_ID'); else if (value === '--next-checkpoint-id') nextCheckpointId = resolveCheckpointId(args.shift(), 'AGENTOS_NEXT_CHECKPOINT_ID'); else objective.push(value); } return { root, stage, scheduleId, predecessorCheckpointId, nextCheckpointId, objective: objective.join(' ').trim() || undefined }; }
async function main() { const args = parseSchedulerArgs(process.argv.slice(2)); const result = await schedulerTick({ root: args.root || process.env.AGENTOS_HOME || resolveInstallRoot(), objective: args.objective, stage: args.stage ?? resolveStage(), scheduleId: args.scheduleId ?? resolveScheduleId(), predecessorCheckpointId: args.predecessorCheckpointId ?? resolveCheckpointId(undefined, 'AGENTOS_PREDECESSOR_CHECKPOINT_ID'), nextCheckpointId: args.nextCheckpointId ?? resolveCheckpointId(undefined, 'AGENTOS_NEXT_CHECKPOINT_ID') }); console.log(JSON.stringify(result, null, 2)); if (result.status !== 'COMPLETED') process.exitCode = 1; }
if (process.argv[1] && process.argv[1].endsWith('scheduler-tick.mjs')) await main();
