import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTONOMY_LEVELS,
  createAutonomyPolicy,
  evaluateAutonomy,
  effectiveAuthority,
  isAutonomyActive,
  validateAutonomyLevel,
} from '../src/governance/autonomy.mjs';

test('validates all autonomy levels 0 through 5', () => {
  for (let level = 0; level <= 5; level += 1) assert.equal(validateAutonomyLevel(level), true);
  assert.throws(() => validateAutonomyLevel(-1), /invalid autonomy level/);
  assert.throws(() => validateAutonomyLevel(6), /invalid autonomy level/);
});

test('autonomy level is evaluated independently from capability authority', () => {
  const policy = createAutonomyPolicy({ level: AUTONOMY_LEVELS.HIGH_AUTONOMY });
  assert.deepEqual(evaluateAutonomy({ policy, requiredLevel: 4 }).allowed, true);
  assert.deepEqual(effectiveAuthority({
    autonomy: policy,
    authorised: true,
    capabilityGranted: false,
    inScope: true,
    withinBudget: true,
  }), { allowed: false, reason: 'capability_not_granted' });
});

test('temporary autonomy expires and fails closed', () => {
  const policy = createAutonomyPolicy({ level: 4, expiresAt: '2026-09-07T02:00:00.000Z' });
  assert.equal(isAutonomyActive(policy, new Date('2026-09-07T01:59:59.000Z')), true);
  assert.equal(isAutonomyActive(policy, new Date('2026-09-07T02:00:00.000Z')), false);
  assert.deepEqual(evaluateAutonomy({
    policy,
    requiredLevel: 4,
    now: new Date('2026-09-07T02:00:00.000Z'),
  }), { allowed: false, reason: 'autonomy_policy_inactive' });
});

test('effective authority preserves hard safety boundaries', () => {
  const policy = createAutonomyPolicy({ level: 5 });
  const base = { autonomy: policy, authorised: true, capabilityGranted: true, inScope: true, withinBudget: true };
  assert.deepEqual(effectiveAuthority(base), { allowed: true, reason: 'effective_authority_granted' });
  assert.deepEqual(effectiveAuthority({ ...base, production: true }), { allowed: false, reason: 'production_denied' });
  assert.deepEqual(effectiveAuthority({ ...base, authorised: false }), { allowed: false, reason: 'authority_not_granted' });
});

for (const field of ['authorised', 'capabilityGranted', 'inScope', 'withinBudget']) {
  for (const value of ['false', 1, {}, []]) test(`non-boolean ${field} cannot grant authority: ${JSON.stringify(value)}`, () => {
    const input = { autonomy: createAutonomyPolicy({ level: 4 }), authorised: true, capabilityGranted: true, inScope: true, withinBudget: true };
    assert.equal(effectiveAuthority({ ...input, [field]: value }).allowed, false);
  });
}
for (const production of [null, 0, '', 'false']) test(`ambiguous production context fails: ${JSON.stringify(production)}`, () => {
  assert.equal(effectiveAuthority({ autonomy: createAutonomyPolicy({ level: 4 }), authorised: true,
    capabilityGranted: true, inScope: true, withinBudget: true, production }).allowed, false);
});
