import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeControl } from '../src/dispatch/control.mjs';
import { createRuntimeHealth } from '../src/dispatch/runtime-health.mjs';
import { createScheduler } from '../src/dispatch/scheduler.mjs';

test('scheduler updates health on startup and successful poll', async () => {
  const health = createRuntimeHealth({ now: () => new Date('2026-08-29T00:00:00Z') });
  const scheduler = createScheduler({ control: createRuntimeControl(), health, poll: async () => true, intervalMs: 1, maxCycles: 1 });
  assert.equal(health.snapshot().status, 'running');
  await scheduler.start();
  assert.equal(health.snapshot().cycles, 1);
  assert.equal(health.snapshot().last_poll_at, '2026-08-29T00:00:00.000Z');
});

test('scheduler marks health degraded on poll failure', async () => {
  const health = createRuntimeHealth({ now: () => new Date('2026-08-29T00:00:00Z') });
  const scheduler = createScheduler({ control: createRuntimeControl(), health, poll: async () => { throw new Error('failure'); }, intervalMs: 1, maxCycles: 1 });
  await scheduler.start();
  assert.equal(health.snapshot().status, 'degraded');
  assert.equal(health.snapshot().last_error_at, '2026-08-29T00:00:00.000Z');
});
