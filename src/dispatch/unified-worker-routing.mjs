// CORE-005: capability-first routing surface shared by models and specialist workers.
// Selection never uses provider/referral identity as a substitute for capability fit.
export function rankEligibleWorkers({ workers = [], requiredCapabilities = [], eligible = () => true } = {}) {
  return workers
    .filter(worker => requiredCapabilities.every(capability => worker.capabilities?.includes(capability)))
    .filter(eligible)
    .map((worker, index) => ({ worker, score: Number.isFinite(worker.score) ? worker.score : 0, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ worker }) => worker);
}

export function selectEligibleWorker(options = {}) {
  const ranked = rankEligibleWorkers(options);
  if (!ranked.length) throw new Error('NO_ELIGIBLE_WORKER');
  return ranked[0];
}
