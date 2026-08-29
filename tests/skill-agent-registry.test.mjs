import test from 'node:test';
import assert from 'node:assert/strict';
import { createSkillAgentRegistry } from '../src/dispatch/skill-agent-registry.mjs';

test('free tier cannot create skill agents', () => {
  const registry = createSkillAgentRegistry({ tier: 'free' });
  assert.equal(registry.limit, 0);
  assert.equal(registry.canCreate(), false);
});

test('tier 2.1 allows one skill agent', () => {
  const registry = createSkillAgentRegistry({ tier: '2.1' });
  registry.register({ id: 'research', name: 'Research Skill', capabilities: ['research'] });
  assert.equal(registry.canCreate(), false);
  assert.throws(() => registry.register({ id: 'second', name: 'Second', capabilities: ['analysis'] }), /limit reached/);
});

test('tier 2.3 allows three skill agents and capability lookup', () => {
  const registry = createSkillAgentRegistry({ tier: '2.3' });
  registry.register({ id: 'a', name: 'A', capabilities: ['research', 'web'] });
  registry.register({ id: 'b', name: 'B', capabilities: ['analysis'] });
  registry.register({ id: 'c', name: 'C', capabilities: ['research'] });
  assert.equal(registry.findByCapability('research').length, 2);
  assert.equal(registry.canCreate(), false);
});
