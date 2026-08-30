import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryDispatchStore } from '../src/dispatch/store.mjs';

const task = {
  task_id: 'store-001', mission_id: 'mission:store-001', issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project',
  objective: 'Validate state storage', priority: 'normal', scope: ['tests'], constraints: [],
  acceptance_criteria: ['state survives store operations'], authority: { granted_capabilities: ['tests'] }, status: 'queued',
};

test('store returns isolated task state and rejects duplicate IDs', () => {
  const store = new MemoryDispatchStore([task]);
  const copy = store.get(task.task_id);
  copy.status = 'working';
  assert.equal(store.get(task.task_id).status, 'queued');
  assert.throws(() => new MemoryDispatchStore([task, task]), /duplicate task_id/);
});

test('store replaces known task state', () => {
  const store = new MemoryDispatchStore([task]);
  const updated = { ...task, status: 'claimed' };
  store.replace(updated);
  assert.equal(store.get(task.task_id).status, 'claimed');
  assert.throws(() => store.replace({ ...task, task_id: 'missing' }), /unknown task_id/);
});
