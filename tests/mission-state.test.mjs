import test from 'node:test';
import assert from 'node:assert/strict';
import { createMissionStore } from '../runtime/mission-state.mjs';

test('mission lifecycle preserves state across human pause and resume', () => {
  const store = createMissionStore();
  store.create({ id: 'm1', task: { risk: 'high' }, message: 'review this' });
  const paused = store.transition('m1', 'awaiting_human', { reason: 'unresolved_disagreement' });
  assert.equal(paused.state, 'awaiting_human');
  assert.equal(paused.version, 2);
  const resumed = store.transition('m1', 'running', { humanDecision: 'approve' });
  assert.equal(resumed.state, 'running');
  assert.equal(resumed.humanDecision, 'approve');
  assert.equal(resumed.version, 3);
});

test('unknown missions cannot transition', () => {
  const store = createMissionStore();
  assert.throws(() => store.transition('missing', 'running'), /mission not found/);
});
