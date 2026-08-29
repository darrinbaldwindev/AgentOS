import test from 'node:test';
import assert from 'node:assert/strict';
import { createOverseerDecisionLoop } from '../runtime/overseer-decision-loop.mjs';

test('decision loop resolves requirements, routes, executes and observes', async () => {
  const calls = [];
  const loop = createOverseerDecisionLoop({
    router: { select: async ({ task }) => { calls.push(['route', task]); return { selected: { id: 'chatgpt' }, reason: 'selected' }; } },
    execute: async input => { calls.push(['execute', input]); return { runId: 'run-1', output: 'ok' }; },
    observe: async input => { calls.push(['observe', input]); return { quality: 0.95, cost: 0.02 }; },
  });

  const result = await loop.run({ missionId: 'm1', message: 'research', task: { capabilities: ['research'], preference: 'cost' } });
  assert.equal(result.status, 'completed');
  assert.equal(result.task.quality.required, 0.9);
  assert.equal(result.route.selected.id, 'chatgpt');
  assert.equal(result.observation.quality, 0.95);
  assert.equal(calls.length, 3);
});

test('decision loop blocks cleanly when no worker qualifies', async () => {
  const loop = createOverseerDecisionLoop({ router: { select: async () => ({ selected: null, reason: 'quality_or_capability_unavailable' }) }, execute: async () => { throw new Error('must not execute'); } });
  const result = await loop.run({ task: { quality: { required: 0.99 } } });
  assert.equal(result.status, 'blocked');
});
