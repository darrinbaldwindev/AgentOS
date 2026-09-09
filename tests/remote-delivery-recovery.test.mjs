import test from 'node:test';
import assert from 'node:assert/strict';
import { assessRemoteDeliveryClaimRecovery } from '../runtime/remote-delivery-recovery.mjs';

const NOW = new Date('2026-09-09T10:00:00.000Z');

function claim(overrides = {}) {
  return {
    delivery_id: 'delivery-001',
    request_id: 'request-001',
    host_id: 'host-win-001',
    claimed_at: '2026-09-09T09:55:00.000Z',
    state: 'CLAIMED',
    ...overrides,
  };
}

test('fresh claim remains active and cannot be reclaimed', () => {
  const result = assessRemoteDeliveryClaimRecovery({ claim: claim(), now: () => NOW });
  assert.equal(result.disposition, 'ACTIVE_CLAIM');
  assert.equal(result.reclaim_allowed, false);
  assert.equal(result.recovery_required, false);
  assert.equal(result.delivery_id, 'delivery-001');
  assert.equal(result.host_id, 'host-win-001');
});

test('stale claim requires recovery evidence but never auto-reclaims', () => {
  const result = assessRemoteDeliveryClaimRecovery({
    claim: claim({ claimed_at: '2026-09-09T09:30:00.000Z' }),
    now: () => NOW,
    staleAfterMs: 15 * 60 * 1000,
  });
  assert.equal(result.disposition, 'RECOVERY_REQUIRED');
  assert.equal(result.reclaim_allowed, false);
  assert.equal(result.recovery_required, true);
  assert.equal(result.reason, 'STALE_CLAIM_REQUIRES_CORRELATED_RECOVERY_EVIDENCE');
});

test('unsupported state and invalid timestamps fail closed', () => {
  assert.throws(
    () => assessRemoteDeliveryClaimRecovery({ claim: claim({ state: 'COMPLETED' }), now: () => NOW }),
    /REMOTE_CLAIM_STATE_UNSUPPORTED/,
  );
  assert.throws(
    () => assessRemoteDeliveryClaimRecovery({ claim: claim({ claimed_at: 'not-a-date' }), now: () => NOW }),
    /REMOTE_CLAIM_TIMESTAMP_INVALID/,
  );
  assert.throws(
    () => assessRemoteDeliveryClaimRecovery({ claim: claim({ claimed_at: '2026-09-09T10:02:00.000Z' }), now: () => NOW }),
    /REMOTE_CLAIM_TIMESTAMP_IN_FUTURE/,
  );
});

test('recovery threshold must be positive', () => {
  assert.throws(
    () => assessRemoteDeliveryClaimRecovery({ claim: claim(), now: () => NOW, staleAfterMs: 0 }),
    /staleAfterMs must be > 0/,
  );
});
