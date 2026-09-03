#!/usr/bin/env node
// SCHEDULER-BRIDGE-001: external scheduler entrypoint for the installed local runtime.
// The OS scheduler is the clock; this process performs exactly one governed wake.
// Safe by default because runtime/local-wake.mjs requires DRY_RUN + autonomy disabled.

import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import { wakeLocal } from '../runtime/local-wake.mjs';
import { resolveInstallRoot } from './install-local.mjs';

async function appendRecord(root, record) {
  const path = join(resolve(root), 'state', 'scheduler-runs.jsonl');
  await fs.mkdir(join(resolve(root), 'state'), { recursive: true });
  await fs.appendFile(path, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 });
  try { await fs.chmod(path, 0o600); } catch {}
  return path;
}

export async function schedulerTick({ root = resolveInstallRoot(), objective } = {}) {
  const startedAt = new Date().toISOString();
  try {
    const result = await wakeLocal({ root, objective });
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
    return Object.freeze({ ...record, evidence_path: evidencePath });
  } catch (error) {
    const record = {
      status: 'FAILED',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      error: { code: error?.code ?? 'SCHEDULER_TICK_FAILED', message: error?.message ?? String(error) },
    };
    const evidencePath = await appendRecord(root, record);
    return Object.freeze({ ...record, evidence_path: evidencePath });
  }
}

async function main() {
  const result = await schedulerTick({
    root: process.env.AGENTOS_HOME,
    objective: process.argv.slice(2).join(' ').trim() || undefined,
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'COMPLETED') process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].endsWith('scheduler-tick.mjs')) await main();
