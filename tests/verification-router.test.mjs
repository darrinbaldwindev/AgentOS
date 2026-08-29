import test from 'node:test';
import assert from 'node:assert/strict';
import { createVerificationRouter } from '../runtime/verification-router.mjs';

test('verification uses the common router and avoids the original worker', async () => {
  let received;
  const router = createVerificationRouter({ router: { select: async args => { received = args; return { selected: args.workers[0], reason: 'selected' }; } } });
  const result = await router.selectVerifier({
    task: { capabilities: ['research'], quality: { required: 0.95 }, preference: 'cost' },
    result: { workerId: 'chatgpt', availableWorkers: [
      { id: 'chatgpt', capabilities: ['research', 'verification'], quality: { floor: 0.99 } },
      { id: 'gemini', capabilities: ['research', 'verification'], quality: { floor: 0.96 } },
    ] },
  });
  assert.equal(result.selected.id, 'gemini');
  assert.equal(received.task.quality.required, 0.95);
  assert.equal(received.task.preference, 'cost');
});
