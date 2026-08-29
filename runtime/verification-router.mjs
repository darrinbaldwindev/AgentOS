export function createVerificationRouter({ router } = {}) {
  if (!router?.select) throw new TypeError('router.select is required');
  return Object.freeze({
    async selectVerifier({ task = {}, result = {} } = {}) {
      const verificationTask = {
        capabilities: [...new Set([...(task.capabilities ?? []), 'verification'])],
        quality: { required: task.quality?.required ?? 0.9 },
        preference: task.preference ?? 'balanced',
        risk: task.risk ?? 'normal',
        excludeWorkerIds: [result.workerId].filter(Boolean),
      };
      const workers = (result.availableWorkers ?? []).filter(worker => !verificationTask.excludeWorkerIds.includes(worker.id));
      return router.select({ task: verificationTask, workers });
    },
  });
}
