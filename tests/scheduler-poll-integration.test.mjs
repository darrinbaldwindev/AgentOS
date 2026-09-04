import test from 'node:test';
import assert from 'node:assert/strict';
import { createScheduler } from '../src/dispatch/scheduler.mjs';
import { pollDispatch } from '../src/dispatch/poll.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const task = {
  task_id: 'scheduler-poll-001',
  mission_id: 'mission:scheduler-poll-001',
  issuer: 'GPTChat Overseer',
  target: 'AgentOS Overseer Project',
  objective: 'Execute one governed scheduled poll',
  priority: 'high',
  scope: ['tests'],
  constraints: ['test-only', 'no external side effects'],
  acceptance_criteria: ['scheduled poll completes task'],
  authority: { granted_capabilities: ['tests'] },
  status: 'queued',
  created_at: '2026-09-01T00:00:00Z',
};

const policy = createAuthorityPolicy({
  issuers: ['GPTChat Overseer'],
  capabilities: ['tests'],
});

test('scheduler drives a real poll cycle and completes an authorised task', async () => {
  const writes = [];
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      return { written: true };
    },
  };

  const poll = () => pollDispatch({
    tasks: [task],
    receiver: task.target,
    authorityPolicy: policy,
    store,
    execute: async current => ({
      evidence: [`scheduler:${current.task_id}`],
    }),
    now: Date.parse('2026-09-04T02:30:00Z'),
    claimTimeoutMs: 900000,
  });

  const scheduler = createScheduler({
    poll,
    control: () => ({ action: 'continue' }),
    intervalMs: 1,
    maxCycles: 1,
  });

  const result = await scheduler.start();

  assert.equal(scheduler.getCycles(), 1);
  assert.equal(result.completed.status, 'completed');
  assert.equal(result.completed.task_id, 'scheduler-poll-001');
  assert.equal(writes.length, 4);
  assert.deepEqual(
    writes.map(item => item.status),
    ['claimed', 'working', 'verification', 'completed'],
  );

  scheduler.stop();
});
