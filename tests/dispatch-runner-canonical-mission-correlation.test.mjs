import test from 'node:test';
import assert from 'node:assert/strict';
import { runNextTask } from '../src/dispatch/runner.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const policy = createAuthorityPolicy({ issuers: ['GPTChat Overseer'], capabilities: ['tests'] });
const task = {
  task_id: 'runner-canonical-correlation-001',
  mission_id: 'mission:runner-canonical-correlation-001',
  issuer: 'GPTChat Overseer',
  target: 'AgentOS Overseer Project',
  objective: 'Reject incomplete canonical executor correlation',
  priority: 'critical',
  scope: ['tests'],
  constraints: [],
  acceptance_criteria: ['canonical result must retain task and mission correlation'],
  authority: { granted_capabilities: ['tests'] },
  status: 'queued',
};

function storeFrom(log) {
  return { writeTask: async value => { log.push(structuredClone(value)); return { written: true }; } };
}

test('runner rejects canonical task evidence when mission correlation is absent', async () => {
  const writes = [];
  let executions = 0;

  await assert.rejects(() => runNextTask({
    tasks: [task],
    receiver: task.target,
    authorityPolicy: policy,
    store: storeFrom(writes),
    execute: async current => {
      executions += 1;
      return { task_id: current.task_id, ok: true };
    },
  }), /executor result mission correlation required: mission:runner-canonical-correlation-001/);

  assert.equal(executions, 1);
  assert.deepEqual(writes.map(value => value.status), ['claimed', 'working', 'escalated']);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /mission correlation required/);
  assert.equal(writes.some(value => value.status === 'verification' || value.status === 'completed'), false);
});

test('runner rejects canonical mission evidence when task correlation is absent', async () => {
  const writes = [];
  let executions = 0;

  await assert.rejects(() => runNextTask({
    tasks: [task],
    receiver: task.target,
    authorityPolicy: policy,
    store: storeFrom(writes),
    execute: async current => {
      executions += 1;
      return { mission_id: current.mission_id, ok: true };
    },
  }), /executor result task correlation required: runner-canonical-correlation-001/);

  assert.equal(executions, 1);
  assert.deepEqual(writes.map(value => value.status), ['claimed', 'working', 'escalated']);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /task correlation required/);
  assert.equal(writes.some(value => value.status === 'verification' || value.status === 'completed'), false);
});

test('runner accepts a fully correlated canonical executor result', async () => {
  const writes = [];

  const completed = await runNextTask({
    tasks: [task],
    receiver: task.target,
    authorityPolicy: policy,
    store: storeFrom(writes),
    execute: async current => ({
      task_id: current.task_id,
      mission_id: current.mission_id,
      ok: true,
    }),
  });

  assert.equal(completed.status, 'completed');
  assert.equal(completed.evidence.task_id, task.task_id);
  assert.equal(completed.evidence.mission_id, task.mission_id);
  assert.deepEqual(writes.map(value => value.status), ['claimed', 'working', 'verification', 'completed']);
});
