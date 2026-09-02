import test from 'node:test';
import assert from 'node:assert/strict';
import { runGitHubWakeCycle } from '../src/dispatch/github-wake.mjs';
import { LeaseStore } from '../src/dispatch/lease-store.mjs';
import { IdempotencyStore } from '../src/dispatch/idempotency.mjs';

const task = {
  task_id: 'github-wake-001', mission_id: 'mission:github-wake-001', issuer: 'agentos:overseer', target: 'agentos:project-overseer',
  objective: 'perform bounded repository inspection', priority: 'high', scope: ['repository'],
  constraints: ['no external side effects'], authority: { action: 'execute', granted_capabilities: ['repository:read'] },
  acceptance_criteria: ['inspection evidence recorded'],
  status: 'queued', created_at: '2026-09-01T00:00:00Z'
};
const policy = { allowedIssuers: ['agentos:overseer'], allowedTargets: ['agentos:project-overseer'], allowedActions: ['execute'] };

function adapterFor(initialTask) {
  let current = structuredClone(initialTask);
  const events = [{ type: 'dispatch.created', task: structuredClone(initialTask) }];
  return {
    async readTask() { return structuredClone(current); },
    async writeTask(next) { current = structuredClone(next); },
    async readAuditEvents() { return structuredClone(events); },
    async appendAuditEvent(event) { events.push(structuredClone(event)); }
  };
}

function stores() { return { leaseStore: new LeaseStore(), idempotencyStore: new IdempotencyStore() }; }

test('github-backed wake executes and persists response', async () => {
  const adapter = adapterFor(task);
  const { leaseStore, idempotencyStore } = stores();
  const result = await runGitHubWakeCycle(adapter, task.target, policy,
    async () => ({ summary: 'repo inspected' }),
    async () => ({ implemented: ['bounded action'], verification: ['verified locally'], evidence: ['commit:abcdef1234567'], repository_commit: 'abcdef1234567' }),
    leaseStore, idempotencyStore);
  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.task.status, 'completed');
  const events = await adapter.readAuditEvents();
  assert.ok(events.some((event) => event.type === 'dispatch.response' && event.task_id === task.task_id));
});

test('github-backed wake fails closed when task disappears', async () => {
  const adapter = adapterFor(task);
  adapter.readTask = async () => null;
  const { leaseStore, idempotencyStore } = stores();
  const result = await runGitHubWakeCycle(adapter, task.target, policy, async () => ({}), async () => ({}), leaseStore, idempotencyStore);
  assert.equal(result.status, 'IDLE');
  assert.equal(result.response, null);
});
