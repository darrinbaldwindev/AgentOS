import registry from '../../config/workers/registry.json' with { type: 'json' };

const ACTIVE_STATUSES = new Set(['active', 'available']);

export function listWorkers({ registryData = registry, capability = null, activeOnly = false } = {}) {
  const workers = registryData?.workers ?? [];
  return workers.filter((worker) => {
    if (activeOnly && !ACTIVE_STATUSES.has(worker.status)) return false;
    if (capability && !worker.capabilities?.includes(capability)) return false;
    return true;
  });
}

export function getWorker(workerId, registryData = registry) {
  return (registryData?.workers ?? []).find((worker) => worker.id === workerId) ?? null;
}

export function isWorkerEligible(worker, { requireActive = true } = {}) {
  if (!worker) return false;
  return !requireActive || ACTIVE_STATUSES.has(worker.status);
}

export function activateWorker(registryData, workerId, { status = 'active' } = {}) {
  const worker = getWorker(workerId, registryData);
  if (!worker) throw new Error(`unknown worker: ${workerId}`);
  if (!['active', 'available', 'inactive-until-connected', 'disabled'].includes(status)) {
    throw new Error(`invalid worker status: ${status}`);
  }
  return {
    ...registryData,
    workers: registryData.workers.map((candidate) =>
      candidate.id === workerId ? { ...candidate, status } : candidate,
    ),
  };
}

export { registry };
