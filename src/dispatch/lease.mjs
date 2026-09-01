export function acquireTaskLease(task, owner, now = Date.now(), ttlMs = 5 * 60 * 1000) {
  if (!task || task.status !== 'queued') return { acquired: false, reason: 'task_not_queued' };
  if (!owner) return { acquired: false, reason: 'missing_owner' };
  if (task.lease?.expires_at && Date.parse(task.lease.expires_at) > now) {
    return { acquired: false, reason: 'lease_active' };
  }
  return {
    acquired: true,
    task: {
      ...structuredClone(task),
      lease: { owner, acquired_at: new Date(now).toISOString(), expires_at: new Date(now + ttlMs).toISOString() }
    }
  };
}

export function renewTaskLease(task, owner, now = Date.now(), ttlMs = 5 * 60 * 1000) {
  if (!task?.lease || task.lease.owner !== owner) return { renewed: false, reason: 'not_lease_owner' };
  if (Date.parse(task.lease.expires_at) <= now) return { renewed: false, reason: 'lease_expired' };
  return { renewed: true, task: { ...structuredClone(task), lease: { ...task.lease, expires_at: new Date(now + ttlMs).toISOString() } } };
}

export function releaseTaskLease(task, owner) {
  if (!task?.lease || task.lease.owner !== owner) return { released: false, reason: 'not_lease_owner' };
  const next = structuredClone(task);
  delete next.lease;
  return { released: true, task: next };
}
