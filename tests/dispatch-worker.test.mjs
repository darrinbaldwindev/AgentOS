import test from 'node:test';
import assert from 'node:assert/strict';
import { claimNextTask, advanceTask } from '../src/dispatch/worker.mjs';

const queued = {
  task_id: 'worker-001', issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project',
  objective: 'Prove worker lifecycle', priority: 'critical', scope: ['tests'],
  constraints: [], acceptance_criteria: ['worker can progress'],
  authority: { granted_capabilities: ['tests'] }, status: 'queued',
};

test('worker claims the next matching queued task', () => {
  const claimed = claimNextTask([{ ...queued }], 'AgentOS Overseer Project');
  assert.equal(claimed.status, 'claimed');
  assert.equal(claimNextTask([claimed], 'AgentOS Overseer Project'), null);
});

test('worker advances through verification to evidence-backed completion', () => {
  let task = claimNextTask([{ ...queued }], 'AgentOS Overseer Project');
  task = advanceTask(task, 'start');
  task = advanceTask(task, 'verify');
  task = advanceTask(task, { type: 'complete', evidence: { result: 'A1 lifecycle validated' } });
  assert.equal(task.status, 'completed');
  assert.equal(task.evidence.result, 'A1 lifecycle validated');
});
