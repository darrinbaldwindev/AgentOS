import test from 'node:test';
import assert from 'node:assert/strict';
import { assessOverseerEligibility, assertOverseerEligible } from '../runtime/overseer-eligibility.mjs';

const connected = {
  github: { probeRead: async () => true },
  continuity: { probeRead: async () => true },
  handoff: { probe: async () => true },
  workspace: { probeRead: async () => true, probeWrite: async () => true },
};

test('Overseer eligibility passes only after real integration probes', async () => {
  const result = await assessOverseerEligibility(connected);
  assert.equal(result.eligible, true);
  assert.equal(result.localPreferred, true);
});

test('Overseer eligibility blocks missing GitHub connectivity', async () => {
  const result = await assessOverseerEligibility({ ...connected, github: { probeRead: async () => false } });
  assert.equal(result.eligible, false);
  await assert.rejects(() => assertOverseerEligible({ ...connected, github: { probeRead: async () => false } }), /github\.read/);
});
