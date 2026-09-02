import test from 'node:test';
import assert from 'node:assert/strict';
import { createGitHubContentsPersistence } from '../src/dispatch/github-contents-persistence.mjs';

function deferred() {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
}

function raceGitHub({ gatePut = false } = {}) {
  const records = new Map();
  let shaCounter = 0;
  let putCount = 0;
  const putGate = deferred();

  const fetchImpl = async (url, options = {}) => {
    const path = new URL(url).pathname.split('/contents/')[1];
    const method = options.method ?? 'GET';

    if (method === 'GET') {
      const current = records.get(path);
      if (!current) return new Response('', { status: 404 });
      return new Response(JSON.stringify({
        sha: current.sha,
        content: Buffer.from(JSON.stringify(current.value)).toString('base64')
      }), { status: 200 });
    }

    const body = JSON.parse(options.body);
    if (method === 'PUT') {
      putCount += 1;
      if (gatePut && putCount <= 2) {
        if (putCount === 2) putGate.resolve();
        await putGate.promise;
      }
      const current = records.get(path);
      if (body.sha && (!current || body.sha !== current.sha)) {
        return new Response(JSON.stringify({ message: 'conflict' }), { status: 409 });
      }
      if (!body.sha && current) {
        return new Response(JSON.stringify({ message: 'exists' }), { status: 409 });
      }
      const sha = `sha-${++shaCounter}`;
      records.set(path, {
        sha,
        value: JSON.parse(Buffer.from(body.content, 'base64').toString('utf8'))
      });
      return new Response(JSON.stringify({ content: { sha } }), { status: 201 });
    }

    if (method === 'DELETE') {
      const current = records.get(path);
      if (!current || body.sha !== current.sha) return new Response('', { status: current ? 409 : 404 });
      records.delete(path);
      return new Response('', { status: 200 });
    }

    return new Response('', { status: 405 });
  };

  return { records, fetchImpl };
}

test('two concurrent runners have exactly one winner for a new lease', async () => {
  const backing = raceGitHub({ gatePut: true });
  const a = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });
  const b = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });

  const results = await Promise.all([
    a.acquireLease('race-1', 'worker-a', 1000, 10000),
    b.acquireLease('race-1', 'worker-b', 1000, 10000)
  ]);

  assert.equal(results.filter((result) => result.acquired).length, 1);
  assert.equal(results.filter((result) => !result.acquired).length, 1);
  const stored = [...backing.records.values()];
  assert.equal(stored.length, 1);
  assert.ok(stored[0].value.owner === 'worker-a' || stored[0].value.owner === 'worker-b');
});

test('expired lease takeover is single-winner and stale owner cannot release it', async () => {
  const backing = raceGitHub();
  const a = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });
  const b = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });
  const c = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });

  assert.equal((await a.acquireLease('race-2', 'worker-a', 1000, 100)).acquired, true);
  const takeover = await Promise.all([
    b.acquireLease('race-2', 'worker-b', 1101, 100),
    c.acquireLease('race-2', 'worker-c', 1101, 100)
  ]);
  assert.equal(takeover.filter((result) => result.acquired).length, 1);

  const staleRelease = await a.releaseLease('race-2', 'worker-a');
  assert.equal(staleRelease.released, false);
  assert.equal(staleRelease.reason, 'lease_not_owned');
});

test('completion race is first-writer-wins and loser replays the winner', async () => {
  const backing = raceGitHub({ gatePut: true });
  const a = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });
  const b = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });
  const responseA = { mission_id: 'race-3', status: 'COMPLETED', winner: 'a' };
  const responseB = { mission_id: 'race-3', status: 'COMPLETED', winner: 'b' };

  const results = await Promise.all([
    a.putCompletion('race-3', responseA),
    b.putCompletion('race-3', responseB)
  ]);

  assert.equal(results.filter((result) => result.stored).length, 1);
  assert.equal(results.filter((result) => !result.stored).length, 1);
  const winner = results.find((result) => result.stored).response;
  const loser = results.find((result) => !result.stored).existing;
  assert.deepEqual(loser, winner);
  assert.deepEqual(await a.getCompletion('race-3'), winner);
});

test('abandoned execution recovers after expiry without duplicate completion', async () => {
  const backing = raceGitHub();
  const a = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });
  const b = createGitHubContentsPersistence({ owner: 'o', repo: 'r', token: 't', fetchImpl: backing.fetchImpl });

  assert.equal((await a.acquireLease('race-4', 'worker-a', 1000, 100)).acquired, true);
  assert.equal((await b.acquireLease('race-4', 'worker-b', 1101, 100)).acquired, true);

  const recovered = { mission_id: 'race-4', status: 'COMPLETED', winner: 'worker-b' };
  assert.equal((await b.putCompletion('race-4', recovered)).stored, true);

  const late = await a.putCompletion('race-4', { mission_id: 'race-4', status: 'COMPLETED', winner: 'worker-a' });
  assert.equal(late.stored, false);
  assert.deepEqual(late.existing, recovered);
  assert.deepEqual(await a.getCompletion('race-4'), recovered);
});
