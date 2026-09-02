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

test('local cycle receives, inspects, acts, verifies and responds', () => {
  const store = new MemoryDispatchStore([baseTask]);
  const result = runLocalProjectOverseerCycle(store, 'agentos:project-overseer', policy,
    () => ({ summary: 'repository inspected' }),
    () => ({ implemented: ['bounded local action'], verification: ['deterministic verification passed'], evidence: ['local:evidence-001'], repository_commit: 'abcdef1234567', next_action: 'reconcile upstream' }));
  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.task.status, 'completed');
  assert.deepEqual(result.response.evidence, ['local:evidence-001']);
});

test('local cycle blocks without claiming completion', () => {
  const store = new MemoryDispatchStore([{ ...baseTask, task_id: 'local-cycle-002', mission_id: 'mission:local-cycle-002' }]);
  const result = runLocalProjectOverseerCycle(store, 'agentos:project-overseer', policy,
    () => ({ summary: 'repository inspected' }),
    () => ({ status: 'blocked', blockers: ['missing authority'], next_action: 'escalate' }));
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.task.status, 'blocked');
  assert.equal(result.response.status, 'BLOCKED');
});
