import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeControl } from '../src/dispatch/control.mjs';
import { createScheduler } from '../src/dispatch/scheduler.mjs';

test('scheduler records poll lifecycle events', async () => {
  const events = [];
  const scheduler = createScheduler({
    control: createRuntimeControl(), intervalMs: 1, maxCycles: 1,
    poll: async () => ({ completed: true }),
    audit: { record: async event => { events.push(event); } }, actor: 'test-scheduler',
  });
  await scheduler.start();
  assert.deepEqual(events.map(event => event.type), ['runtime.poll.start', 'runtime.poll.complete']);
  assert.equal(events[0].metadata.cycle, 1);
});

test('scheduler records poll errors and still invokes error handler', async () => {
  const events = [];
  let handled = false;
  const scheduler = createScheduler({
    control: createRuntimeControl(), intervalMs: 1, maxCycles: 1,
    poll: async () => { throw new Error('boom'); },
    audit: { record: async event => { events.push(event); } },
    onError: () => { handled = true; },
  });
  await scheduler.start();
  assert.equal(handled, true);
  assert.equal(events[1].type, 'runtime.poll.error');
  assert.equal(events[1].outcome, 'failure');
});
