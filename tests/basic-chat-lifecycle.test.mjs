import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createConnection } from 'node:net';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { createLocalChat } from '../runtime/local-chat.mjs';
import { startBasicChat } from '../runtime/basic-chat-server.mjs';

function portOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('Mission D: Basic Chat host lifecycle + lock', () => {
  it('A/B: start creates lock and listens on port', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-ab-'));
    try {
      await installLocal({ root });
      const app = await startBasicChat({ root, port: 0 });
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
      assert.equal(await portOpen(app.port), true);
      const lock = JSON.parse(await readFile(join(root, 'basic-chat.lock'), 'utf8'));
      assert.equal(lock.pid, process.pid);
      await app.close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('C: second active host is rejected', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-c-'));
    try {
      await installLocal({ root });
      const app = await startBasicChat({ root, port: 0 });
      await assert.rejects(() => startBasicChat({ root, port: 0 }), /BASIC_CHAT_ALREADY_RUNNING/);
      await app.close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('D/E/F: normal close removes lock, releases port, restart works', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-def-'));
    try {
      await installLocal({ root });
      const app1 = await startBasicChat({ root, port: 0 });
      const port1 = app1.port;
      await app1.close();
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
      assert.equal(await portOpen(port1), false);

      const app2 = await startBasicChat({ root, port: 0 });
      assert.equal(await portOpen(app2.port), true);
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
      await app2.close();
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('G/H: conversation survives host restart without replay', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-gh-'));
    try {
      await installLocal({ root });
      const app1 = await startBasicChat({ root, port: 0 });
      const send1 = await fetch(`${app1.url}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'lifecycle message one' }),
      });
      const body1 = await send1.json();
      assert.equal(body1.status, 'COMPLETE');
      const historyLen = body1.history.length;
      await app1.close();

      const app2 = await startBasicChat({ root, port: 0 });
      const state = await (await fetch(`${app2.url}/api/state`)).json();
      assert.equal(state.history.length, historyLen);
      assert.ok(state.history.some((m) => m.text === 'lifecycle message one'));
      assert.equal(state.history.filter((m) => m.role === 'user').length, 1);
      await app2.close();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('I: stale lock without live owner allows restart', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-i-'));
    try {
      await installLocal({ root });
      await writeFile(
        join(root, 'basic-chat.lock'),
        `${JSON.stringify({ pid: 999999, startedAt: new Date().toISOString() })}\n`,
      );
      const app = await startBasicChat({ root, port: 0 });
      assert.equal(await portOpen(app.port), true);
      const lock = JSON.parse(await readFile(join(root, 'basic-chat.lock'), 'utf8'));
      assert.equal(lock.pid, process.pid);
      await app.close();
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('chat.close alone removes lock (API path)', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-life-api-'));
    try {
      await installLocal({ root });
      const chat = await createLocalChat({ root });
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), true);
      await chat.close();
      assert.equal(await fileExists(join(root, 'basic-chat.lock')), false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
