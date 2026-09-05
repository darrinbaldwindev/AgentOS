const DEFAULT_WEIGHTS = {
  capability: 40,
  fit: 25,
  availability: 15,
  cost: 10,
  setup: 10,
};

/**
 * Commercial metadata is deliberately ignored by technical ranking.
 * This function only recommends an upgrade when the task declares a
 * meaningful capability gap and the candidate has a materially useful fit.
 */
export function recommendUpgrade({ task, candidates = [], currentWorkers = [], weights = DEFAULT_WEIGHTS }) {
  if (!task?.capabilityGap) return null;

  const currentCapabilities = new Set(currentWorkers.flatMap((worker) => worker.capabilities ?? []));
  const ranked = candidates
    .filter((candidate) => candidate.status !== 'disabled')
    .map((candidate) => {
      const capability = candidate.capabilities?.includes(task.capabilityGap) ? 100 : 0;
      const fit = candidate.taskTypes?.includes(task.type) ? 100 : 0;
      const availability = candidate.connectionModes?.length ? 100 : 0;
      const cost = candidate.costScore ?? 50;
      const setup = candidate.setupScore ?? 50;
      const score = (
        capability * weights.capability +
        fit * weights.fit +
        availability * weights.availability +
        cost * weights.cost +
        setup * weights.setup
      ) / 100;

      return {
        candidate,
        score,
        gapCovered: capability > 0,
        alreadyCovered: currentCapabilities.has(task.capabilityGap),
      };
    })
    .filter((entry) => entry.gapCovered && !entry.alreadyCovered)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best) return null;

  return {
    provider: best.candidate.id,
    score: best.score,
    reason: `Current workers do not cover ${task.capabilityGap}; ${best.candidate.id} is a strong capability fit.`,
    tryOneMonth: task.temporarySpike === true || task.durationDays <= 31,
    connectionModes: best.candidate.connectionModes ?? [],
    commercialDisclosureRequired: Boolean(best.candidate.affiliateStatus),
  };
}
