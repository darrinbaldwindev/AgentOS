import test from 'node:test';
import assert from 'node:assert/strict';
import { createEfficiencyGovernor } from '../src/dispatch/efficiency-governor.mjs';

test('governor prevents spending beyond token, call and cost budgets', () => {
  const governor = createEfficiencyGovernor({ budget: { maxCost: 1, maxCalls: 2, maxTokens: 1000 } });
  assert.equal(governor.canSpend(governor.estimate({ cost: 0.5, calls: 1, tokens: 500 })), true);
  assert.equal(governor.canSpend(governor.estimate({ cost: 1.1, calls: 1, tokens: 500 })), false);
  governor.record({ cost: 0.5, calls: 1, tokens: 500 });
  assert.deepEqual(governor.remaining(), { cost: 0.5, calls: 1, tokens: 500 });
});
