import test from 'node:test';
import assert from 'node:assert/strict';
import { runNextTask } from '../src/dispatch/runner.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const policy = createAuthorityPolicy({ issuers: ['GPTChat Overseer'], capabilities: ['tests'] });
const task = {
  task_id: 'runner-001', mission_id: 'mission:runner-001', issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project',
  objective: 'Execute one autonomous task', priority: 'critical', scope: ['tests'], constraints: [],
  acceptance_criteria: ['executor result is persisted'], authority: { granted_capabilities: ['tests'] }, status: 'queued',
};

function storeFrom(log) {
  return { writeTask: async value => { log.push(structuredClone(value)); return { written: true }; } };
}

test('runner claims, executes, verifies and completes one task', async () => {
  const writes = [];
  const completed = await runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy,
    store: storeFrom(writes), execute: async current => ({ task: current.task_id, ok: true }),
  });
  assert.equal(completed.status, 'completed');
  assert.equal(completed.evidence.ok, true);
  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'verification', 'completed']);
});

test('runner escalates execution failures', async () => {
  const writes = [];
  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy,
    store: storeFrom(writes), execute: async () => { throw new Error('executor failed'); },
  }), /executor failed/);
  assert.equal(writes.at(-1).status, 'escalated');
  assert.equal(writes.at(-1).error.message, 'executor failed');
});
