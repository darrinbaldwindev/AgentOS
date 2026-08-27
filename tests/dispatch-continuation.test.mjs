import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveNextTask } from '../src/dispatch/continuation.mjs';

const completed = {
  task_id: 'parent-001', status: 'completed',
  authority: { granted_capabilities: ['tests', 'repository_read'] },
};

test('completed work can produce an authorised next task', () => {
  const next = deriveNextTask(completed, {
    task_id: 'child-001', target: 'AgentOS Overseer Project',
    authority: { granted_capabilities: ['tests'] }, dependencies: [],
  }, 'AgentOS Overseer Project');
  assert.equal(next.status, 'queued');
  assert.equal(next.parent_task_id, 'parent-001');
  assert.deepEqual(next.dependencies, ['parent-001']);
});

test('continuation cannot exceed parent authority', () => {
  assert.throws(() => deriveNextTask(completed, {
    task_id: 'child-002', target: 'AgentOS Overseer Project',
    authority: { granted_capabilities: ['repository_write'] },
  }, 'AgentOS Overseer Project'), /exceeds parent authority/);
});

test('continuation requires the parent to be completed', () => {
  assert.throws(() => deriveNextTask({ ...completed, status: 'working' }, {
    task_id: 'child-003', target: 'AgentOS Overseer Project', authority: { granted_capabilities: [] },
  }, 'AgentOS Overseer Project'), /requires completed task/);
});
