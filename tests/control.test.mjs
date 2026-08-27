import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeControl, canRun, applyControlAction } from '../src/dispatch/control.mjs';

test('runtime can be paused and resumed', () => {
  let control = createRuntimeControl();
  assert.equal(canRun(control), true);
  control = applyControlAction(control, 'pause');
  assert.equal(canRun(control), false);
  control = applyControlAction(control, 'resume');
  assert.equal(canRun(control), true);
});

test('kill is terminal for runtime execution', () => {
  const killed = applyControlAction(createRuntimeControl(), 'kill');
  assert.equal(killed.killed, true);
  assert.equal(killed.paused, true);
  assert.equal(canRun(killed), false);
});
