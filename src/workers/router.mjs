import { listWorkers, isWorkerEligible } from './registry.mjs';

function scoreWorker(worker, task = {}) {
  const requested = new Set(task.capabilities ?? []);
  const matched = (worker.capabilities ?? []).filter((capability) => requested.has(capability)).length;
  const preferred = task.preferredWorkers?.includes(worker.id) ? 100 : 0;
  const classMatch = task.preferredSubscriptionClass && worker.subscriptionClass === task.preferredSubscriptionClass ? 25 : 0;
  const kindMatch = task.preferredKind && worker.kind === task.preferredKind ? 10 : 0;
  return preferred + classMatch + kindMatch + matched * 10;
}

/**
 * Resolve the best currently eligible worker for a capability-driven task.
 * Selection is deliberately provider-neutral and does not inspect commercial
 * attribution, affiliate status, or partner revenue.
 */
export function selectWorker(task, { registryData, requireActive = true } = {}) {
  if (!task?.capabilities?.length) throw new Error('task.capabilities is required');

  const candidates = listWorkers({ registryData, activeOnly: false })
    .filter((worker) => isWorkerEligible(worker, { requireActive }))
    .filter((worker) => task.capabilities.some((capability) => worker.capabilities?.includes(capability)));

  if (!candidates.length) return null;

  return [...candidates]
    .sort((left, right) => scoreWorker(right, task) - scoreWorker(left, task))
    .at(0);
}

export function rankWorkers(task, { registryData, requireActive = true } = {}) {
  if (!task?.capabilities?.length) throw new Error('task.capabilities is required');
  return listWorkers({ registryData, activeOnly: false })
    .filter((worker) => isWorkerEligible(worker, { requireActive }))
    .filter((worker) => task.capabilities.some((capability) => worker.capabilities?.includes(capability)))
    .map((worker) => ({ worker, score: scoreWorker(worker, task) }))
    .sort((left, right) => right.score - left.score);
}
