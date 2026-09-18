import test from 'node:test';
import assert from 'node:assert/strict';
import { runNextTask } from '../src/dispatch/runner.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const policy = createAuthorityPolicy({ issuers: ['GPTChat Overseer'], capabilities: ['tests'] });
const task = {
  task_id: 'runner-alias-001', mission_id: 'mission:runner-alias-001', issuer: 'GPTChat Overseer',
  target: 'AgentOS Overseer Project', objective: 'Reject ambiguous executor correlation', priority: 'critical',
  scope: ['tests'], constraints: [], acceptance_criteria: ['conflicting aliases fail closed'],
  authority: { granted_capabilities: ['tests'] }, status: 'queued',
};

function storeFrom(log) {
  return { writeTask: async value => { log.push(structuredClone(value)); return { written: true }; } };
}

test('runner rejects conflicting canonical and legacy executor task aliases before verification', async () => {
  const writes = [];
  let executions = 0;

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy,
    store: storeFrom(writes), execute: async current => {
      executions += 1;
      return { task_id: current.task_id, task: 'runner-alias-other', mission_id: current.mission_id, ok: true };
    },
  }), /executor result task aliases conflict: runner-alias-001/);

  assert.equal(executions, 1);
  assert.deepEqual(writes.map(value => value.status), ['claimed', 'working', 'escalated']);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /task aliases conflict/);
  assert.equal(writes.some(value => value.status === 'verification' || value.status === 'completed'), false);
});
