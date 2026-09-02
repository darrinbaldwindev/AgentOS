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

  let state;
  try {
    state = JSON.parse(await fs.readFile(target, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    state = emptyState();
    await persist();
  }

  if (state?.schemaVersion !== 1 || !state.records || !TYPES.every((type) => state.records[type])) {
    throw new Error('LOCAL_STATE_SCHEMA_INVALID');
  }

  async function persist() {
    const temp = `${target}.tmp-${process.pid}`;
    await fs.writeFile(temp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    try { await fs.chmod(temp, 0o600); } catch {}
    await fs.rename(temp, target);
  }

  async function get(type, id) {
    if (!TYPES.includes(type)) throw new TypeError(`Unsupported state type: ${type}`);
    return state.records[type][id] ? clone(state.records[type][id]) : null;
  }

  async function list(type) {
    if (!TYPES.includes(type)) throw new TypeError(`Unsupported state type: ${type}`);
    return Object.freeze(Object.values(state.records[type]).map(clone));
  }

  async function create(type, input = {}) {
    if (!TYPES.includes(type)) throw new TypeError(`Unsupported state type: ${type}`);
    const id = input.id ?? `${type}_${++state.sequence}`;
    if (state.records[type][id]) throw new Error(`Duplicate ${type} id: ${id}`);
    if (type === 'run' && !RUN_STATUSES.has(input.status)) throw new TypeError(`Invalid run status: ${input.status}`);
    const timestamp = input.createdAt ?? new Date().toISOString();
    const entity = { id, type, createdAt: timestamp, updatedAt: timestamp, ...clone(input) };
    state.records[type][id] = entity;
    await persist();
    return clone(entity);
  }

  async function update(type, id, patch = {}) {
    const existing = state.records[type]?.[id];
    if (!existing) throw new Error(`${type} not found: ${id}`);
    const next = { ...existing, ...clone(patch), id: existing.id, type: existing.type, updatedAt: new Date().toISOString() };
    if (type === 'run' && !RUN_STATUSES.has(next.status)) throw new TypeError(`Invalid run status: ${next.status}`);
    state.records[type][id] = next;
    await persist();
    return clone(next);
  }

  return Object.freeze({ get, list, create, update, filePath: target });
}
