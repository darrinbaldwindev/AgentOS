import test from 'node:test';
import assert from 'node:assert/strict';
import { runNextTask } from '../src/dispatch/runner.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const policy = createAuthorityPolicy({ issuers: ['GPTChat Overseer'], capabilities: ['tests'] });
const task = {
  task_id: 'runner-exec-failure-001',
  mission_id: 'mission:runner-exec-failure-001',
  issuer: 'GPTChat Overseer',
  target: 'AgentOS Overseer Project',
  objective: 'Exercise executor failure escalation persistence',
  priority: 'critical',
  scope: ['tests'],
  constraints: [],
  acceptance_criteria: ['executor failure cannot manufacture success'],
  authority: { granted_capabilities: ['tests'] },
  status: 'queued',
};

test('runner preserves executor failure and exact correlation when escalation persistence fails', async () => {
  const writes = [];
  let executions = 0;
  let writeCount = 0;
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      writeCount += 1;
      if (writeCount === 3) return { written: false, error: 'escalation persistence unavailable' };
      return { written: true, sha: `write-${writeCount}` };
    },
  };

  await assert.rejects(() => runNextTask({
    tasks: [task],
    receiver: 'AgentOS Overseer Project',
    authorityPolicy: policy,
    store,
    execute: async () => {
      executions += 1;
      throw new Error('executor failed before verification');
    },
  }), error => {
    assert.match(error.message, /executor failed before verification/);
    assert.match(error.persistenceError.message, /persistence failure: runner-exec-failure-001/);
    assert.equal(error.persistenceOutcome.task_id, task.task_id);
    assert.equal(error.persistenceOutcome.mission_id, task.mission_id);
    return true;
  });

  assert.equal(executions, 1);
  assert.deepEqual(writes.map(value => value.status), ['claimed', 'working', 'escalated']);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /executor failed before verification/);
  assert.equal(writes.some(value => value.status === 'verification' || value.status === 'completed'), false);
});
