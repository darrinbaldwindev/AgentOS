import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveOverseerTask } from '../runtime/overseer-preferences.mjs';

test('defaults to balanced routing and a quality floor', () => {
  const task = resolveOverseerTask({ capabilities: ['research'] });
  assert.equal(task.preference, 'balanced');
  assert.equal(task.quality.required, 0.9);
});

test('task preferences override defaults', () => {
  const task = resolveOverseerTask({ preference: 'speed', quality: { required: 0.95 } });
  assert.equal(task.preference, 'speed');
  assert.equal(task.quality.required, 0.95);
});

test('invalid preferences are rejected', () => {
  assert.throws(() => resolveOverseerTask({ preference: 'cheap' }), /invalid routing preference/);
  assert.throws(() => resolveOverseerTask({ quality: { required: 2 } }), /between 0 and 1/);
});
