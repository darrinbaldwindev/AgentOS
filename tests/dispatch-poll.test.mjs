import test from 'node:test';
import assert from 'node:assert/strict';
import { pollDispatch } from '../src/dispatch/poll.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const policy = createAuthorityPolicy({ issuers: ['GPTChat Overseer'], capabilities: ['tests'] });
const task = {
  task_id: 'poll-001', mission_id: 'mission:poll-001', issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project',
  objective: 'Run one poll cycle', priority: 'high', scope: ['tests'], constraints: [],
  acceptance_criteria: ['poll executes'], authority: { granted_capabilities: ['tests'] }, status: 'queued',
};

test('poll cycle executes one matching task and can expose continuation', async () => {
  const writes = [];
  const result = await pollDispatch({
    tasks: [task], receiver: task.target, authorityPolicy: policy,
    store: { writeTask: async value => { writes.push(structuredClone(value)); return { written: true }; } },
    execute: async () => ({ ok: true }),
    nextTask: parent => ({ ...parent, task_id: 'poll-002', objective: 'Continue', status: 'queued' }),
    now: Date.parse('2026-08-27T15:00:00Z'), claimTimeoutMs: 900000,
  });
  assert.equal(result.completed.status, 'completed');
  assert.equal(result.next.status, 'queued');
  assert.equal(result.next.dependencies[0], 'poll-001');
  assert.deepEqual(writes.map(item => item.status), ['claimed', 'working', 'verification', 'completed', 'queued']);
});
