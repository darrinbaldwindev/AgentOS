import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, utimes, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { installLocal } from '../scripts/install-local.mjs';

const exec = promisify(execFile);
const entry = fileURLToPath(new URL('../scripts/scheduler-tick.mjs', import.meta.url));
const statePath = (root) => join(root, 'state', 'agentos.json');
const lockPath = (root) => join(root, 'state', 'scheduler-tick.lock');
async function installed() {
  const root = await mkdtemp(join(tmpdir(), 'agentos-scheduler-'));
  await installLocal({ root });
  return root;
}
async function tick(root) {
  try {
    const { stdout } = await exec(process.execPath, [entry, '--root', root], { env: { ...process.env, NODE_NO_WARNINGS: '1' } });
    return { code: 0, result: JSON.parse(stdout) };
  } catch (error) {
    return { code: error.code, result: error.stdout ? JSON.parse(error.stdout) : null };
  }
}
async function records(root) {
  return (await readFile(join(root, 'state', 'scheduler-runs.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
}

test('fresh scheduler processes append correlated task/response/event/budget evidence and preserve reinstall state', async () => {
  const root = await installed();
  const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
  assert.equal(config.scheduler.enabled, false);
  assert.equal(config.scheduler.cadenceMinutes, 5);
  // Controlled temporary config only; no OS scheduler is registered or changed.
  config.scheduler.enabled = true;
  await writeFile(join(root, 'config.json'), JSON.stringify(config));
  const first = await tick(root);
  const before = await readFile(statePath(root), 'utf8');
  assert.equal((await installLocal({ root })).created, false);
  assert.equal(await readFile(statePath(root), 'utf8'), before);
  const second = await tick(root);
  assert.equal(first.code, 0);
  assert.equal(second.code, 0);
  const rows = await records(root);
  assert.equal(rows.length, 2);
  const state = JSON.parse(await readFile(statePath(root), 'utf8'));
  const artifacts = Object.values(state.records.artifact);
  const events = Object.values(state.records.event).filter(e => e.eventType === 'agentos.manual-wake.completed');
  assert.equal(artifacts.filter(a => a.artifactType === 'dispatch.task').length, 2);
  assert.equal(artifacts.filter(a => a.artifactType === 'project-overseer.response').length, 2);
  assert.equal(events.length, 2);
  for (const field of ['task_id', 'mission_id', 'wake_trace_id']) assert.notEqual(rows[0][field], rows[1][field]);
  const db = new DatabaseSync(join(root, 'state', 'mission-budget.sqlite'), { readOnly: true });
  try {
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM mission_budget_reservations').get().n, 2);
    for (const row of rows) {
      assert.equal(row.status, 'COMPLETED');
      assert.equal(row.worker_id, 'agentos:deterministic-skill-agent');
      const task = state.records.artifact[row.task_id].payload;
      const response = state.records.artifact[`response:${row.task_id}`].payload;
      const event = events.find(e => e.taskId === row.task_id);
      assert.equal(task.status, 'completed');
      for (const field of ['mission_id', 'wake_trace_id']) {
        assert.equal(task[field], row[field]);
        assert.equal(response[field], row[field]);
      }
      assert.equal(event.wakeTraceId, row.wake_trace_id);
      assert.equal(event.missionId, row.mission_id);
      assert.equal(event.workerId, row.worker_id);
      assert.deepEqual(response.evidence, row.evidence);
      assert.ok(row.evidence.includes(`local:task:${row.task_id}`));
      assert.ok(row.evidence.includes(`local:wake:${row.wake_trace_id}`));
      assert.equal(task.evidence.worker_output.task_id, row.task_id);
      assert.equal(task.evidence.worker_output.wake_trace_id, row.wake_trace_id);
      assert.equal(task.evidence.worker_output.mode, 'DRY_RUN');
      const budget = db.prepare('SELECT * FROM mission_budget_reservations WHERE reservation_id = ?').get(event.budgetReservationId);
      assert.equal(budget.mission_id, row.mission_id);
      assert.equal(budget.status, 'RECONCILED');
      assert.equal(budget.actual_units, 1);
    }
  } finally { db.close(); }
  assert.deepEqual(JSON.parse(await readFile(join(root, 'config.json'), 'utf8')), config);
  await assert.rejects(access(lockPath(root)), { code: 'ENOENT' });
});

test('tick executes only its admitted task when an older queued task survived restart', async () => {
  const root = await installed();
  assert.equal((await tick(root)).code, 0);
  const state = JSON.parse(await readFile(statePath(root), 'utf8'));
  const previous = Object.values(state.records.artifact).find(a => a.artifactType === 'dispatch.task');
  const payload = { ...previous.payload, task_id: 'older-task', mission_id: 'older-mission', wake_trace_id: 'older-trace', status: 'queued', created_at: '2020-01-01T00:00:00Z' };
  state.records.artifact['older-task'] = { ...previous, id: 'older-task', payload };
  await writeFile(statePath(root), JSON.stringify(state));
  const next = await tick(root);
  assert.equal(next.code, 0);
  const after = JSON.parse(await readFile(statePath(root), 'utf8'));
  assert.equal(after.records.artifact['older-task'].payload.status, 'queued');
  assert.equal(after.records.artifact[next.result.task_id].payload.status, 'completed');
  assert.equal(next.result.mission_id, after.records.artifact[next.result.task_id].payload.mission_id);
  assert.equal(next.result.wake_trace_id, after.records.artifact[next.result.task_id].payload.wake_trace_id);
});

test('concurrent scheduler processes either complete serially or block without losing completed state', async () => {
  const root = await installed();
  const results = await Promise.all(Array.from({ length: 6 }, () => tick(root)));
  const completed = results.filter(r => r.code === 0);
  assert.ok(completed.length >= 1);
  for (const result of results.filter(r => r.code !== 0)) assert.equal(result.result.error.code, 'SCHEDULER_LOCKED');
  const rows = await records(root);
  assert.equal(rows.length, completed.length);
  const state = JSON.parse(await readFile(statePath(root), 'utf8'));
  assert.equal(Object.values(state.records.artifact).filter(a => a.artifactType === 'project-overseer.response').length, completed.length);
  for (const { result } of completed) assert.equal(state.records.artifact[result.task_id].payload.status, 'completed');
});

for (const stale of [false, true]) test(`${stale ? 'stale' : 'active'} lock blocks fresh processes without state or evidence writes`, async () => {
  const root = await installed();
  await mkdir(lockPath(root));
  if (stale) await utimes(lockPath(root), new Date(0), new Date(0));
  const before = await readFile(statePath(root), 'utf8');
  const results = await Promise.all([tick(root), tick(root)]);
  for (const result of results) {
    assert.equal(result.code, 1);
    assert.equal(result.result.error.code, 'SCHEDULER_LOCKED');
  }
  assert.equal(await readFile(statePath(root), 'utf8'), before);
  await assert.rejects(access(join(root, 'state', 'scheduler-runs.jsonl')), { code: 'ENOENT' });
  await access(lockPath(root));
});

for (const patch of [{ mode: 'LIVE' }, { autonomyEnabled: true }]) test(`unsafe config ${JSON.stringify(patch)} fails closed before worker dispatch`, async () => {
  const root = await installed();
  const configPath = join(root, 'config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  await writeFile(configPath, JSON.stringify({ ...config, ...patch }));
  const before = await readFile(statePath(root), 'utf8');
  const result = await tick(root);
  assert.equal(result.code, 1);
  assert.equal(result.result.status, 'FAILED');
  assert.match(result.result.error.message, /LOCAL_WAKE_REQUIRES_SAFE_MODE/);
  assert.equal(await readFile(statePath(root), 'utf8'), before);
  assert.equal((await records(root))[0].status, 'FAILED');
  assert.equal((await tick(root)).result.error.code, 'SCHEDULER_LOCKED');
});

test('evidence append failure retains lock and prevents an uncertain wake from automatic replay', async () => {
  const root = await installed();
  await mkdir(join(root, 'state', 'scheduler-runs.jsonl'));
  assert.notEqual((await tick(root)).code, 0);
  const before = await readFile(statePath(root), 'utf8');
  assert.equal(Object.values(JSON.parse(before).records.artifact).filter(a => a.artifactType === 'project-overseer.response').length, 1);
  assert.equal((await tick(root)).result.error.code, 'SCHEDULER_LOCKED');
  assert.equal(await readFile(statePath(root), 'utf8'), before);
});
