import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createFamilySafetyFinding,
  summarizeFamilySafetyCheck,
} from '../runtime/family-safety-evidence.mjs';

const NOW = '2026-09-19T05:30:00.000Z';
const RECENT = '2026-09-19T05:20:00.000Z';

function verified(checkId) {
  return createFamilySafetyFinding({
    checkId,
    status: 'VERIFIED',
    observedAt: RECENT,
    evidenceSource: 'fixture:read-only-probe',
  });
}

test('all required checks must be current before CHECKS_PASSED', () => {
  const result = summarizeFamilySafetyCheck({
    findings: [verified('firewall'), verified('antivirus')],
    requiredCheckIds: ['firewall', 'antivirus'],
    now: NOW,
  });

  assert.equal(result.overallStatus, 'CHECKS_PASSED');
  assert.equal(result.safeClaimPermitted, false);
  assert.deepEqual(result.verifiedCheckIds, ['firewall', 'antivirus']);
});

test('missing required check forces UNKNOWN', () => {
  const result = summarizeFamilySafetyCheck({
    findings: [verified('firewall')],
    requiredCheckIds: ['firewall', 'antivirus'],
    now: NOW,
  });

  assert.equal(result.overallStatus, 'UNKNOWN');
  assert.deepEqual(result.unknownCheckIds, ['antivirus']);
});

test('blocked required check cannot be represented as passed', () => {
  const result = summarizeFamilySafetyCheck({
    findings: [
      verified('firewall'),
      createFamilySafetyFinding({ checkId: 'admin-separation', status: 'BLOCKED', detail: 'insufficient read authority' }),
    ],
    requiredCheckIds: ['firewall', 'admin-separation'],
    now: NOW,
  });

  assert.equal(result.overallStatus, 'UNKNOWN');
  assert.deepEqual(result.blockedCheckIds, ['admin-separation']);
});

test('stale verified evidence is downgraded to UNKNOWN', () => {
  const result = summarizeFamilySafetyCheck({
    findings: [createFamilySafetyFinding({
      checkId: 'firewall',
      status: 'VERIFIED',
      observedAt: '2026-09-17T05:20:00.000Z',
      evidenceSource: 'fixture:stale-probe',
    })],
    requiredCheckIds: ['firewall'],
    now: NOW,
    maxEvidenceAgeMs: 60 * 60 * 1000,
  });

  assert.equal(result.overallStatus, 'UNKNOWN');
  assert.equal(result.findings[0].reason, 'STALE_OR_INVALID_EVIDENCE');
});

test('future-dated evidence is not accepted as current', () => {
  const result = summarizeFamilySafetyCheck({
    findings: [createFamilySafetyFinding({
      checkId: 'firewall',
      status: 'VERIFIED',
      observedAt: '2026-09-19T06:20:00.000Z',
      evidenceSource: 'fixture:future-probe',
    })],
    requiredCheckIds: ['firewall'],
    now: NOW,
  });

  assert.equal(result.overallStatus, 'UNKNOWN');
});

test('attention finding requires parent action', () => {
  const result = summarizeFamilySafetyCheck({
    findings: [createFamilySafetyFinding({
      checkId: 'remote-access',
      status: 'NEEDS_ATTENTION',
      observedAt: RECENT,
      evidenceSource: 'fixture:read-only-probe',
      detail: 'unexpected remote access software found',
    })],
    requiredCheckIds: ['remote-access'],
    now: NOW,
  });

  assert.equal(result.overallStatus, 'PARENT_ACTION_REQUIRED');
  assert.deepEqual(result.needsAttentionCheckIds, ['remote-access']);
});

test('evidence-backed pass requires source and timestamp', () => {
  assert.throws(
    () => createFamilySafetyFinding({ checkId: 'firewall', status: 'VERIFIED' }),
    /evidenceSource/,
  );
});

test('duplicate findings fail closed rather than selecting one', () => {
  assert.throws(
    () => summarizeFamilySafetyCheck({
      findings: [verified('firewall'), verified('firewall')],
      requiredCheckIds: ['firewall'],
      now: NOW,
    }),
    (error) => error?.code === 'FAMILY_SAFETY_DUPLICATE_FINDING',
  );
});

test('unsupported status is rejected', () => {
  assert.throws(
    () => createFamilySafetyFinding({ checkId: 'firewall', status: 'SAFE' }),
    (error) => error?.code === 'FAMILY_SAFETY_STATUS_INVALID',
  );
});
