import { assertPersistenceAdapter, completionKey } from './persistence.mjs';

/**
 * Shared GitHub Contents API persistence adapter.
 *
 * GitHub serializes conflicting ref updates: create/update/delete operations
 * that race on the same path fail with a conflict instead of silently
 * overwriting the winner. The adapter uses that conditional write behavior
 * as its compare-and-swap boundary for leases and completions.
 */
export function createGitHubContentsPersistence({ owner, repo, token, root = '.agentos/persistence', apiBase = 'https://api.github.com', fetchImpl = fetch }) {
  if (!owner || !repo || !token) throw new Error('owner, repo and token are required');

  const base = `${apiBase.replace(/\\/$/, '')}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`;
  const pathFor = (key) => `${root.replace(/^\\/+|\\/+$/g, '')}/${encodeURIComponent(key)}.json`;

  async function request(path, options = {}) {
    const response = await fetchImpl(`${base}/${path}`, {
      ...options,
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'x-github-api-version': '2022-11-28',
        ...(options.headers ?? {})
      }
    });
    const text = await response.text();
    let body = null;
    if (text) {
      try { body = JSON.parse(text); } catch { body = null; }
    }
    return { response, body };
  }

  async function read(key) {
    const { response, body } = await request(pathFor(key));
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub persistence read failed: ${response.status}`);
    if (!body?.content || !body?.sha) throw new Error('GitHub persistence record is malformed');
    const decoded = Buffer.from(body.content.replace(/\\s/g, ''), 'base64').toString('utf8');
    return { value: JSON.parse(decoded), sha: body.sha };
  }

  async function conditionalWrite(key, value, sha = null) {
    const encoded = Buffer.from(JSON.stringify(value)).toString('base64');
    const payload = { message: `agentos: persist ${key}`, content: encoded };
    if (sha) payload.sha = sha;
    const { response, body } = await request(pathFor(key), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.status === 409) return { written: false, conflict: true };
    if (!response.ok) throw new Error(`GitHub persistence write failed: ${response.status}`);
    return { written: true, sha: body?.content?.sha ?? null };
  }

  async function conditionalDelete(key, sha) {
    const { response } = await request(pathFor(key), {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: `agentos: release ${key}`, sha })
    });
    if (response.status === 409) return { deleted: false, conflict: true };
    if (response.status === 404) return { deleted: false, missing: true };
    if (!response.ok) throw new Error(`GitHub persistence delete failed: ${response.status}`);
    return { deleted: true };
  }

  const adapter = {
    async acquireLease(taskId, ownerId, now = Date.now(), ttlMs = 5 * 60 * 1000) {
      if (!taskId || !ownerId) return { acquired: false, reason: 'invalid_lease_request' };
      const key = `lease:${taskId}`;
      const current = await read(key);
      if (current?.value?.expires_at > now) return { acquired: false, reason: 'lease_active', lease: { ...current.value } };
      const lease = { task_id: taskId, owner: ownerId, acquired_at: now, expires_at: now + ttlMs };
      const write = await conditionalWrite(key, lease, current?.sha ?? null);
      if (write.written) return { acquired: true, lease };
      const latest = await read(key);
      if (latest?.value?.expires_at > now) return { acquired: false, reason: 'lease_active', lease: { ...latest.value } };
      return { acquired: false, reason: 'lease_conflict' };
    },

    async renewLease(taskId, ownerId, now = Date.now(), ttlMs = 5 * 60 * 1000) {
      const key = `lease:${taskId}`;
      const current = await read(key);
      if (!current?.value || current.value.owner !== ownerId || current.value.expires_at <= now) return { renewed: false, reason: 'lease_not_owned' };
      const lease = { ...current.value, expires_at: now + ttlMs };
      const write = await conditionalWrite(key, lease, current.sha);
      return write.written ? { renewed: true, lease } : { renewed: false, reason: 'lease_conflict' };
    },

    async releaseLease(taskId, ownerId) {
      const key = `lease:${taskId}`;
      const current = await read(key);
      if (!current?.value || current.value.owner !== ownerId) return { released: false, reason: 'lease_not_owned' };
      const deleted = await conditionalDelete(key, current.sha);
      return deleted.deleted ? { released: true } : { released: false, reason: deleted.conflict ? 'lease_conflict' : 'lease_not_owned' };
    },

    async getCompletion(taskId) {
      const current = await read(completionKey(taskId));
      return current?.value ?? null;
    },

    async putCompletion(taskId, response) {
      const key = completionKey(taskId);
      const current = await read(key);
      if (current) return { stored: false, existing: current.value };
      const write = await conditionalWrite(key, response);
      if (write.written) return { stored: true, response };
      const latest = await read(key);
      return latest ? { stored: false, existing: latest.value } : { stored: false, reason: 'completion_conflict' };
    }
  };

  return assertPersistenceAdapter(adapter);
}
