import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertProfileResourceAccess,
  evaluateProfileResourceAccess,
  partitionProfileResources,
} from '../runtime/profile-resource-boundary.mjs';

for (const resourceKind of ['memory', 'file', 'credential', 'browser-session', 'connection', 'project']) {
  test(`${resourceKind} allows exact same-profile access`, () => {
    const result = evaluateProfileResourceAccess({
      activeProfileId: 'child-1',
      resourceProfileId: 'child-1',
      resourceKind,
    });

    assert.equal(result.allowed, true);
    assert.equal(result.reason, 'PROFILE_MATCH');
  });

  test(`${resourceKind} denies cross-profile access`, () => {
    const result = evaluateProfileResourceAccess({
      activeProfileId: 'child-1',
      resourceProfileId: 'parent-1',
      resourceKind,
    });

    assert.equal(result.allowed, false);
    assert.equal(result.reason, 'CROSS_PROFILE_RESOURCE_DENIED');
  });
}

test('missing resource profile identity fails closed', () => {
  assert.throws(
    () => evaluateProfileResourceAccess({
      activeProfileId: 'child-1',
      resourceKind: 'memory',
    }),
    /resourceProfileId/,
  );
});

test('unknown resource kinds are rejected instead of treated as shared', () => {
  assert.throws(
    () => evaluateProfileResourceAccess({
      activeProfileId: 'child-1',
      resourceProfileId: 'child-1',
      resourceKind: 'unknown-shared-state',
    }),
    (error) => error?.code === 'PROFILE_RESOURCE_KIND_INVALID',
  );
});

test('assertion helper rejects parent credential from child profile', () => {
  assert.throws(
    () => assertProfileResourceAccess({
      activeProfileId: 'child-1',
      resourceProfileId: 'parent-1',
      resourceKind: 'credential',
    }),
    (error) => error?.code === 'CROSS_PROFILE_RESOURCE_DENIED',
  );
});

test('partition does not leak denied resources into allowed projection', () => {
  const resources = [
    { id: 'child-memory', profileId: 'child-1', kind: 'memory' },
    { id: 'parent-memory', profileId: 'parent-1', kind: 'memory' },
    { id: 'child-browser', profileId: 'child-1', kind: 'browser-session' },
    { id: 'parent-credential', profileId: 'parent-1', kind: 'credential' },
  ];

  const result = partitionProfileResources({ activeProfileId: 'child-1', resources });

  assert.deepEqual(result.allowed.map(({ resource }) => resource.id), ['child-memory', 'child-browser']);
  assert.deepEqual(result.denied.map(({ resource }) => resource.id), ['parent-memory', 'parent-credential']);
});

test('presentation mode cannot affect profile resource boundary', () => {
  const simple = evaluateProfileResourceAccess({
    activeProfileId: 'teen-1',
    resourceProfileId: 'parent-1',
    resourceKind: 'browser-session',
    view: 'SIMPLE',
  });
  const techHead = evaluateProfileResourceAccess({
    activeProfileId: 'teen-1',
    resourceProfileId: 'parent-1',
    resourceKind: 'browser-session',
    view: 'TECH_HEAD',
  });

  assert.equal(simple.allowed, false);
  assert.equal(techHead.allowed, false);
});
