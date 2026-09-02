import { LeaseStore } from './lease-store.mjs';
import { IdempotencyStore } from './idempotency.mjs';
import { assertPersistenceAdapter, completionKey } from './persistence.mjs';

/**
 * Reference adapter for deterministic/in-process testing.
 * It deliberately does not claim distributed atomicity across processes or
 * GitHub-hosted runners. Production must supply a shared conditional store.
 */
export class SharedReferencePersistence {
  constructor({ leaseStore = new LeaseStore(), idempotencyStore = new IdempotencyStore() } = {}) {
    this.leaseStore = leaseStore;
    this.idempotencyStore = idempotencyStore;
    assertPersistenceAdapter(this);
  }

  async acquireLease(key, owner, ttlMs, now = Date.now()) {
    return this.leaseStore.acquire(key, owner, now, ttlMs);
  }

  async renewLease(key, owner, ttlMs, now = Date.now()) {
    return this.leaseStore.renew(key, owner, now, ttlMs);
  }

  async releaseLease(key, owner) {
    return this.leaseStore.release(key, owner);
  }

  async getCompletion(taskId) {
    return this.idempotencyStore.get(completionKey(taskId));
  }

  async putCompletion(taskId, value) {
    return this.idempotencyStore.complete(completionKey(taskId), value);
  }
}
