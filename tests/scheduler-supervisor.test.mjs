import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeControl } from '../src/dispatch/control.mjs';
import { createRuntimeHealth } from '../src/dispatch/runtime-health.mjs';
import { createScheduler } from '../src/dispatch/scheduler.mjs';

test('scheduler accepts supervisor decision and records it', async () => {
  const events = [];
  const health = createRuntimeHealth();
  const control = createRuntimeControl();
  let evaluations = 0;
  const scheduler = createScheduler({
    control, health, intervalMs: 1, maxCycles: 1, poll: async () => true,
    supervisor: { evaluate: () => { evaluations += 1; return { action: 'continue', reason: 'test' }; } },
    audit: { record: async event => events.push(event) },
  });
  await scheduler.start();
  assert.equal(evaluations, 1);
  assert.equal(events[0].type, 'runtime.supervision.decision');
  assert.equal(health.snapshot().consecutive_successes, 1);
});

test('supervisor pause prevents poll execution', async () => {
  const control = createRuntimeControl();
  let calls = 0;
  const scheduler = createScheduler({
    control, intervalMs: 1, maxCycles: 1, poll: async () => { calls += 1; },
    supervisor: { evaluate: () => ({ action: 'pause', reason: 'repeated_poll_failures' }), pause: () => { control.paused = true; } },
  });
  await scheduler.start();
  assert.equal(calls, 0);
  assert.equal(control.paused, true);
});
