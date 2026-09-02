import test from 'node:test';
import assert from 'node:assert/strict';
import { runGitHubWakeCycle } from '../src/dispatch/github-wake.mjs';
import { LeaseStore } from '../src/dispatch/lease-store.mjs';
import { IdempotencyStore } from '../src/dispatch/idempotency.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const task = { task_id: 'wake-idem-001', mission_id: 'mission-wake-idem-001', issuer: 'agentos:overseer', target: 'agentos:project-overseer', objective: 'bounded action', priority: 'high', scope: ['repository'], constraints: ['no external side effects'], authority: { action: 'execute' }, acceptance_criteria: ['worker result evidence recorded'], status: 'queued', created_at: '2026-09-02T00:00:00Z' };
const policy = createAuthorityPolicy({ issuers: ['agentos:overseer'], capabilities: ['repository:read'] });
function adapter() { let current = structuredClone(task); const events = [{ type: 'dispatch.created', task: structuredClone(task) }]; return { async readTask() { return structuredClone(current); }, async writeTask(next) { current = structuredClone(next); }, async readAuditEvents() { return structuredClone(events); }, async appendAuditEvent(event) { events.push(structuredClone(event)); } }; }

test('completed task cannot be completed twice', async () => {
  const leases = new LeaseStore();
  const idem = new IdempotencyStore();
  const a = adapter();
  const result = await runGitHubWakeCycle(a, task.target, policy, async () => ({ summary: 'inspected' }), async () => ({ evidence: ['commit:abcdef1234567'], verification: ['passed'], repository_commit: 'abcdef1234567' }), leases, idem, 1000);
  assert.equal(result.status, 'COMPLETED');
  const duplicate = await runGitHubWakeCycle(a, task.target, policy, async () => ({ summary: 'must not inspect' }), async () => ({ evidence: ['must-not-run'], repository_commit: 'abcdef1234567' }), leases, idem, 2000);
  assert.equal(duplicate.status, 'IDLE');
  assert.equal(duplicate.reason, 'already_completed');
});
