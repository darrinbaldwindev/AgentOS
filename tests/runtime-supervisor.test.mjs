import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRuntime } from '../src/dispatch/runtime-supervisor.mjs';

test('healthy runtime continues', () => {
  assert.deepEqual(evaluateRuntime({ health: { status: 'running' }, control: {} }), { action: 'continue', reason: 'runtime_healthy' });
});

test('transient degradation is observed', () => {
  assert.deepEqual(evaluateRuntime({ health: { status: 'degraded', consecutive_errors: 1 }, control: {} }), { action: 'observe', reason: 'transient_runtime_failure' });
});

test('repeated failures request pause', () => {
  assert.deepEqual(evaluateRuntime({ health: { status: 'degraded', consecutive_errors: 3 }, control: {} }), { action: 'pause', reason: 'repeated_poll_failures' });
});

test('kill and pause remain authoritative', () => {
  assert.equal(evaluateRuntime({ health: { status: 'running' }, control: { killed: true } }).action, 'remain_killed');
  assert.equal(evaluateRuntime({ health: { status: 'running' }, control: { paused: true } }).action, 'remain_paused');
});
