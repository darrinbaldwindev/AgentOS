// LOCAL-RUNTIME-003: dependency-free JSON persistence for the installed AgentOS runtime.
// Uses atomic replacement and preserves the canonical persistence vocabulary.

import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';

const TYPES = Object.freeze(['project', 'workspace', 'agent', 'run', 'event', 'artifact']);
const RUN_STATUSES = new Set(['queued', 'running', 'paused', 'failed', 'completed', 'cancelled']);

function emptyState() {
  return { schemaVersion: 1, sequence: 0, records: Object.fromEntries(TYPES.map((type) => [type, {}])) };
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }

export async function createLocalPersistence({ filePath }) {
  if (!filePath) throw new TypeError('filePath is required');
  const target = resolve(filePath);
  await fs.mkdir(dirname(target), { recursive: true });

  // Serialize mutations of this existing store, across processes. A crashed
  // writer leaves a lock requiring owner reconciliation; age never steals it.
  const lock = `${target}.lock`;
  async function readState() {
    const state = JSON.parse(await fs.readFile(target, 'utf8'));
    if (state?.schemaVersion !== 1 || !state.records || !TYPES.every((t) => state.records[t])) {
      throw new Error('LOCAL_STATE_SCHEMA_INVALID');
    }
    return state;
  }
  async function mutate(fn) {
    let acquired = false;
    for (let attempt = 0; attempt < 200; attempt++) {
      try { await fs.mkdir(lock); acquired = true; break; }
      catch (e) {
        if (e.code !== 'EEXIST') throw e;
        await new Promise((done) => setTimeout(done, 5));
      }
    }
    if (!acquired) throw new Error('LOCAL_STATE_LOCK_RECOVERY_REQUIRED');
    const temp = `${target}.tmp-${process.pid}`;
    try {
      let state;
      try { state = await readState(); }
      catch (e) { if (e.code !== 'ENOENT') throw e; state = emptyState(); }
      const result = fn(state);
      const handle = await fs.open(temp, 'w', 0o600);
      try { await handle.writeFile(`${JSON.stringify(state, null, 2)}\n`); await handle.sync(); }
      finally { await handle.close(); }
      await fs.rename(temp, target);
      return result;
    } finally {
      await fs.rm(temp, { force: true });
      await fs.rmdir(lock);
    }
  }
  try { await readState(); }
  catch (e) { if (e.code !== 'ENOENT') throw e; await mutate(() => null); }

  async function get(type, id) {
    if (!TYPES.includes(type)) throw new TypeError(`Unsupported state type: ${type}`);
    const state = await readState();
    return state.records[type][id] ? clone(state.records[type][id]) : null;
  }

  async function list(type) {
    if (!TYPES.includes(type)) throw new TypeError(`Unsupported state type: ${type}`);
    const state = await readState();
    return Object.freeze(Object.values(state.records[type]).map(clone));
  }

  function insert(state, type, input = {}) {
    if (!TYPES.includes(type)) throw new TypeError(`Unsupported state type: ${type}`);
    const id = input.id ?? `${type}_${++state.sequence}`;
    if (state.records[type][id]) throw new Error(`Duplicate ${type} id: ${id}`);
    if (type === 'run' && !RUN_STATUSES.has(input.status)) throw new TypeError(`Invalid run status: ${input.status}`);
    const timestamp = input.createdAt ?? new Date().toISOString();
    const entity = { ...clone(input), id, type, createdAt: timestamp, updatedAt: timestamp, revision: ++state.sequence };
    state.records[type][id] = entity;
    return clone(entity);
  }
  async function create(type, input = {}) {
    return mutate((state) => insert(state, type, input));
  }
  // One atomic replacement for inseparable result and receipt publication.
  async function createMany(entries) {
    return mutate((state) => entries.map(({ type, input }) => insert(state, type, input)));
  }
  async function update(type, id, patch = {}, expectedRevision = null) {
    return mutate((state) => {
      const existing = state.records[type]?.[id];
      if (!existing) throw new Error(`${type} not found: ${id}`);
      if (expectedRevision !== null && (existing.revision ?? existing.updatedAt) !== expectedRevision) {
        throw new Error('LOCAL_STATE_VERSION_CONFLICT');
      }
      const next = { ...existing, ...clone(patch), id: existing.id, type: existing.type,
        updatedAt: new Date().toISOString(), revision: ++state.sequence };
      if (type === 'run' && !RUN_STATUSES.has(next.status)) throw new TypeError(`Invalid run status: ${next.status}`);
      state.records[type][id] = next;
      return clone(next);
    });
  }
  return Object.freeze({ get, list, create, createMany, update, filePath: target });
}
