// Durable single-host remote delivery claim store.
// Uses exclusive file creation so concurrent scheduler processes cannot claim the
// same delivery twice. This is intentionally local-host only; it does not grant
// authority or execute work.

import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

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
    const temporary = `${path}.${randomUUID()}.tmp`;
    let handle;
    try {
      // Publish only a complete, flushed record. A duplicate reader must never
      // observe the empty file between exclusive creation and the first write.
      handle = await fs.open(temporary, 'wx', 0o600);
      await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8');
      await handle.sync();
      await handle.close();
      handle = null;
      await fs.link(temporary, path);
      return Object.freeze({ claimed: true, disposition: 'CLAIMED', record, path });
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      const existing = JSON.parse(await fs.readFile(path, 'utf8'));
      if (existing?.schema_version !== 1 || existing.state !== 'CLAIMED' ||
          existing.delivery_id !== normalizedDeliveryId || !Number.isFinite(Date.parse(existing.claimed_at))) {
        throw new Error('REMOTE_CLAIM_INVALID_REQUIRES_RECOVERY');
      }
      if (existing.request_id !== record.request_id || existing.host_id !== record.host_id) {
        return Object.freeze({ claimed: false, disposition: 'CLAIM_CORRELATION_MISMATCH', record: existing, path });
      }
      return Object.freeze({ claimed: false, disposition: 'DUPLICATE_DELIVERY', record: existing, path });
    } finally {
      await handle?.close();
      await fs.unlink(temporary).catch((error) => { if (error.code !== 'ENOENT') throw error; });
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
