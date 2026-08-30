import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeControl, applyControlAction } from '../src/dispatch/control.mjs';
import { createScheduler } from '../src/dispatch/scheduler.mjs';

test('paused scheduler does not poll', async () => {
  const control = createRuntimeControl({ paused: true });
  let calls = 0;
  const scheduler = createScheduler({ control, poll: async () => { calls += 1; }, intervalMs: 1, maxCycles: 2 });
  await scheduler.start();
  assert.equal(calls, 0);
  assert.equal(scheduler.getCycles(), 0);
});

test('scheduler stops rescheduling after kill', async () => {
  const control = createRuntimeControl();
  let calls = 0;
  const scheduler = createScheduler({ control, poll: async () => { calls += 1; control.killed = true; }, intervalMs: 1, maxCycles: 5 });
  await scheduler.start();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(calls, 1);
});

test('control actions preserve kill as terminal', () => {
  const killed = applyControlAction(createRuntimeControl(), 'kill');
  assert.throws(() => applyControlAction(killed, 'resume'), /requires a fresh runtime instance/);
  assert.equal(killed.killed, true);
  assert.equal(killed.paused, true);
});
