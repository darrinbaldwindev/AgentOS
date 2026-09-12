import test from 'node:test';
import assert from 'node:assert/strict';
import { createCapabilityPassport, findCapabilityGaps, hasCapability, upsertWorker, expireWorkers } from '../src/capabilities/passport.mjs';

test('passport normalizes workers and records connection modes', () => {
  const passport = createCapabilityPassport({ workers: [{ id: 'gemini', provider: 'google', status: 'healthy', capabilities: ['research'], connectionModes: ['api', 'oauth'] }] });
  assert.equal(passport.workers[0].id, 'gemini');
  assert.deepEqual(passport.workers[0].connectionModes, ['api', 'oauth']);
});

test('passport detects missing capabilities', () => {
  const passport = createCapabilityPassport({ workers: [{ id: 'worker', status: 'healthy', capabilities: ['coding'] }] });
  assert.equal(hasCapability(passport, 'coding'), true);
  assert.deepEqual(findCapabilityGaps(passport, ['coding', 'research']), ['research']);
});

test('upsert replaces a worker without duplicating it', () => {
  let passport = createCapabilityPassport({ workers: [{ id: 'worker', status: 'healthy', capabilities: ['coding'] }] });
  passport = upsertWorker(passport, { id: 'worker', status: 'healthy', capabilities: ['coding', 'testing'] });
  assert.equal(passport.workers.length, 1);
  assert.deepEqual(passport.workers[0].capabilities, ['coding', 'testing']);
});

test('expired subscription workers become expired', () => {
  const passport = createCapabilityPassport({ workers: [{ id: 'trial', status: 'healthy', capabilities: ['research'], expiresAt: '2026-08-01T00:00:00.000Z' }] });
  const expired = expireWorkers(passport, '2026-08-29T00:00:00.000Z');
  assert.equal(expired.workers[0].status, 'expired');
});
