export class LeaseStore {
  #leases = new Map();

  acquire(taskId, owner, now = Date.now(), ttlMs = 5 * 60 * 1000) {
    if (!taskId || !owner) return { acquired: false, reason: 'invalid_lease_request' };
    const current = this.#leases.get(taskId);
    if (current && current.expires_at > now) return { acquired: false, reason: 'lease_active', lease: { ...current } };
    const lease = { task_id: taskId, owner, acquired_at: now, expires_at: now + ttlMs };
    this.#leases.set(taskId, lease);
    return { acquired: true, lease: { ...lease } };
  }

  renew(taskId, owner, now = Date.now(), ttlMs = 5 * 60 * 1000) {
    const current = this.#leases.get(taskId);
    if (!current || current.owner !== owner || current.expires_at <= now) return { renewed: false, reason: 'lease_not_owned' };
    const lease = { ...current, expires_at: now + ttlMs };
    this.#leases.set(taskId, lease);
    return { renewed: true, lease: { ...lease } };
  }

  release(taskId, owner) {
    const current = this.#leases.get(taskId);
    if (!current || current.owner !== owner) return { released: false, reason: 'lease_not_owned' };
    this.#leases.delete(taskId);
    return { released: true };
  }

  get(taskId) {
    const lease = this.#leases.get(taskId);
    return lease ? { ...lease } : null;
  }
}
