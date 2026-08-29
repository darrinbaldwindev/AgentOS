export function createWorkerRegistry() {
  const workers = new Map();

  function register(worker) {
    if (!worker?.id || !worker?.name || !worker?.capabilities?.length) {
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

  return { register, get, list, findByCapability };
}
