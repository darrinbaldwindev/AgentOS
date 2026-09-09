// Persistent local host identity for governed remote-local bridge execution.
// Creates exactly one opaque host identifier per AgentOS state root and reuses it
// across scheduler/process restarts. It does not authenticate a remote caller and
// does not grant execution authority.

import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function validateIdentity(record) {
  if (!record || record.schema_version !== 1) throw new Error('REMOTE_HOST_IDENTITY_SCHEMA_INVALID');
  requiredString(record.host_id, 'host_id');
  requiredString(record.created_at, 'created_at');
  if (!Number.isFinite(Date.parse(record.created_at))) throw new Error('REMOTE_HOST_IDENTITY_CREATED_AT_INVALID');
  return Object.freeze({ ...record });
}

export async function loadOrCreateRemoteHostIdentity({ filePath, now = () => new Date(), randomId = () => randomUUID() } = {}) {
  const target = resolve(requiredString(filePath, 'filePath'));
  await fs.mkdir(dirname(target), { recursive: true });

  try {
    return validateIdentity(JSON.parse(await fs.readFile(target, 'utf8')));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const record = Object.freeze({
    schema_version: 1,
    host_id: `host-${requiredString(randomId(), 'randomId')}`,
    created_at: now().toISOString(),
  });

  const temporary = `${target}.${randomUUID()}.tmp`;
  let handle;
  try {
    // Exclusive create prevents two simultaneous first-start processes from
    // assigning different identities to the same AgentOS state root.
    handle = await fs.open(temporary, 'wx', 0o600);
    await handle.writeFile(`${JSON.stringify(record, null, 2)}\n`, 'utf8');
    await handle.sync();
    await handle.close();
    handle = null;
    await fs.link(temporary, target);
    return record;
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    return validateIdentity(JSON.parse(await fs.readFile(target, 'utf8')));
  } finally {
    await handle?.close();
    await fs.rm(temporary, { force: true });
  }
}
