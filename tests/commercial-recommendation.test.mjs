import test from 'node:test';
import assert from 'node:assert/strict';
import { recommendUpgrade } from '../src/commercial/recommend.mjs';

test('does not recommend a paid worker without a capability gap', () => {
  const result = recommendUpgrade({ task: { type: 'research', capabilityGap: null }, candidates: [] });
  assert.equal(result, null);
});

test('recommends a worker for a genuine capability gap', () => {
  const result = recommendUpgrade({
    task: { type: 'automation', capabilityGap: 'automation', temporarySpike: true },
    currentWorkers: [{ capabilities: ['research'] }],
    candidates: [{
      id: 'n8n',
      status: 'active',
      capabilities: ['automation'],
      taskTypes: ['automation'],
      connectionModes: ['subscription', 'api'],
      affiliateStatus: 'verify-current',
      costScore: 80,
      setupScore: 70,
    }],
  });

  assert.equal(result.provider, 'n8n');
  assert.equal(result.tryOneMonth, true);
  assert.equal(result.commercialDisclosureRequired, true);
});

test('does not recommend an upgrade when the existing worker already covers the gap', () => {
  const result = recommendUpgrade({
    task: { type: 'coding', capabilityGap: 'coding' },
    currentWorkers: [{ capabilities: ['coding'] }],
    candidates: [{ id: 'devin', status: 'active', capabilities: ['coding'], taskTypes: ['coding'], connectionModes: ['api'] }],
  });
  assert.equal(result, null);
});
