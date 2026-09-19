import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertFamilyCapabilityAllowed,
  evaluateFamilyProfilePolicy,
} from '../runtime/family-profile-policy.mjs';

const child = { profileId: 'child-1', role: 'CHILD', view: 'SIMPLE', ageBand: '8-12' };
const teen = { profileId: 'teen-1', role: 'TEEN', view: 'TECH_HEAD', ageBand: '13-17' };

function activePolicy(overrides = {}) {
  return {
    policyId: 'parent-policy-1',
    active: true,
    revoked: false,
    allowedCapabilities: ['browser.read', 'files.read', 'message.send'],
    deniedCapabilities: [],
    approvalRequiredCapabilities: [],
    ...overrides,
  };
}

test('child profile fails closed when parent policy is missing', () => {
  const result = evaluateFamilyProfilePolicy({
    profile: child,
    upstreamCapabilities: ['browser.read'],
    requestedCapabilities: ['browser.read'],
  });

  assert.deepEqual(result.allowedCapabilities, []);
  assert.equal(result.decisions[0].reason, 'PARENT_POLICY_REQUIRED');
});

test('parent policy cannot grant capability absent from upstream authority', () => {
  const result = evaluateFamilyProfilePolicy({
    profile: child,
    upstreamCapabilities: ['browser.read'],
    requestedCapabilities: ['browser.read', 'message.send'],
    parentPolicy: activePolicy(),
  });

  assert.deepEqual(result.allowedCapabilities, ['browser.read']);
  assert.equal(result.decisions.find((item) => item.capability === 'message.send').reason, 'NOT_GRANTED_UPSTREAM');
});

test('explicit deny overrides parent allowlist', () => {
  const result = evaluateFamilyProfilePolicy({
    profile: child,
    upstreamCapabilities: ['browser.read'],
    requestedCapabilities: ['browser.read'],
    parentPolicy: activePolicy({ deniedCapabilities: ['browser.read'] }),
  });

  assert.deepEqual(result.allowedCapabilities, []);
  assert.equal(result.decisions[0].reason, 'DENIED_BY_PROFILE_POLICY');
});

test('approval-required capability is not treated as allowed', () => {
  const result = evaluateFamilyProfilePolicy({
    profile: child,
    upstreamCapabilities: ['message.send'],
    requestedCapabilities: ['message.send'],
    parentPolicy: activePolicy({ approvalRequiredCapabilities: ['message.send'] }),
  });

  assert.deepEqual(result.allowedCapabilities, []);
  assert.equal(result.decisions[0].reason, 'PARENT_APPROVAL_REQUIRED');
});

test('revoked policy fails closed', () => {
  const result = evaluateFamilyProfilePolicy({
    profile: child,
    upstreamCapabilities: ['browser.read'],
    requestedCapabilities: ['browser.read'],
    parentPolicy: activePolicy({ revoked: true }),
  });

  assert.equal(result.policyStatus, 'MISSING_OR_INACTIVE');
  assert.deepEqual(result.allowedCapabilities, []);
});

test('UI depth does not widen teen authority', () => {
  const result = evaluateFamilyProfilePolicy({
    profile: teen,
    upstreamCapabilities: ['browser.read', 'message.send'],
    requestedCapabilities: ['browser.read', 'message.send'],
    parentPolicy: activePolicy({ allowedCapabilities: ['browser.read'] }),
  });

  assert.deepEqual(result.allowedCapabilities, ['browser.read']);
  assert.equal(result.profile.view, 'TECH_HEAD');
  assert.equal(result.decisions.find((item) => item.capability === 'message.send').mode, 'deny');
});

test('guest profile fails closed without explicit policy', () => {
  const result = evaluateFamilyProfilePolicy({
    profile: { profileId: 'guest-1', role: 'GUEST', view: 'ESSENTIALS' },
    upstreamCapabilities: ['browser.read'],
    requestedCapabilities: ['browser.read'],
  });

  assert.deepEqual(result.allowedCapabilities, []);
  assert.equal(result.decisions[0].reason, 'GUEST_POLICY_REQUIRED');
});

test('parent profile still cannot exceed upstream authority', () => {
  const result = evaluateFamilyProfilePolicy({
    profile: { profileId: 'parent-1', role: 'PARENT', view: 'SIMPLE' },
    upstreamCapabilities: ['files.read'],
    requestedCapabilities: ['files.read', 'system.admin'],
  });

  assert.deepEqual(result.allowedCapabilities, ['files.read']);
  assert.equal(result.decisions.find((item) => item.capability === 'system.admin').reason, 'NOT_GRANTED_UPSTREAM');
});

test('assert helper fails closed when any requested capability is denied', () => {
  assert.throws(
    () => assertFamilyCapabilityAllowed({
      profile: child,
      upstreamCapabilities: ['browser.read'],
      requestedCapabilities: ['browser.read', 'message.send'],
      parentPolicy: activePolicy(),
    }),
    (error) => error?.code === 'FAMILY_PROFILE_POLICY_DENIED',
  );
});
