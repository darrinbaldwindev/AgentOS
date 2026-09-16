import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileRemoteDeliveryRecoveryEvidence } from '../runtime/remote-delivery-recovery-evidence.mjs';

function claim(overrides = {}) {
  return {
    delivery_id: 'delivery:1',
    request_id: 'request:1',
    host_id: 'host:1',
    mission_id: 'mission:1',
    task_id: 'task:1',
    wake_trace_id: 'wake:1',
    claimed_at: '2026-09-13T02:00:00.000Z',
    state: 'CLAIMED',
    ...overrides,
  };
}

function receipt(overrides = {}) {
  return {
    delivery_id: 'delivery:1',
    request_id: 'request:1',
    host_id: 'host:1',
    mission_id: 'mission:1',
    task_id: 'task:1',
    wake_trace_id: 'wake:1',
    worker_id: 'agentos:windows-powershell-worker',
    status: 'AWAITING_GREEN',
    budget_status: 'RECONCILED',
    code_identity: 'code:exact-head',
    created_at: '2026-09-13T02:00:02.000Z',
    ...overrides,
  };
}

test('missing receipt keeps recovery required and forbids replay', () => {
  const out = reconcileRemoteDeliveryRecoveryEvidence({ claim: claim(), receipts: [] });
  assert.equal(out.disposition, 'RECOVERY_EVIDENCE_MISSING');
  assert.equal(out.recovery_required, true);
  assert.equal(out.replay_allowed, false);
});

test('same delivery with conflicting request, host, mission, task or wake identity fails closed', () => {
  for (const conflicting of [
    receipt({ request_id: 'request:other' }),
    receipt({ host_id: 'host:other' }),
    receipt({ mission_id: 'mission:other' }),
    receipt({ task_id: 'task:other' }),
    receipt({ wake_trace_id: 'wake:other' }),
  ]) {
    const out = reconcileRemoteDeliveryRecoveryEvidence({ claim: claim(), receipts: [conflicting] });
    assert.equal(out.disposition, 'RECOVERY_CORRELATION_CONFLICT');
    assert.equal(out.replay_allowed, false);
  }
});

test('legacy claim without mission/task/wake remains readable but never authorizes replay', () => {
  const legacy = claim({ mission_id: undefined, task_id: undefined, wake_trace_id: undefined });
  const out = reconcileRemoteDeliveryRecoveryEvidence({ claim: legacy, receipts: [receipt()] });
  assert.equal(out.disposition, 'CORRELATED_DURABLE_RECEIPT_PRESENT');
  assert.equal(out.recovery_required, true);
  assert.equal(out.replay_allowed, false);
});

test('multiple correlated receipts are ambiguous and never authorize replay', () => {
  const out = reconcileRemoteDeliveryRecoveryEvidence({
    claim: claim(),
    receipts: [receipt(), receipt({ created_at: '2026-09-13T02:00:03.000Z' })],
  });
  assert.equal(out.disposition, 'RECOVERY_EVIDENCE_AMBIGUOUS');
  assert.equal(out.receipt_count, 2);
  assert.equal(out.replay_allowed, false);
});

test('one exact durable receipt proves blind replay is unsafe and preserves correlation', () => {
  const out = reconcileRemoteDeliveryRecoveryEvidence({ claim: claim(), receipts: [receipt()] });
  assert.equal(out.disposition, 'CORRELATED_DURABLE_RECEIPT_PRESENT');
  assert.equal(out.recovery_required, true);
  assert.equal(out.replay_allowed, false);
  assert.equal(out.receipt.task_id, 'task:1');
  assert.equal(out.receipt.mission_id, 'mission:1');
  assert.equal(out.receipt.wake_trace_id, 'wake:1');
  assert.equal(out.receipt.worker_id, 'agentos:windows-powershell-worker');
  assert.equal(out.receipt.status, 'AWAITING_GREEN');
  assert.equal(out.receipt.code_identity, 'code:exact-head');
});

test('all supported receipt statuses remain evidence, never automatic replay authority', () => {
  for (const status of ['AWAITING_GREEN', 'GREEN_BLOCKED', 'COMPLETED', 'FAILED', 'BLOCKED']) {
    const out = reconcileRemoteDeliveryRecoveryEvidence({ claim: claim(), receipts: [receipt({ status })] });
    assert.equal(out.disposition, 'CORRELATED_DURABLE_RECEIPT_PRESENT');
    assert.equal(out.receipt.status, status);
    assert.equal(out.replay_allowed, false);
  }
});

test('invalid receipt status or incomplete receipt fails closed', () => {
  assert.throws(
    () => reconcileRemoteDeliveryRecoveryEvidence({ claim: claim(), receipts: [receipt({ status: 'SUCCESS' })] }),
    /REMOTE_RECEIPT_STATUS_INVALID/,
  );
  assert.throws(
    () => reconcileRemoteDeliveryRecoveryEvidence({ claim: claim({ wake_trace_id: undefined }), receipts: [receipt({ wake_trace_id: '' })] }),
    /receipt.wake_trace_id is required/,
  );
});
