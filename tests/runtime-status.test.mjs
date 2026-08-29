import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeControl } from '../src/dispatch/control.mjs';
import { createRuntimeHealth } from '../src/dispatch/runtime-health.mjs';
import { createRuntimeStatus } from '../src/dispatch/runtime-status.mjs';

test('runtime status combines control, health and scheduler state', () => {
  const control = createRuntimeControl();
  const health = createRuntimeHealth({ now: () => new Date('2026-08-28T00:00:00Z') });
  health.started();
  health.pollStarted();
  const status = createRuntimeStatus({ control, health, scheduler: { getCycles: () => 1 } }).snapshot();
  assert.equal(status.control.paused, false);
  assert.equal(status.control.killed, false);
  assert.equal(status.health.status, 'running');
  assert.equal(status.health.cycles, 1);
  assert.equal(status.scheduler.cycles, 1);
});
