import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { startBasicChat } from '../runtime/basic-chat-server.mjs';
import { createLocalChat } from '../runtime/local-chat.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'agentos-chat-'));
  await installLocal({ root });
  let app = await startBasicChat({ root });
  t.after(async () => { await app.close(); await rm(root, { recursive: true, force: true }); });
  return { root, get app() { return app; }, async restart() { await app.close(); app = await startBasicChat({ root }); } };
}
async function post(app, path, input) {
  return fetch(app.url + path, { method: 'POST', headers: { Origin: app.url, 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
}
async function state(app) { return (await fetch(app.url + '/api/state')).json(); }

test('HTTP chat preserves governed task, mission, run, response and history across restart', async t => {
  const f = await fixture(t);
  const html = await (await fetch(f.app.url)).text();
  assert.match(html, /Conversation history/);
  const response = await post(f.app, '/api/send', { text: 'bounded browser acceptance' });
  assert.equal(response.status, 200);
  const turn = await response.json();
  assert.equal(turn.status, 'COMPLETED');
  assert.ok(turn.text.length < 300);
  const before = await state(f.app);
  assert.equal(before.history.length, 2);
  const run = before.runs[0];
  assert.equal(run.status, 'completed');
  assert.equal(run.freePreferred, true);
  assert.equal(run.source, 'overseer-user-chat');
  assert.equal(run.id, turn.runId);
  const persisted = JSON.parse(await readFile(join(f.root, DEFAULT_CONFIG.stateFile), 'utf8'));
  const task = persisted.records.artifact[run.taskId].payload;
  assert.equal(task.mission_id, turn.missionId);
  assert.equal(task.thread_id, turn.threadId);
  assert.equal(task.objective, 'bounded browser acceptance');
  assert.equal(task.status, 'completed');
  assert.equal(task.evidence.worker_id, 'agentos:deterministic-skill-agent');
  const evidence = persisted.records.artifact[run.responseArtifactId].payload;
  assert.equal(evidence.mission_id, turn.missionId);
  assert.ok(evidence.verification.includes('budget reconciled: RECONCILED'));
  await f.restart();
  assert.deepEqual(await state(f.app), before);
});

test('pause and stop persist and reject new dispatch until explicit resume', async t => {
  const f = await fixture(t);
  for (const action of ['pause', 'stop']) {
    assert.equal((await post(f.app, '/api/control', { action })).status, 200);
    await f.restart();
    const blocked = await post(f.app, '/api/send', { text: 'must not execute' });
    assert.equal(blocked.status, 400);
    assert.match((await blocked.json()).error, /CHAT_PAUSED_OR_STOPPED/);
    assert.equal((await state(f.app)).runs.length, 0);
    assert.equal((await post(f.app, '/api/control', { action: 'resume' })).status, 200);
  }
  assert.equal((await post(f.app, '/api/send', { text: 'now allowed' })).status, 200);
});

test('invalid input and cross-origin writes do not create conversation or dispatch', async t => {
  const f = await fixture(t);
  for (const text of ['', ' ', 'x'.repeat(4001), 42]) assert.equal((await post(f.app, '/api/send', { text })).status, 400);
  for (const origin of ['https://example.com', 'null']) {
    const response = await fetch(f.app.url + '/api/send', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'blocked' }) });
    assert.equal(response.status, 403);
  }
  assert.equal((await state(f.app)).history.length, 0);
  assert.equal((await state(f.app)).runs.length, 0);
});

test('unsafe config fails closed at startup and again before worker execution', async t => {
  const f = await fixture(t);
  await writeFile(join(f.root, 'config.json'), JSON.stringify({ ...DEFAULT_CONFIG, autonomyEnabled: true }));
  await assert.rejects(createLocalChat({ root: f.root }), /CHAT_REQUIRES/);
  const result = await post(f.app, '/api/send', { text: 'fail closed' });
  assert.equal(result.status, 400);
  const snapshot = await state(f.app);
  assert.equal(snapshot.history.length, 1);
  assert.equal(snapshot.runs[0].status, 'failed');
  const persisted = JSON.parse(await readFile(join(f.root, DEFAULT_CONFIG.stateFile), 'utf8'));
  assert.equal(Object.values(persisted.records.artifact).filter(a => a.artifactType === 'dispatch.task').length, 0);
});

test('second chat host is rejected and concurrent sends preserve both turns', async t => {
  const f = await fixture(t);
  await assert.rejects(createLocalChat({ root: f.root }), /EEXIST/);
  const results = await Promise.all(['one', 'two'].map(text => post(f.app, '/api/send', { text })));
  assert.ok(results.every(r => r.status === 200));
  const snapshot = await state(f.app);
  assert.equal(snapshot.history.length, 4);
  assert.equal(snapshot.runs.length, 2);
  assert.ok(snapshot.runs.every(run => run.status === 'completed'));
  await f.restart();
  assert.deepEqual(await state(f.app), snapshot);
});

test('invalid control values cannot alter persisted admission state', async t => {
  const f = await fixture(t);
  for (const action of ['__proto__', 'constructor', 'toString', ['pause'], null]) {
    const response = await post(f.app, '/api/control', { action });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, 'INVALID_CONTROL_ACTION');
  }
  assert.equal((await state(f.app)).control.status, 'ready');
  await f.restart();
  assert.equal((await state(f.app)).control.status, 'ready');
});

test('UTF-8 messages survive a multibyte character split across HTTP chunks', async t => {
  const f = await fixture(t);
  const text = 'Check café 🌏';
  const payload = Buffer.from(JSON.stringify({ text }));
  const split = payload.indexOf(Buffer.from('🌏')) + 1;
  const status = await new Promise((resolve, reject) => {
    const req = request(f.app.url + '/api/send', {
      method: 'POST', headers: { Origin: f.app.url, 'Content-Type': 'application/json' },
    }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.on('error', reject);
    req.write(payload.subarray(0, split));
    setTimeout(() => req.end(payload.subarray(split)), 20);
  });
  assert.equal(status, 200);
  assert.equal((await state(f.app)).history[0].text, text);
});
