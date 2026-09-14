import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
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

test('receipt correlation identifiers are mandatory before persistence', async () => {
  await withAdapter(async ({ adapter }) => {
    await assert.rejects(adapter.record({ receipt: receipt({ delivery_id: '' }) }), /receipt.delivery_id is required/);
    await assert.rejects(adapter.record({ receipt: receipt({ request_id: '' }) }), /receipt.request_id is required/);
    await assert.rejects(adapter.record({ receipt: receipt({ host_id: '' }) }), /receipt.host_id is required/);
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
