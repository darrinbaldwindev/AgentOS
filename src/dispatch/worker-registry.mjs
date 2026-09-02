import { executeWorker } from '../workers/worker-contract.mjs';

export function createWorkerRegistry() {
  const workers = new Map();

  function register(worker) {
    if (!worker?.id || !worker?.name || !Array.isArray(worker.capabilities) || !worker.capabilities.length) {
      throw new Error('worker requires id, name and capabilities');
    }
    if (typeof worker.execute !== 'function') {
      throw new Error('worker requires execute(task)');
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
    const selected = candidates.find(worker =>
      typeof worker.execute === 'function' &&
      required.every(capability => worker.capabilities.includes(capability)),
    );
    if (!selected) return null;

    // Return the registry record with the canonical worker-contract execution
    // wrapper. This keeps registered workers provider-neutral and preserves the
    // structured success/error/latency/workerId result at the execution boundary.
    return Object.freeze({
      ...selected,
      execute: (input) => executeWorker(selected, input),
    });
  }

  return { register, get, list, findByCapability, findMatching };
}
