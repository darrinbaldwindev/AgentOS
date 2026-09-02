import { LeaseStore } from './lease-store.mjs';
import { IdempotencyStore } from './idempotency.mjs';

/**
 * Reference persistence adapter that composes the existing deterministic stores.
 *
 * This is intentionally a test/in-process adapter. It satisfies the production
 * persistence interface shape but does NOT provide distributed atomicity across
 * processes or GitHub-hosted runners. A real deployment must replace this with
 * a shared conditional/atomic backing store.
 */
export class SharedReferencePersistence {
  constructor({ leaseStore = new LeaseStore(), idempotencyStore = new IdempotencyStore() } = {}) {
    this.leaseStore = leaseStore;
    this.idempotencyStore = idempotencyStore;
  }

  async acquireLease(key, owner, ttlMs, now = Date.now()) {
    return this.leaseStore.acquire(key, owner, ttlMs, now);
  }

  async renewLease(key, owner, ttlMs, now = Date.now()) {
    return this.leaseStore.renew(key, owner, ttlMs, now);
  }

  async releaseLease(key, owner) {
    return this.leaseStore.release(key, owner);
  }

  async getCompletion(key) {
    return this.idempotencyStore.get(key);
  }

  async putCompletion(key, value) {
    return this.idempotencyStore.complete(key, value);
  }
}
