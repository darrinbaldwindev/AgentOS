import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
import { createRemoteExecutionReceipt } from '../runtime/remote-local-bridge-contract.mjs';
import { createRemoteExecutionReceiptPersistence } from '../runtime/remote-execution-receipt-persistence.mjs';

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
    code_identity: 'code:head',
    evidence: ['powershell:exit_code:0'],
    created_at: '2026-09-13T02:40:00.000Z',
    ...overrides,
  };
}

function canonicalReceipt(overrides = {}) {
  return createRemoteExecutionReceipt({
    candidate: { delivery_id: 'delivery:1', request_id: 'request:1', project_id: 'agentos-local' },
    missionId: 'mission:1',
    taskId: 'task:1',
    wakeTraceId: 'wake:1',
    hostId: 'host:1',
    workerId: 'agentos:windows-powershell-worker',
    status: 'AWAITING_GREEN',
    evidence: ['powershell:exit_code:0'],
    budgetStatus: 'RECONCILED',
    codeIdentity: 'code:head',
    createdAt: '2026-09-13T02:40:00.000Z',
    ...overrides,
  });
}

async function withAdapter(fn) {
  const root = await mkdtemp(join(tmpdir(), 'agentos-remote-receipt-persistence-'));
  try {
    const persistence = await createLocalPersistence({ filePath: join(root, 'state.json') });
    const adapter = createRemoteExecutionReceiptPersistence({ persistence });
    await fn({ adapter, persistence });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('records PowerShell receipt in existing remote receipt artifact shape', async () => {
  await withAdapter(async ({ adapter, persistence }) => {
    const input = receipt();
    const entity = await adapter.record({ receipt: input });
    assert.equal(entity.id, 'remote-receipt:delivery:1');
    assert.equal(entity.artifactType, 'remote.execution.receipt');
    assert.deepEqual(entity.payload, input);
    const stored = await persistence.get('artifact', 'remote-receipt:delivery:1');
    assert.deepEqual(stored.payload, input);
  });
});

test('listForDelivery returns only correlated remote receipt artifacts', async () => {
  await withAdapter(async ({ adapter, persistence }) => {
    await adapter.record({ receipt: receipt() });
    await persistence.create('artifact', {
      id: 'remote-receipt:delivery:other',
      artifactType: 'remote.execution.receipt',
      payload: receipt({ delivery_id: 'delivery:other', request_id: 'request:other' }),
    });
    await persistence.create('artifact', {
      id: 'unrelated',
      artifactType: 'other.artifact',
      payload: { delivery_id: 'delivery:1' },
    });
    const found = await adapter.listForDelivery('delivery:1');
    assert.equal(found.length, 1);
    assert.equal(found[0].delivery_id, 'delivery:1');
    assert.equal(found[0].request_id, 'request:1');
  });
});

test('duplicate remote receipt id fails closed and preserves first durable receipt', async () => {
  await withAdapter(async ({ adapter, persistence }) => {
    const first = receipt();
    await adapter.record({ receipt: first });
    await assert.rejects(
      adapter.record({ receipt: receipt({ status: 'COMPLETED' }) }),
      /Duplicate artifact id: remote-receipt:delivery:1/,
    );
    const stored = await persistence.get('artifact', 'remote-receipt:delivery:1');
    assert.equal(stored.payload.status, 'AWAITING_GREEN');
  });
});

test('receipt persistence identity fields are mandatory before persistence', async () => {
  await withAdapter(async ({ adapter }) => {
    await assert.rejects(adapter.record({ receipt: receipt({ delivery_id: '' }) }), /receipt.delivery_id is required/);
    await assert.rejects(adapter.record({ receipt: receipt({ request_id: '' }) }), /receipt.request_id is required/);
    await assert.rejects(adapter.record({ receipt: receipt({ host_id: '' }) }), /receipt.host_id is required/);
  });
});

test('canonical receipt construction rejects missing mission task or wake correlation before persistence', async () => {
  await withAdapter(async ({ adapter, persistence }) => {
    for (const [field, value, expected] of [
      ['missionId', '', /missionId is required/],
      ['taskId', null, /taskId is required/],
      ['wakeTraceId', '   ', /wakeTraceId is required/],
    ]) {
      assert.throws(() => canonicalReceipt({ [field]: value }), expected);
    }
    assert.equal((await persistence.list('artifact')).length, 0);
    await adapter.record({ receipt: canonicalReceipt() });
    assert.equal((await persistence.list('artifact')).length, 1);
  });
});

test('authority evidence id survives durable persistence restart and reload unchanged', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-remote-receipt-reload-'));
  const filePath = join(root, 'state.json');
  try {
    const firstPersistence = await createLocalPersistence({ filePath });
    const firstAdapter = createRemoteExecutionReceiptPersistence({ persistence: firstPersistence });
    await firstAdapter.record({
      receipt: receipt({ authority_evidence_id: 'authority-evidence:grant:exact-1' }),
    });

    const reloadedPersistence = await createLocalPersistence({ filePath });
    const reloadedAdapter = createRemoteExecutionReceiptPersistence({ persistence: reloadedPersistence });
    const found = await reloadedAdapter.listForDelivery('delivery:1');

    assert.equal(found.length, 1);
    assert.equal(found[0].authority_evidence_id, 'authority-evidence:grant:exact-1');
    assert.equal(found[0].request_id, 'request:1');
    assert.equal(found[0].task_id, 'task:1');
    assert.equal(found[0].mission_id, 'mission:1');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('duplicate durable receipt cannot replace original authority evidence provenance', async () => {
  await withAdapter(async ({ adapter, persistence }) => {
    await adapter.record({
      receipt: receipt({ authority_evidence_id: 'authority-evidence:grant:original' }),
    });

    await assert.rejects(
      adapter.record({
        receipt: receipt({ authority_evidence_id: 'authority-evidence:grant:replacement' }),
      }),
      /Duplicate artifact id: remote-receipt:delivery:1/,
    );

    const stored = await persistence.get('artifact', 'remote-receipt:delivery:1');
    assert.equal(stored.payload.authority_evidence_id, 'authority-evidence:grant:original');
    assert.equal(stored.payload.request_id, 'request:1');
    assert.equal(stored.payload.task_id, 'task:1');
  });
});

test('evidence packet projects only reconstructable receipt provenance fields', async () => {
  await withAdapter(async ({ adapter }) => {
    await adapter.record({ receipt: receipt({ authority_evidence_id: 'authority-evidence:grant:exact-1', secret: 'must-not-project' }) });
    const packet = await adapter.evidencePacketForDelivery('delivery:1');
    assert.deepEqual(packet, {
      receipt_id: 'remote-receipt:delivery:1',
      delivery_id: 'delivery:1',
      request_id: 'request:1',
      mission_id: 'mission:1',
      task_id: 'task:1',
      wake_trace_id: 'wake:1',
      host_id: 'host:1',
      worker_id: 'agentos:windows-powershell-worker',
      status: 'AWAITING_GREEN',
      code_identity: 'code:head',
      authority_evidence_id: 'authority-evidence:grant:exact-1',
    });
    assert.equal('secret' in packet, false);
    assert.equal(Object.isFrozen(packet), true);
  });
});

test('evidence packet fails closed when no exact durable receipt exists', async () => {
  await withAdapter(async ({ adapter }) => {
    await assert.rejects(
      adapter.evidencePacketForDelivery('delivery:missing'),
      /REMOTE_RECEIPT_EVIDENCE_EXACTLY_ONE_REQUIRED/,
    );
  });
});

test('evidence packet rejects noncanonical durable receipt id instead of synthesizing provenance', async () => {
  await withAdapter(async ({ adapter, persistence }) => {
    await persistence.create('artifact', {
      id: 'forged-receipt-id',
      artifactType: 'remote.execution.receipt',
      payload: receipt(),
    });
    await assert.rejects(
      adapter.evidencePacketForDelivery('delivery:1'),
      /REMOTE_RECEIPT_EVIDENCE_ID_MISMATCH/,
    );
  });
});

test('evidence packet rejects malformed durable correlation instead of projecting false success', async () => {
  await withAdapter(async ({ adapter, persistence }) => {
    await persistence.create('artifact', {
      id: 'remote-receipt:delivery:1',
      artifactType: 'remote.execution.receipt',
      payload: receipt({ mission_id: '' }),
    });
    await assert.rejects(
      adapter.evidencePacketForDelivery('delivery:1'),
      /receipt.mission_id is required/,
    );
  });
});

test('evidence packet rejects malformed durable task or wake correlation from direct adapter state', async () => {
  for (const [field, value, expected] of [
    ['task_id', '', /receipt.task_id is required/],
    ['wake_trace_id', '   ', /receipt.wake_trace_id is required/],
  ]) {
    await withAdapter(async ({ adapter, persistence }) => {
      await persistence.create('artifact', {
        id: 'remote-receipt:delivery:1',
        artifactType: 'remote.execution.receipt',
        payload: receipt({ [field]: value }),
      });
      await assert.rejects(adapter.evidencePacketForDelivery('delivery:1'), expected);
    });
  }
});

test('correlation-bound evidence packet returns the exact expected mission task and wake lineage', async () => {
  await withAdapter(async ({ adapter }) => {
    await adapter.record({ receipt: receipt() });
    const packet = await adapter.evidencePacketForCorrelation({
      deliveryId: 'delivery:1',
      missionId: 'mission:1',
      taskId: 'task:1',
      wakeTraceId: 'wake:1',
    });
    assert.equal(packet.delivery_id, 'delivery:1');
    assert.equal(packet.mission_id, 'mission:1');
    assert.equal(packet.task_id, 'task:1');
    assert.equal(packet.wake_trace_id, 'wake:1');
  });
});

test('correlation-bound evidence packet rejects cross-mission task or wake borrowing', async () => {
  await withAdapter(async ({ adapter }) => {
    await adapter.record({ receipt: receipt() });
    for (const overrides of [
      { missionId: 'mission:other' },
      { taskId: 'task:other' },
      { wakeTraceId: 'wake:other' },
    ]) {
      await assert.rejects(
        adapter.evidencePacketForCorrelation({
          deliveryId: 'delivery:1',
          missionId: 'mission:1',
          taskId: 'task:1',
          wakeTraceId: 'wake:1',
          ...overrides,
        }),
        /REMOTE_RECEIPT_EVIDENCE_CORRELATION_MISMATCH/,
      );
    }
  });
});

test('correlation-bound evidence survives restart and still denies stale expected lineage', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-remote-receipt-correlation-reload-'));
  const filePath = join(root, 'state.json');
  try {
    const firstPersistence = await createLocalPersistence({ filePath });
    const firstAdapter = createRemoteExecutionReceiptPersistence({ persistence: firstPersistence });
    await firstAdapter.record({ receipt: receipt() });

    const reloadedPersistence = await createLocalPersistence({ filePath });
    const reloadedAdapter = createRemoteExecutionReceiptPersistence({ persistence: reloadedPersistence });
    const exact = await reloadedAdapter.evidencePacketForCorrelation({
      deliveryId: 'delivery:1',
      missionId: 'mission:1',
      taskId: 'task:1',
      wakeTraceId: 'wake:1',
    });
    assert.equal(exact.receipt_id, 'remote-receipt:delivery:1');

    await assert.rejects(
      reloadedAdapter.evidencePacketForCorrelation({
        deliveryId: 'delivery:1',
        missionId: 'mission:stale',
        taskId: 'task:1',
        wakeTraceId: 'wake:1',
      }),
      /REMOTE_RECEIPT_EVIDENCE_CORRELATION_MISMATCH/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
