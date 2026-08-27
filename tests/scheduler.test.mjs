import test from 'node:test';
import assert from 'node:assert/strict';
import { createScheduler } from '../src/dispatch/scheduler.mjs';

test('scheduler runs a bounded number of poll cycles', async () => {
  let calls = 0;
  const scheduler = createScheduler({ poll: async () => { calls += 1; }, intervalMs: 1, maxCycles: 3 });
  await scheduler.start();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(calls, 3);
  assert.equal(scheduler.getCycles(), 3);
});

test('scheduler can be stopped and surfaces poll errors through handler', async () => {
  let errors = 0;
  const scheduler = createScheduler({ poll: async () => { throw new Error('poll failed'); }, intervalMs: 10, maxCycles: 5, onError: () => { errors += 1; } });
  await scheduler.start();
  scheduler.stop();
  assert.equal(errors, 1);
  assert.equal(scheduler.getCycles(), 1);
});
