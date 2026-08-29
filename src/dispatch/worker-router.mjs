export function chooseWorker({ workers, task, governor = null } = {}) {
  if (!workers?.length) return { worker: null, reason: 'no_capable_worker' };
  const required = new Set(task?.capabilities ?? []);
  const candidates = workers.filter(worker => worker.enabled !== false && [...required].every(capability => worker.capabilities.includes(capability)));
  if (!candidates.length) return { worker: null, reason: 'no_capable_worker' };

  const ranked = [...candidates].sort((a, b) => {
    const cost = (a.estimated_cost ?? 0) - (b.estimated_cost ?? 0);
    const latency = (a.estimated_latency_ms ?? Infinity) - (b.estimated_latency_ms ?? Infinity);
    if (task.priority === 'cost') return cost || latency;
    if (task.priority === 'speed') return latency || cost;
    return (a.rank ?? 0) - (b.rank ?? 0) || cost;
  });

  for (const worker of ranked) {
    const estimate = governor?.estimate ? governor.estimate({ cost: worker.estimated_cost ?? 0, calls: 1, tokens: worker.estimated_tokens ?? 0 }) : null;
    if (!estimate || governor.canSpend(estimate)) return { worker, reason: 'selected', estimate };
  }
  return { worker: null, reason: 'budget_exhausted' };
}
