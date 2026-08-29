import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSkillAgentEconomics } from '../src/dispatch/skill-agent-economics.mjs';

test('skill agent is worthwhile when projected savings exceed costs with confidence', () => {
  const result = evaluateSkillAgentEconomics({ creationCost: 2, maintenanceCost: 1, projectedSavings: 10, confidence: 0.9 });
  assert.equal(result.netSavings, 7);
  assert.equal(result.worthwhile, true);
});

test('low confidence blocks autonomous creation', () => {
  const result = evaluateSkillAgentEconomics({ creationCost: 1, projectedSavings: 10, confidence: 0.5 });
  assert.equal(result.worthwhile, false);
  assert.equal(result.reason, 'insufficient_confidence');
});

test('negative economics blocks creation', () => {
  const result = evaluateSkillAgentEconomics({ creationCost: 5, maintenanceCost: 3, projectedSavings: 4, confidence: 1 });
  assert.equal(result.worthwhile, false);
  assert.equal(result.netSavings, -4);
});
