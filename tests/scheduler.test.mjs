import test from 'node:test';
import assert from 'node:assert/strict';
import { createScheduler } from '../src/dispatch/scheduler.mjs';
import { createRuntimeControl } from '../src/dispatch/control.mjs';

const control = () => createRuntimeControl();

test('scheduler runs a bounded number of poll cycles', async () => {
  let calls = 0;
  let resolveComplete;
  const complete = new Promise(resolve => { resolveComplete = resolve; });

  const scheduler = createScheduler({
    poll: async () => {
      calls += 1;
      if (calls === 3) resolveComplete();
    },
    control: control(),
    intervalMs: 1,
    maxCycles: 3,
  });

  await scheduler.start();
  await complete;

  assert.equal(calls, 3);
  assert.equal(scheduler.getCycles(), 3);
  scheduler.stop();
});

test('scheduler can be stopped and surfaces poll errors through handler', async () => {
  let errors = 0;
  const scheduler = createScheduler({
    poll: async () => { throw new Error('poll failed'); },
    control: control(),
    intervalMs: 10,
    maxCycles: 5,
    onError: () => { errors += 1; },
  });

  await scheduler.start();
  scheduler.stop();

  assert.equal(errors, 1);
  assert.equal(scheduler.getCycles(), 1);
});
