export function atomicClaim(task, receiver, { now = Date.now(), claimId } = {}) {
  if (!task || task.status !== 'queued') return { claimed: false, task };
  if (task.target !== receiver) return { claimed: false, task };
  if (!claimId) throw new Error('claimId is required');

  const timestamp = new Date(now).toISOString();
  return {
    claimed: true,
    task: {
      ...task,
      status: 'claimed',
      claim: { id: claimId, receiver, claimed_at: timestamp },
      updated_at: timestamp,
    },
  };
}

export function releaseClaim(task, reason, now = Date.now()) {
  if (task.status !== 'claimed') throw new Error('only claimed tasks can be released');
  const timestamp = new Date(now).toISOString();
  return {
    ...task,
    status: 'queued',
    claim: null,
    recovery: { reason, released_at: timestamp },
    updated_at: timestamp,
  };
}
