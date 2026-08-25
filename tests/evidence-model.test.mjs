import test from 'node:test';
import assert from 'node:assert/strict';
import { assessEvidence, createEvidence } from '../runtime/evidence-model.mjs';

test('evidence model verifies complete evidence', () => {
  const result = assessEvidence([
    createEvidence({ type: 'commit', source: 'github:abc' }),
    createEvidence({ type: 'test', source: 'test:core', status: 'verified' }),
  ]);
  assert.equal(result.status, 'VERIFIED');
});

test('evidence model distinguishes unverified work and conflicts', () => {
  assert.equal(assessEvidence([{ type: 'artifact', source: 'artifact:1', status: 'unverified' }]).status, 'UNVERIFIED');
  assert.equal(assessEvidence([{ type: 'ci', source: 'ci:1', status: 'conflict' }]).status, 'CONFLICT');
});
