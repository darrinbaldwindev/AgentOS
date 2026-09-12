export const PROVIDER_ADAPTER_CONTRACT_VERSION = 1;

const REQUIRED_METHODS = ['discover', 'healthCheck', 'capabilities', 'execute'];

export function validateAdapter(adapter) {
  if (!adapter || typeof adapter !== 'object') throw new TypeError('adapter is required');
  for (const method of REQUIRED_METHODS) {
    if (typeof adapter[method] !== 'function') {
      throw new TypeError(`provider adapter must implement ${method}()`);
    }
  }
  return true;
}

export function createAdapterContext({ workerId, signal = null, logger = null } = {}) {
  if (!workerId) throw new TypeError('workerId is required');
  return Object.freeze({
    workerId,
    signal,
    logger,
    contractVersion: PROVIDER_ADAPTER_CONTRACT_VERSION,
  });
}

export async function inspectAdapter(adapter, context) {
  validateAdapter(adapter);
  const discovered = await adapter.discover(context);
  const health = await adapter.healthCheck(context);
  const capabilities = await adapter.capabilities(context);
  return Object.freeze({ discovered, health, capabilities });
}

export async function executeAdapter(adapter, task, context) {
  validateAdapter(adapter);
  if (!task || typeof task !== 'object') throw new TypeError('task is required');
  return adapter.execute(task, context);
}

export { REQUIRED_METHODS };
