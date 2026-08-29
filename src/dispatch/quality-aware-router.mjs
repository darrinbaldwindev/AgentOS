export function chooseQualityAwareWorker({ workers = [], task = {}, governor = null } = {}) {
  const requiredQuality = task.quality?.required ?? 0;
  const candidates = workers.filter(worker => {
    if (worker.enabled === false) return false;
    if (!(worker.capabilities ?? []).every(capability => (task.capabilities ?? []).includes(capability))) return false;
    return (worker.quality?.floor ?? 0) >= requiredQuality;
  });

  if (!candidates.length) return { worker: null, reason: 'quality_or_capability_unavailable' };

  const ranked = [...candidates].sort((a, b) => {
    const latency = (a.estimated_latency_ms ?? Infinity) - (b.estimated_latency_ms ?? Infinity);
    const cost = (a.estimated_cost ?? 0) - (b.estimated_cost ?? 0);
    if (task.preference === 'speed') return latency || cost;
    if (task.preference === 'cost') return cost || latency;
    return Math.abs((a.quality?.floor ?? 0) - requiredQuality) - Math.abs((b.quality?.floor ?? 0) - requiredQuality) || cost;
  });

  for (const worker of ranked) {
    const estimate = governor?.estimate?.({ cost: worker.estimated_cost ?? 0, calls: 1, tokens: worker.estimated_tokens ?? 0 });
    if (!estimate || governor.canSpend(estimate)) return { worker, estimate, reason: 'selected_after_quality_gate' };
  }
  return { worker: null, reason: 'budget_exhausted_after_quality_gate' };
}
