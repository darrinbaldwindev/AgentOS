import test from 'node:test';
import assert from 'node:assert/strict';
import { runWithContinuation } from '../src/dispatch/continuation-runner.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const policy = createAuthorityPolicy({ issuers: ['GPTChat Overseer'], capabilities: ['tests'] });
const task = {
  task_id: 'chain-001', issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project',
  objective: 'Complete a task and create authorised follow-on work', priority: 'high', scope: ['tests'],
  constraints: [], acceptance_criteria: ['parent completes'],
  authority: { granted_capabilities: ['tests'] }, mission_id: 'mission:core-003', status: 'queued',
};
const store = log => ({ writeTask: async value => log.push(structuredClone(value)) });

test('completed task can create an authorised queued continuation', async () => {
  const writes = [];
  const result = await runWithContinuation({
    tasks: [task], receiver: task.target, authorityPolicy: policy, store: store(writes),
    execute: async () => ({ ok: true }),
    nextTask: parent => ({
      task_id: 'chain-002', issuer: parent.issuer, target: parent.target,
      objective: 'Perform the follow-on test', priority: 'high', scope: ['tests'], constraints: [],
      acceptance_criteria: ['follow-on is testable'], authority: parent.authority,
      mission_id: parent.mission_id, status: 'queued',
    }),
  });
  assert.equal(result.completed.status, 'completed');
  assert.equal(result.next.status, 'queued');
  assert.equal(result.next.mission_id, 'mission:core-003');
  assert.deepEqual(result.next.dependencies, ['chain-001']);
  assert.deepEqual(writes.map(item => item.status), ['claimed', 'working', 'verification', 'completed', 'queued']);
});

test('authority escalation in continuation is rejected', async () => {
  const writes = [];
  await assert.rejects(() => runWithContinuation({
    tasks: [task], receiver: task.target, authorityPolicy: policy, store: store(writes),
    execute: async () => ({ ok: true }),
    nextTask: parent => ({
      task_id: 'chain-forged', issuer: parent.issuer, target: parent.target,
      objective: 'Request extra authority', priority: 'high', scope: ['tests'], constraints: [],
      acceptance_criteria: ['never accepted'], authority: { granted_capabilities: ['financial_commitment'] },
      mission_id: parent.mission_id, status: 'queued',
    }),
  }), /exceeds parent authority/);
});
