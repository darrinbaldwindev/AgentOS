import test from 'node:test';
import assert from 'node:assert/strict';
import { createMissionCheckpointStore } from '../runtime/mission-checkpoint.mjs';

test('checkpoint preserves mission context and next action for resume', () => {
  const store = createMissionCheckpointStore();
  store.save({ missionId: 'm1', state: 'awaiting_human', context: { workerId: 'chatgpt', attempt: 2 }, nextAction: 'verify_after_approval' });
  const checkpoint = store.load('m1');
  assert.equal(checkpoint.state, 'awaiting_human');
  assert.equal(checkpoint.context.attempt, 2);
  assert.equal(checkpoint.nextAction, 'verify_after_approval');
});
