import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeterministicSkillAgent } from '../src/workers/deterministic-skill-agent.mjs';

test('deterministic Skill Agent satisfies the worker contract', async () => {
  const agent = createDeterministicSkillAgent({ id: 'skill:formatter', capabilities: ['formatting'], handler: async ({ message }) => message.trim().toUpperCase() });
  const result = await agent.execute({ message: ' hello ' });
  assert.equal(result.workerId, 'skill:formatter');
  assert.equal(result.output, 'HELLO');
  assert.equal(result.success, true);
  assert.equal(typeof result.latencyMs, 'number');
});
