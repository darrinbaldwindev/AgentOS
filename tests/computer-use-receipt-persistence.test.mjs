import test from 'node:test';
import assert from 'node:assert/strict';
import { createComputerUseReceiptPersistence } from '../runtime/computer-use-receipt-persistence.mjs';

function persistenceHarness() {
  const artifacts = new Map();
  return {
    async create(type, input) {
      assert.equal(type, 'artifact');
      if (artifacts.has(input.id)) throw new Error('duplicate');
      const entity = structuredClone(input);
      artifacts.set(input.id, entity);
      return structuredClone(entity);
    },
    async list(type) {
      assert.equal(type, 'artifact');
      return [...artifacts.values()].map((value) => structuredClone(value));
    },
  };
}

function receipt(overrides = {}) {
  return {
    delivery_id: 'delivery-operator-persistence-1',
    request_id: 'request-operator-persistence-1',
    host_id: 'host-operator-persistence-1',
    status: 'AWAITING_GREEN',
    execution: {
      action: 'computer.click',
      provider: 'provider-fixture',
      model: 'model-fixture',
    },
    ...overrides,
  };
}

test('persists computer-use evidence through the canonical remote receipt artifact vocabulary', async () => {
  const store = createComputerUseReceiptPersistence({ persistence: persistenceHarness() });
  const input = receipt();
  const entity = await store.record({ receipt: input });

  assert.equal(entity.id, `remote-receipt:${input.delivery_id}`);
  assert.equal(entity.artifactType, 'remote.execution.receipt');
  assert.deepEqual(entity.payload, input);

  const listed = await store.listForDelivery(input.delivery_id);
  assert.equal(listed.length, 1);
  assert.deepEqual(listed[0], input);
});

test('forbids final completion before Green and PRS', async () => {
  const store = createComputerUseReceiptPersistence({ persistence: persistenceHarness() });
  await assert.rejects(
    store.record({ receipt: receipt({ status: 'COMPLETED' }) }),
    /COMPUTER_USE_RECEIPT_PERSISTENCE_FINAL_COMPLETION_FORBIDDEN/,
  );
});

test('rejects receipts without computer-use execution evidence before persistence', async () => {
  const store = createComputerUseReceiptPersistence({ persistence: persistenceHarness() });
  await assert.rejects(
    store.record({ receipt: receipt({ execution: { action: 'powershell.repo.status' } }) }),
    /COMPUTER_USE_RECEIPT_PERSISTENCE_EXECUTION_EVIDENCE_REQUIRED/,
  );
});

test('listForDelivery filters canonical remote receipts that are not computer-use evidence', async () => {
  const persistence = persistenceHarness();
  const store = createComputerUseReceiptPersistence({ persistence });
  const input = receipt();
  await store.record({ receipt: input });
  await persistence.create('artifact', {
    id: 'remote-receipt:delivery-other',
    artifactType: 'remote.execution.receipt',
    payload: {
      delivery_id: input.delivery_id,
      request_id: 'request-other',
      host_id: 'host-other',
      status: 'AWAITING_GREEN',
      execution: { action: 'powershell.repo.status' },
    },
  });

  const listed = await store.listForDelivery(input.delivery_id);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].execution.action, 'computer.click');
});
