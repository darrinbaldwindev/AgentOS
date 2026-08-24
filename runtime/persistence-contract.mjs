// CORE-001 durable persistence contract. Adapters may use SQLite, IndexedDB,
// filesystem JSON, or another durable store without changing the domain layer.

export const ENTITY_TYPES = Object.freeze(['workspace', 'agent', 'run', 'event', 'artifact']);

export function createPersistenceContract({ adapter }) {
  const required = ['get', 'list', 'create', 'update'];
  if (!adapter || required.some((method) => typeof adapter[method] !== 'function')) {
    throw new TypeError(`persistence adapter must implement: ${required.join(', ')}`);
  }

  function validateType(type) {
    if (!ENTITY_TYPES.includes(type)) throw new Error(`unsupported entity type: ${type}`);
  }

  return Object.freeze({
    get: (type, id) => { validateType(type); return adapter.get(type, id); },
    list: (type) => { validateType(type); return adapter.list(type); },
    create: (type, value) => { validateType(type); return adapter.create(type, value); },
    update: (type, id, patch) => { validateType(type); return adapter.update(type, id, patch); },
  });
}
