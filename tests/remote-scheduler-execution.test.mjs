import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
import { loadOrCreateRemoteHostIdentity } from '../runtime/remote-host-identity.mjs';
import { createRemoteDeliveryClaimStore } from '../runtime/remote-delivery-claim-store.mjs';
import { schedulerTick } from '../scripts/scheduler-tick.mjs';
import { __testOnlyWakeLocal, wakeLocal } from '../runtime/local-wake.mjs';
const exec = promisify(execFile);
async function fixture(t, patch = {}) {
  const root = await fs.mkdtemp(join(tmpdir(), 'agentos-remote-tick-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await installLocal({ root });
  const configPath = join(root, 'config.json');
  const config = JSON.parse(await fs.readFile(configPath));
  await fs.writeFile(configPath, JSON.stringify({ ...config, remoteBridge: { enabled: true } }));
  const host = await loadOrCreateRemoteHostIdentity({ filePath: join(root, 'state', 'remote-host.json') });
  const store = await createLocalPersistence({ filePath: join(root, DEFAULT_CONFIG.stateFile) });
  const task = { task_id: 'task-A', mission_id: 'mission-A', delivery_id: 'delivery-A', request_id: 'request-A',
    project_id: 'agentos-local', target_host_id: host.host_id, actor_id: 'owner-fixture',
    issuer: 'agentos:overseer', admitted_by: 'agentos:overseer', target: 'agentos:project-overseer',
    authority_admitted: true, environment: 'DRY_RUN', pickup_state: 'QUEUED', status: 'queued',
    consent_mode: 'PRE_AUTHORIZED', authority: { action: 'execute', granted_capabilities: ['repository:read'] },
    required_capabilities: ['repository:read'], scope: ['local-runtime'], constraints: ['read-only'],
    objective: 'bounded deterministic fixture', priority: 'high', acceptance_criteria: ['bounded action verified'],
    created_at: new Date().toISOString(), ...patch };
  await store.create('artifact', { id: task.task_id, artifactType: 'dispatch.task', payload: task });
  return { root, store, task, host };
}
async function completed(store) {
  return (await store.list('artifact')).filter((a) => a.artifactType === 'remote.execution.receipt' && a.payload.status === 'COMPLETED');
}
test('existing scheduler executes A once and never borrows queued B', async (t) => {
  const { root, store, task } = await fixture(t);
  await store.create('artifact', { id: 'task-B', artifactType: 'dispatch.task', payload: { ...task,
    delivery_id: undefined, task_id: 'task-B', mission_id: 'mission-B', created_at: '2020-01-01T00:00:00Z' } });
  const result = await schedulerTick({ root });
  assert.equal(result.status, 'COMPLETED', JSON.stringify(result));
  const [receipt] = await completed(store);
  for (const field of ['delivery_id', 'request_id', 'mission_id', 'task_id', 'project_id', 'actor_id', 'issuer']) {
    assert.equal(receipt.payload[field], task[field]);
  }
  for (const field of ['wake_trace_id', 'host_id', 'worker_id', 'code_identity', 'config_identity', 'claimed_at', 'started_at', 'completed_at', 'budget_reservation_id']) assert.ok(receipt.payload[field]);
  assert.equal(receipt.payload.budget_status, 'RECONCILED');
  assert.equal(receipt.payload.green_disposition, 'pass');
  assert.equal((await store.get('artifact', 'task-B')).payload.status, 'queued');
  assert.notEqual((await schedulerTick({ root })).status, 'COMPLETED');
  assert.equal((await completed(store)).length, 1);
});
test('eight real scheduler processes cannot execute a delivery twice', async (t) => {
  const { root, store } = await fixture(t);
  const module = new URL('../scripts/scheduler-tick.mjs', import.meta.url).href;
  const code = `import {schedulerTick} from ${JSON.stringify(module)}; console.log(JSON.stringify(await schedulerTick({root:process.argv[1]})));`;
  const outputs = await Promise.all(Array.from({ length: 8 }, () => exec(process.execPath, ['--input-type=module', '-e', code, root])));
  const results = outputs.map((r) => JSON.parse(r.stdout));
  assert.equal(results.filter((r) => r.status === 'COMPLETED').length, 1, JSON.stringify(results));
  assert.equal((await completed(store)).length, 1);
  assert.equal((await store.list('event')).filter((e) => e.eventType === 'agentos.manual-wake.completed').length, 1);
  assert.equal(results.every((r) => ['COMPLETED', 'DUPLICATE_DELIVERY', 'NO_REMOTE_TASK'].includes(r.status)), true, JSON.stringify(results));
  const schedulerRecords = (await fs.readFile(join(root, 'state', 'scheduler-runs.jsonl'), 'utf8')).trim().split('\n');
  assert.equal(schedulerRecords.length, 8);
});
test('receipt write failure retains claim and charged budget without completion', async (t) => {
  const { root, store } = await fixture(t);
  const rename = fs.rename;
  t.mock.method(fs, 'rename', async (source, target) => {
    const state = JSON.parse(await fs.readFile(source));
    if (Object.values(state.records.artifact).some((a) => a.artifactType === 'remote.execution.receipt' && a.payload.status === 'COMPLETED')) throw new Error('RECEIPT_WRITE_FAILED');
    return rename(source, target);
  });
  const result = await schedulerTick({ root });
  t.mock.restoreAll();
  assert.equal(result.status, 'RECOVERY_REQUIRED');
  assert.equal((await completed(store)).length, 0);
  assert.equal((await store.list('artifact')).some((a) => a.payload?.status === 'COMPLETED'), false);
  assert.equal((await store.list('event')).some((e) => e.eventType === 'agentos.manual-wake.completed'), false);
  const failed = (await store.list('event')).find((e) => e.reason === 'RECEIPT_WRITE_FAILED');
  assert.equal(failed.budget.status, 'RECONCILED');
  assert.equal(failed.budget.actual_units, 1);
  assert.equal((await wakeLocal({ root, deliveryId: 'delivery-A' })).status, 'DUPLICATE_DELIVERY');
});
test('crashed stale claimant requires recovery and its claim is unchanged', async (t) => {
  const { root, store, host } = await fixture(t);
  const claims = await createRemoteDeliveryClaimStore({ root: join(root, 'state', 'remote-claims'), now: () => new Date('2020-01-01') });
  const before = await claims.claim({ deliveryId: 'delivery-A', requestId: 'request-A', hostId: host.host_id });
  assert.equal((await schedulerTick({ root })).status, 'RECOVERY_REQUIRED');
  assert.deepEqual(await claims.get('delivery-A'), before.record);
  assert.equal((await completed(store)).length, 0);
  assert.equal((await store.get('artifact', 'task-A')).payload.status, 'queued');
});
test('worker success plus Green fail persists blocked receipt', async (t) => {
  const { root, store } = await fixture(t);
  const result = await __testOnlyWakeLocal({ root, deliveryId: 'delivery-A', greenEvaluate: () => ({ disposition: 'fail', failures: ['forced negative'] }) });
  assert.equal(result.status, 'INCOMPLETE');
  assert.equal((await completed(store)).length, 0);
  assert.equal((await store.get('artifact', 'remote-blocked:delivery-A')).payload.status, 'GREEN_BLOCKED');
});
for (const [name, patch, reason] of [
  ['capability mismatch', { required_capabilities: ['shell:execute'] }, 'HOST_CAPABILITY_MISMATCH'],
  ['superseded', { pickup_state: 'SUPERSEDED' }, 'SUPERSEDED'],
  ['stale', { created_at: '2020-01-01T00:00:00Z' }, 'QUEUE_ENTRY_STALE'],
  ['no authority', { authority_admitted: false }, 'AUTHORITY_NOT_ADMITTED'],
]) test(`${name} blocks before execution`, async (t) => {
  const { root, store } = await fixture(t, patch);
  const result = await schedulerTick({ root });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reason, reason);
  assert.equal((await completed(store)).length, 0);
  assert.equal((await store.get('artifact', 'task-A')).payload.status, 'queued');
});

test('blocked delivery does not starve the next admitted delivery', async (t) => {
  const { root, store, task } = await fixture(t, { pickup_state: 'SUPERSEDED' });
  await store.create('artifact', { id: 'task-C', artifactType: 'dispatch.task', payload: {
    ...task, task_id: 'task-C', mission_id: 'mission-C', delivery_id: 'delivery-C', request_id: 'request-C', pickup_state: 'QUEUED' } });
  assert.equal((await schedulerTick({ root })).status, 'BLOCKED');
  const next = await schedulerTick({ root });
  assert.equal(next.status, 'COMPLETED');
  assert.equal(next.delivery_id, 'delivery-C');
});
