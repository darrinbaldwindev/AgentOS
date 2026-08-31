import test from 'node:test';
import assert from 'node:assert/strict';
import { rankEligibleWorkers, selectEligibleWorker } from '../src/dispatch/unified-worker-routing.mjs';

const workers = [
  { id: 'free-specialist', capabilities: ['research'], score: 80 },
  { id: 'paid-general', capabilities: ['research', 'analysis'], score: 60, referral: 'affiliate' },
  { id: 'ineligible', capabilities: ['coding'], score: 100 },
];

test('routing filters by required capability before score', () => {
  assert.deepEqual(rankEligibleWorkers({ workers, requiredCapabilities: ['research'] }).map(w => w.id), ['free-specialist', 'paid-general']);
});

test('routing can exclude unavailable workers', () => {
  const selected = selectEligibleWorker({ workers, requiredCapabilities: ['research'], eligible: worker => worker.id !== 'free-specialist' });
  assert.equal(selected.id, 'paid-general');
});

test('routing does not use referral metadata as capability', () => {
  assert.throws(() => selectEligibleWorker({ workers: [{ id: 'affiliate-only', capabilities: [], referral: 'affiliate' }], requiredCapabilities: ['research'] }), /NO_ELIGIBLE_WORKER/);
});
