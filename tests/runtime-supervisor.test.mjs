import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRuntime } from '../src/dispatch/runtime-supervisor.mjs';

const status = (health, control = {}) => ({ status: { health, control } });

test('healthy runtime continues', () => {
  assert.deepEqual(evaluateRuntime(status({ status: 'running' })), { action: 'continue', reason: 'runtime_healthy' });
});

test('transient degradation is observed', () => {
  assert.deepEqual(evaluateRuntime(status({ status: 'degraded', consecutive_errors: 1 })), { action: 'observe', reason: 'transient_runtime_failure' });
});

test('repeated failures request pause', () => {
  assert.deepEqual(evaluateRuntime(status({ status: 'degraded', consecutive_errors: 3 })), { action: 'pause', reason: 'repeated_poll_failures' });
});

test('kill and pause remain authoritative', () => {
  assert.equal(evaluateRuntime(status({ status: 'running' }, { killed: true })).action, 'remain_killed');
  assert.equal(evaluateRuntime(status({ status: 'running' }, { paused: true })).action, 'remain_paused');
});
