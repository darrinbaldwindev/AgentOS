// CORE-002: compatibility bridge for legacy runtime stores.
// Keeps one canonical persistence vocabulary while older adapters migrate.

const REQUIRED = ['get', 'list', 'create', 'update'];

export function createPersistenceBridge(store) {
  if (!store) throw new TypeError('store is required');
  for (const method of REQUIRED) {
    if (typeof store[method] !== 'function') throw new TypeError(`persistence.${method} is required`);
  }

  return Object.freeze({
    get: (...args) => store.get(...args),
    list: (...args) => store.list(...args),
    create: (...args) => store.create(...args),
    update: (...args) => store.update(...args),
  });
}

export const PERSISTENCE_INTERFACE = Object.freeze(REQUIRED);
