import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRemoteDeliveryClaimStore } from '../runtime/remote-delivery-claim-store.mjs';

async function withStore(fn) {
  const root = await mkdtemp(join(tmpdir(), 'agentos-remote-claim-'));
  try {
    const store = await createRemoteDeliveryClaimStore({
      root,
      now: () => new Date('2026-09-09T09:45:00.000Z'),
    });
    await fn(store);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('a reused delivery with different request or host cannot borrow the original claim', async () => {
  await withStore(async (store) => {
    const won = await store.claim({ deliveryId: 'd', requestId: 'r', hostId: 'h' });
    for (const attempt of [{ requestId: 'other', hostId: 'h' }, { requestId: 'r', hostId: 'other' }]) {
      const result = await store.claim({ deliveryId: 'd', ...attempt });
      assert.equal(result.claimed, false);
      assert.equal(result.disposition, 'CLAIM_CORRELATION_MISMATCH');
    }
    assert.deepEqual(await store.get('d'), won.record);
  });
});

test('partial or malformed claim blocks replay and is never silently reclaimed', async () => {
  await withStore(async (store) => {
    const won = await store.claim({ deliveryId: 'd', requestId: 'r', hostId: 'h' });
    for (const corrupted of ['', '{}', JSON.stringify({ ...won.record, delivery_id: 'other' })]) {
      await writeFile(won.path, corrupted);
      await assert.rejects(() => store.claim({ deliveryId: 'd', requestId: 'r', hostId: 'h' }));
      assert.equal(await readFile(won.path, 'utf8'), corrupted);
    }
  });
});

test('first claim persists exact delivery correlation', async () => {
  await withStore(async (store) => {
    const result = await store.claim({ deliveryId: 'delivery-001', requestId: 'request-001', hostId: 'host-win-001' });
    assert.equal(result.claimed, true);
    assert.equal(result.disposition, 'CLAIMED');
    assert.equal(result.record.delivery_id, 'delivery-001');
    assert.equal(result.record.request_id, 'request-001');
    assert.equal(result.record.host_id, 'host-win-001');
    assert.equal(result.record.claimed_at, '2026-09-09T09:45:00.000Z');
    assert.deepEqual(await store.get('delivery-001'), result.record);
  });
});

test('concurrent claim attempts produce exactly one winner', async () => {
  await withStore(async (store) => {
    const attempts = await Promise.all(Array.from({ length: 12 }, () => store.claim({
      deliveryId: 'delivery-race', requestId: 'request-race', hostId: 'host-win-001',
    })));
    assert.equal(attempts.filter((item) => item.claimed).length, 1);
    assert.equal(attempts.filter((item) => item.disposition === 'DUPLICATE_DELIVERY').length, 11);
  });
});

test('second process-shaped store sees the durable duplicate claim', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-remote-claim-cross-'));
  try {
    const first = await createRemoteDeliveryClaimStore({ root });
    const second = await createRemoteDeliveryClaimStore({ root });
    const won = await first.claim({ deliveryId: 'delivery-cross', requestId: 'request-cross', hostId: 'host-win-001' });
    const duplicate = await second.claim({ deliveryId: 'delivery-cross', requestId: 'request-cross', hostId: 'host-win-001' });
    assert.equal(won.claimed, true);
    assert.equal(duplicate.claimed, false);
    assert.equal(duplicate.record.delivery_id, 'delivery-cross');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('claim identity fields are mandatory', async () => {
  await withStore(async (store) => {
    await assert.rejects(() => store.claim({ deliveryId: '', requestId: 'r', hostId: 'h' }), /deliveryId is required/);
    await assert.rejects(() => store.claim({ deliveryId: 'd', requestId: '', hostId: 'h' }), /requestId is required/);
    await assert.rejects(() => store.claim({ deliveryId: 'd', requestId: 'r', hostId: '' }), /hostId is required/);
  });
});
