import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryDispatchStore } from '../src/dispatch/store.mjs';
import { runLocalProjectOverseerCycle } from '../src/dispatch/local-cycle.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const baseTask = {
  task_id: 'local-cycle-001', mission_id: 'mission:local-cycle-001', issuer: 'agentos:overseer', target: 'agentos:project-overseer',
  objective: 'inspect and perform bounded local action', priority: 'high', scope: ['repository'],
  constraints: ['no external side effects'], authority: { action: 'execute', granted_capabilities: ['repository:read'] },
  acceptance_criteria: ['bounded action verified'],
  status: 'queued', created_at: '2026-09-01T00:00:00Z'
};
const policy = createAuthorityPolicy({ issuers: ['agentos:overseer'], capabilities: ['repository:read'] });

test('local cycle propagates wake trace and records useful progress', () => {
  const store = new MemoryDispatchStore([baseTask]);
  const result = runLocalProjectOverseerCycle(store, 'agentos:project-overseer', policy,
    () => ({ summary: 'repository inspected' }),
    () => ({ source_agent: 'agentos:repo-worker', implemented: ['bounded local action'], verification: ['deterministic verification passed'], evidence: ['local:evidence-001'], repository_commit: 'abcdef1234567', next_action: 'reconcile upstream' }));
  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.task.status, 'completed');
  assert.equal(result.response.source_agent, 'agentos:repo-worker');
  assert.match(result.response.wake_trace_id, /^[0-9a-f-]{36}$/);
  assert.equal(result.task.wake_trace_id, result.response.wake_trace_id);
  assert.ok(result.task.last_useful_work_at);
});

test('local cycle preserves an existing wake trace', () => {
  const store = new MemoryDispatchStore([{ ...baseTask, task_id: 'local-cycle-003', mission_id: 'mission:local-cycle-003', wake_trace_id: 'trace-preexisting' }]);
  const result = runLocalProjectOverseerCycle(store, 'agentos:project-overseer', policy, () => ({ summary: 'inspection' }), () => ({ evidence: ['local:evidence-003'] }));
  assert.equal(result.response.wake_trace_id, 'trace-preexisting');
});

test('local cycle blocks without claiming completion', () => {
  const store = new MemoryDispatchStore([{ ...baseTask, task_id: 'local-cycle-002', mission_id: 'mission:local-cycle-002' }]);
  const result = runLocalProjectOverseerCycle(store, 'agentos:project-overseer', policy,
    () => ({ summary: 'repository inspected' }),
    () => ({ status: 'blocked', blockers: ['missing authority'], next_action: 'escalate' }));
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.task.status, 'blocked');
  assert.equal(result.response.status, 'BLOCKED');
  assert.ok(result.response.wake_trace_id);
});
