// CORE-001 reference durable adapter using a JSON file.
// Intended for local development and lightweight hosts; larger deployments can
// replace it with SQLite/IndexedDB without changing the persistence contract.

import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const TYPES = ['workspace', 'agent', 'run', 'event', 'artifact'];

export function createFilePersistence({ filePath }) {
  if (!filePath) throw new TypeError('filePath is required');
  let state = null;
  let queue = Promise.resolve();

  async function load() {
    if (state) return state;
    try { state = JSON.parse(await fs.readFile(filePath, 'utf8')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      state = Object.fromEntries(TYPES.map((type) => [type, []]));
    }
    return state;
  }

  async function flush() {
    await fs.mkdir(dirname(filePath), { recursive: true });
    const temp = `${filePath}.tmp`;
    await fs.writeFile(temp, JSON.stringify(state, null, 2), 'utf8');
    await fs.rename(temp, filePath);
  }

  async function mutate(fn) {
    queue = queue.then(async () => { await load(); const result = await fn(state); await flush(); return result; });
    return queue;
  }

  function collection(type) {
    if (!TYPES.includes(type)) throw new Error(`unsupported entity type: ${type}`);
    return state[type];
  }

  return Object.freeze({
    async get(type, id) { await load(); return collection(type).find((item) => item.id === id) ?? null; },
    async list(type) { await load(); return [...collection(type)]; },
    create(type, value) { return mutate(async () => { const item = { id: value.id ?? randomUUID(), ...value }; collection(type).push(item); return item; }); },
    update(type, id, patch) { return mutate(async () => { const items = collection(type); const index = items.findIndex((item) => item.id === id); if (index < 0) throw new Error(`entity not found: ${type}/${id}`); items[index] = { ...items[index], ...patch }; return items[index]; }); },
  });
}
