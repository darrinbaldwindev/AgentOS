import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSkillAgentOpportunity } from '../src/dispatch/skill-agent-discovery.mjs';

test('repeated workflows with savings become skill agent candidates', () => {
  const candidates = evaluateSkillAgentOpportunity({
    history: [
      { workflow_key: 'supplier-research', estimated_savings: 4, capabilities: ['research'] },
      { workflow_key: 'supplier-research', estimated_savings: 3, capabilities: ['research', 'web'] },
      { workflow_key: 'supplier-research', estimated_savings: 5, capabilities: ['analysis'] },
      { workflow_key: 'one-off', estimated_savings: 100, capabilities: ['misc'] },
    ],
    minOccurrences: 3,
    minSavings: 5,
  });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].workflow_key, 'supplier-research');
  assert.deepEqual(candidates[0].capabilities.sort(), ['analysis', 'research', 'web']);
  assert.equal(candidates[0].estimated_savings, 12);
});
