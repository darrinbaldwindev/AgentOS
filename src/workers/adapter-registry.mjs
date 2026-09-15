import { validateAdapter } from './adapter-contract.mjs';

export function createAdapterRegistry() {
  const adapters = new Map();

  return Object.freeze({
    register(workerId, adapter) {
      if (!workerId) throw new TypeError('workerId is required');
      validateAdapter(adapter);
      if (adapters.has(workerId)) throw new Error(`worker adapter already registered: ${workerId}`);
      adapters.set(workerId, adapter);
      return adapter;
    },
    get(workerId) {
      return adapters.get(workerId) ?? null;
    },
    has(workerId) {
      return adapters.has(workerId);
    },
    ids() {
      return [...adapters.keys()];
    },
  });
}
