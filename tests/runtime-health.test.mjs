import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeHealth } from '../src/dispatch/runtime-health.mjs';

test('runtime health tracks lifecycle and heartbeat', () => {
  const date = new Date('2026-08-28T00:00:00Z');
  const health = createRuntimeHealth({ now: () => date });
  assert.equal(health.snapshot().status, 'starting');
  health.started();
  health.pollStarted();
  assert.equal(health.snapshot().status, 'running');
  assert.equal(health.snapshot().cycles, 1);
  assert.equal(health.snapshot().last_poll_at, date.toISOString());
  health.pollFailed();
  assert.equal(health.snapshot().status, 'degraded');
  assert.equal(health.snapshot().last_error_at, date.toISOString());
  health.stopped();
  assert.equal(health.snapshot().status, 'stopped');
});
