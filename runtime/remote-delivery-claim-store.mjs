// Durable single-host remote delivery claim store.
// Uses exclusive file creation so concurrent scheduler processes cannot claim the
// same delivery twice. This is intentionally local-host only; it does not grant
// authority or execute work.

import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function deliveryKey(deliveryId) {
  return createHash('sha256').update(deliveryId).digest('hex');
}

export async function createRemoteDeliveryClaimStore({ root, now = () => new Date() } = {}) {
  const storeRoot = resolve(requiredString(root, 'root'));
  await fs.mkdir(storeRoot, { recursive: true });

  async function claim({ deliveryId, requestId, hostId } = {}) {
    const normalizedDeliveryId = requiredString(deliveryId, 'deliveryId');
    const record = Object.freeze({
      schema_version: 1,
      delivery_id: normalizedDeliveryId,
      request_id: requiredString(requestId, 'requestId'),
      host_id: requiredString(hostId, 'hostId'),
      claimed_at: now().toISOString(),
      state: 'CLAIMED',
    });
    const path = join(storeRoot, `${deliveryKey(normalizedDeliveryId)}.json`);
    let handle;
    try {
      handle = await fs.open(path, 'wx', 0o600);
      await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8');
      return Object.freeze({ claimed: true, disposition: 'CLAIMED', record, path });
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      const existing = JSON.parse(await fs.readFile(path, 'utf8'));
      return Object.freeze({ claimed: false, disposition: 'DUPLICATE_DELIVERY', record: existing, path });
    } finally {
      await handle?.close();
    }
  }

  async function get(deliveryId) {
    const normalizedDeliveryId = requiredString(deliveryId, 'deliveryId');
    const path = join(storeRoot, `${deliveryKey(normalizedDeliveryId)}.json`);
    try {
      return JSON.parse(await fs.readFile(path, 'utf8'));
    } catch (error) {
      if (error?.code === 'ENOENT') return null;
      throw error;
    }
  }

  return Object.freeze({ claim, get, root: storeRoot });
}
