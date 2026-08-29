import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeControl, applyControlAction } from '../src/dispatch/control.mjs';
import { evaluateRuntime } from '../src/dispatch/runtime-supervisor.mjs';

test('supervisor decision can be applied through authoritative control API', () => {
  const control = createRuntimeControl();
  const decision = evaluateRuntime({ health: { status: 'degraded', consecutive_errors: 3 }, control });
  assert.equal(decision.action, 'pause');
  const next = applyControlAction(control, decision.action);
  assert.equal(next.paused, true);
  assert.equal(next.killed, false);
});
