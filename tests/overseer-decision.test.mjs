import test from 'node:test';
import assert from 'node:assert/strict';
import { decideFromEvidence } from '../runtime/overseer-decision.mjs';

test('verified evidence allows requested action', () => {
  assert.equal(decideFromEvidence({ evidenceStatus: 'VERIFIED', requestedAction: 'merge' }).decision, 'ALLOW');
});

test('unverified evidence requires verification', () => {
  assert.equal(decideFromEvidence({ evidenceStatus: 'UNVERIFIED' }).decision, 'REQUIRE_VERIFICATION');
});

test('conflicting evidence halts for reconciliation', () => {
  assert.equal(decideFromEvidence({ evidenceStatus: 'CONFLICT' }).decision, 'HALT_AND_RECONCILE');
});
