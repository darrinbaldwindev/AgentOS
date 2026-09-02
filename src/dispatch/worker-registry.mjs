export function createWorkerRegistry() {
  const workers = new Map();

  function register(worker) {
    if (!worker?.id || !worker?.name || !Array.isArray(worker.capabilities) || !worker.capabilities.length) {
      throw new Error('worker requires id, name and capabilities');
    }
    const record = {
      ...worker,
      type: worker.type ?? 'model',
      enabled: worker.enabled !== false,
    };
    workers.set(record.id, record);
    return record;
  }

  function get(id) { return workers.get(id) ?? null; }
  function list({ enabledOnly = true } = {}) {
    return [...workers.values()].filter(worker => !enabledOnly || worker.enabled);
  }
  function findByCapability(capability) {
    return list().filter(worker => worker.capabilities.includes(capability));
  }

  // Strict assignment boundary: every requested capability must match, the worker
  // must be enabled, and execution must be available. No partial matches.
  function findMatching({ requiredCapabilities = [], workerId } = {}) {
    const required = Array.isArray(requiredCapabilities) ? requiredCapabilities : [];
    const candidates = list().filter(worker => !workerId || worker.id === workerId);
    return candidates.find(worker =>
      typeof worker.execute === 'function' &&
      required.every(capability => worker.capabilities.includes(capability)),
    ) ?? null;
  }

  return { register, get, list, findByCapability, findMatching };
}
