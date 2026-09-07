#!/usr/bin/env node
// SCHEDULER-BRIDGE-001: external scheduler entrypoint for the installed local runtime.
// The OS scheduler is the clock; this process performs exactly one governed wake.
// Safe by default because runtime/local-wake.mjs requires DRY_RUN + autonomy disabled.

import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import { appendMissionRecord, createMissionRecord, missionLedgerPaths, readMissionLedger, writeMissionLedgerIndex } from '../runtime/mission-ledger.mjs';
import { wakeLocal } from '../runtime/local-wake.mjs';
import { resolveInstallRoot } from './install-local.mjs';

async function appendRecord(root, record) {
  const path = join(resolve(root), 'state', 'scheduler-runs.jsonl');
  await fs.mkdir(join(resolve(root), 'state'), { recursive: true });
  await fs.appendFile(path, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 });
  try { await fs.chmod(path, 0o600); } catch {}
  return path;
}

function resolveStage(stage = process.env.AGENTOS_CONTROL_STAGE || 'A') {
  if (!['A', 'B', 'C'].includes(stage)) throw new Error('CONTROL_STAGE_INVALID');
  return stage;
}

function resolveScheduleId(scheduleId = process.env.AGENTOS_SCHEDULE_ID || 'local-scheduler-tick') {
  if (typeof scheduleId !== 'string' || !scheduleId.trim()) throw new Error('SCHEDULE_ID_REQUIRED');
  return scheduleId;
}

function resolveRepoHead(result) {
  return result?.response?.repository_commit || process.env.AGENTOS_REPO_HEAD || 'unknown:local-runtime';
}

async function appendMission(root, { missionId, stage, scheduleId, predecessorCheckpointId, repoHead, intendedNextAction, actions, worker, touched, tests, evidence, safety, blockers, outcome, nextCheckpointId, now }) {
  const paths = missionLedgerPaths(resolve(root));
  const record = createMissionRecord({
    missionId,
    stage,
    scheduleId,
    predecessorCheckpointId,
    repoHead,
    intendedNextAction,
    actions,
    worker,
    touched,
    tests,
    evidence,
    safety,
    blockers,
    outcome,
    nextCheckpointId,
    now,
  });
  await appendMissionRecord({ ledgerPath: paths.ledger, record });
  const records = await readMissionLedger({ ledgerPath: paths.ledger });
  await writeMissionLedgerIndex({ indexPath: paths.index, records });
  return record;
}

export async function schedulerTick({ root = resolveInstallRoot(), objective, stage = resolveStage(), scheduleId = resolveScheduleId(), predecessorCheckpointId = null, nextCheckpointId = null, now = new Date(), wake = wakeLocal } = {}) {
  const startedAt = now instanceof Date ? now.toISOString() : new Date(now).toISOString();
  const intendedNextAction = objective || 'perform one bounded local AgentOS control-cycle action';
  try {
    const result = await wake({ root, objective: intendedNextAction });
    const record = {
      status: result.status,
      task_id: result.task_id,
      mission_id: result.response.mission_id,
      wake_trace_id: result.response.wake_trace_id,
      source_agent: result.response.source_agent,
      worker_id: result.response.source_agent,
      started_at: startedAt,
      completed_at: result.response.completed_at,
      evidence: result.response.evidence,
    };
    const evidencePath = await appendRecord(root, record);
    const mission = await appendMission(root, {
      missionId: result.response.mission_id,
      stage,
      scheduleId,
      predecessorCheckpointId,
      repoHead: resolveRepoHead(result),
      intendedNextAction,
      actions: ['scheduler wake invoked governed local runtime'],
      worker: result.response.source_agent,
      touched: { evidence_path: evidencePath },
      tests: result.response.verification || [],
      evidence: [...(result.response.evidence || []), `scheduler-run:${evidencePath}`, `wake-trace:${result.response.wake_trace_id}`],
      safety: ['scheduler firing is not completion', 'DRY_RUN/autonomy-disabled boundary preserved by local wake'],
      blockers: result.response.blockers || [],
      outcome: 'executed_awaiting_green',
      nextCheckpointId,
      now,
    });
    return Object.freeze({ ...record, evidence_path: evidencePath, mission_record: mission });
  } catch (error) {
    const completedAt = new Date().toISOString();
    const record = {
      status: 'FAILED',
      started_at: startedAt,
      completed_at: completedAt,
      error: { code: error?.code ?? 'SCHEDULER_TICK_FAILED', message: error?.message ?? String(error) },
    };
    const evidencePath = await appendRecord(root, record);
    const mission = await appendMission(root, {
      missionId: `scheduler:${scheduleId}:${startedAt}`,
      stage,
      scheduleId,
      predecessorCheckpointId,
      repoHead: process.env.AGENTOS_REPO_HEAD || 'unknown:local-runtime',
      intendedNextAction,
      actions: ['scheduler wake attempted'],
      touched: { evidence_path: evidencePath },
      evidence: [`scheduler-run:${evidencePath}`],
      safety: ['scheduler firing is not completion'],
      blockers: [record.error.message],
      outcome: 'failed',
      nextCheckpointId,
      now,
    });
    return Object.freeze({ ...record, evidence_path: evidencePath, mission_record: mission });
  }
}

function parseArgs(argv) {
  const args = [...argv];
  let root;
  const objective = [];
  while (args.length) {
    const value = args.shift();
    if (value === '--root') {
      root = args.shift();
      if (!root) throw new Error('SCHEDULER_ROOT_REQUIRED');
    } else {
      objective.push(value);
    }
  }
  return { root, objective: objective.join(' ').trim() || undefined };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await schedulerTick({
    root: args.root || process.env.AGENTOS_HOME || resolveInstallRoot(),
    objective: args.objective,
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'COMPLETED') process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].endsWith('scheduler-tick.mjs')) await main();
