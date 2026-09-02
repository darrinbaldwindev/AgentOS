import test from 'node:test';
import assert from 'node:assert/strict';
import { createGitHubContentsPersistence } from '../src/dispatch/github-contents-persistence.mjs';

function fakeGitHub() {
  const records = new Map();
  let shaCounter = 0;
  const fetchImpl = async (url, options = {}) => {
    const path = decodeURIComponent(new URL(url).pathname.split('/contents/')[1]);
    const method = options.method ?? 'GET';
    const current = records.get(path);
    if (method === 'GET') {
      if (!current) return new Response('', { status: 404 });
      return new Response(JSON.stringify({ sha: current.sha, content: Buffer.from(JSON.stringify(current.value)).toString('base64') }), { status: 200 });
    }
    const body = JSON.parse(options.body);
    if (method === 'PUT') {
      if (body.sha && (!current || body.sha !== current.sha)) return new Response(JSON.stringify({ message: 'conflict' }), { status: 409 });
      if (!body.sha && current) return new Response(JSON.stringify({ message: 'exists' }), { status: 409 });
      const sha = `sha-${++shaCounter}`;
      records.set(path, { sha, value: JSON.parse(Buffer.from(body.content, 'base64').toString('utf8')) });
      return new Response(JSON.stringify({ content: { sha } }), { status: 201 });
    }
    if (method === 'DELETE') {
      if (!current || body.sha !== current.sha) return new Response('', { status: current ? 409 : 404 });
      records.delete(path);
      return new Response('', { status: 200 });
    }
    return new Response('', { status: 405 });
  };
  return { records, fetchImpl };
}

test('GitHub persistence provides shared conditional lease acquisition and release', async () => {
  const { fetchImpl } = fakeGitHub();
  const a = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl });
  const b = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl });

  const first = await a.acquireLease('task-1', 'worker-a', 1000, 10000);
  assert.equal(first.acquired, true);
  const second = await b.acquireLease('task-1', 'worker-b', 1001, 10000);
  assert.equal(second.acquired, false);
  assert.equal(second.reason, 'lease_active');

  const released = await a.releaseLease('task-1', 'worker-a');
  assert.equal(released.released, true);
  const third = await b.acquireLease('task-1', 'worker-b', 1002, 10000);
  assert.equal(third.acquired, true);
});

test('GitHub persistence prevents stale lease renewal from overwriting a newer lease', async () => {
  const { fetchImpl } = fakeGitHub();
  const a = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl });
  const b = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl });

  const first = await a.acquireLease('task-2', 'worker-a', 1000, 1000);
  assert.equal(first.acquired, true);
  const renewed = await a.renewLease('task-2', 'worker-a', 1500, 1000);
  assert.equal(renewed.renewed, true);
  const rejected = await b.acquireLease('task-2', 'worker-b', 1600, 1000);
  assert.equal(rejected.acquired, false);
  assert.equal(rejected.reason, 'lease_active');
});

test('GitHub persistence stores one completion and replays the winner', async () => {
  const { fetchImpl } = fakeGitHub();
  const a = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl });
  const b = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl });
  const response = { mission_id: 'task-3', status: 'COMPLETED' };

  const first = await a.putCompletion('task-3', response);
  assert.equal(first.stored, true);
  const second = await b.putCompletion('task-3', { mission_id: 'task-3', status: 'BLOCKED' });
  assert.equal(second.stored, false);
  assert.deepEqual(second.existing, response);
  assert.deepEqual(await b.getCompletion('task-3'), response);
});
