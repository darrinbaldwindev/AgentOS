// AgentOS CORE-001: dependency-free durable state primitives.
// This is intentionally storage-agnostic: callers can persist snapshots in a
// database, local file store, or another adapter without changing the domain model.

const TYPES = Object.freeze(['project', 'workspace', 'agent', 'run', 'event', 'artifact']);
const RUN_STATUSES = Object.freeze(['queued', 'running', 'paused', 'failed', 'completed', 'cancelled']);

function id(prefix, counter) {
  return `${prefix}_${counter}`;
}

export function createStateStore() {
  const records = new Map(TYPES.map((type) => [type, new Map()]));
  let sequence = 0;

  function create(type, input = {}) {
    if (!records.has(type)) throw new TypeError(`Unsupported state type: ${type}`);
    const entity = {
      id: input.id ?? id(type, ++sequence),
      type,
      createdAt: input.createdAt ?? new Date(0).toISOString(),
      updatedAt: input.updatedAt ?? new Date(0).toISOString(),
      ...input,
    };
    if (type === 'run' && !RUN_STATUSES.includes(entity.status)) {
      throw new TypeError(`Invalid run status: ${entity.status}`);
    }
    if (records.get(type).has(entity.id)) throw new Error(`Duplicate ${type} id: ${entity.id}`);
    records.get(type).set(entity.id, Object.freeze({ ...entity }));
    return records.get(type).get(entity.id);
  }

  function get(type, entityId) {
    return records.get(type)?.get(entityId) ?? null;
  }

  function list(type) {
    const bucket = records.get(type);
    if (!bucket) throw new TypeError(`Unsupported state type: ${type}`);
    return Object.freeze([...bucket.values()]);
  }

  function update(type, entityId, patch) {
    const existing = get(type, entityId);
    if (!existing) throw new Error(`${type} not found: ${entityId}`);
    const next = { ...existing, ...patch, id: existing.id, type: existing.type, updatedAt: new Date(0).toISOString() };
    if (type === 'run' && !RUN_STATUSES.includes(next.status)) throw new TypeError(`Invalid run status: ${next.status}`);
    const frozen = Object.freeze(next);
    records.get(type).set(entityId, frozen);
    return frozen;
  }

  function snapshot() {
    return Object.freeze(Object.fromEntries(TYPES.map((type) => [type, list(type)])));
  }

  return Object.freeze({ create, get, list, update, snapshot });
}

export { TYPES, RUN_STATUSES };
