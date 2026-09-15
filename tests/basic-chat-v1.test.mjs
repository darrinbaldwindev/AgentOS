import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { createLocalChat, USER_STATES } from '../runtime/local-chat.mjs';
import { startBasicChat } from '../runtime/basic-chat-server.mjs';
import { wakeLocal } from '../runtime/local-wake.mjs';

async function makeRoot({ schedulerEnabled = false } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'agentos-chat-'));
  await installLocal({ root });
  const configPath = join(root, 'config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  config.scheduler = { ...(config.scheduler ?? {}), enabled: schedulerEnabled };
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
  return root;
}

describe('Mission C Basic Chat V1', () => {
  it('A/B: chat turn uses canonical wake with requireSchedulerDisabled', async () => {
    const root = await makeRoot();
    const chat = await createLocalChat({ root });
    try {
      const snap = await chat.send('hello governed chat');
      assert.ok(snap.history.some((m) => m.role === 'user' && m.text.includes('hello')));
      assert.ok(snap.history.some((m) => m.role === 'agentos'));
      assert.ok([USER_STATES.COMPLETE, USER_STATES.BLOCKED].includes(snap.status));
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('C: scheduler enabled causes chat turn to fail closed', async () => {
    const root = await makeRoot({ schedulerEnabled: true });
    const chat = await createLocalChat({ root });
    try {
      await assert.rejects(() => chat.send('should fail'), /LOCAL_WAKE_REQUIRES_SCHEDULER_DISABLED|CHAT_REQUIRES/);
      const snap = await chat.snapshot();
      assert.equal(snap.status, USER_STATES.BLOCKED);
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('G: second message works after first', async () => {
    const root = await makeRoot();
    const chat = await createLocalChat({ root });
    try {
      await chat.send('first');
      const snap = await chat.send('second');
      assert.ok(snap.history.filter((m) => m.role === 'user').length >= 2);
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('H/I: pause blocks; resume restores', async () => {
    const root = await makeRoot();
    const chat = await createLocalChat({ root });
    try {
      await chat.control('pause');
      await assert.rejects(() => chat.send('blocked by pause'), /CHAT_PAUSED/);
      await chat.control('resume');
      const snap = await chat.send('after resume');
      assert.ok(snap.history.some((m) => m.text === 'after resume'));
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('J: stop prevents subsequent execution', async () => {
    const root = await makeRoot();
    const chat = await createLocalChat({ root });
    try {
      await chat.control('stop');
      await assert.rejects(() => chat.send('nope'), /CHAT_STOPPED/);
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('K/L: restart restores conversation without replay', async () => {
    const root = await makeRoot();
    let chat = await createLocalChat({ root });
    await chat.send('persist me');
    const before = await chat.history();
    await chat.close();
    chat = await createLocalChat({ root });
    try {
      const after = await chat.history();
      assert.equal(after.filter((m) => m.role === 'user').length, before.filter((m) => m.role === 'user').length);
      assert.ok(after.some((m) => m.text === 'persist me'));
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('M: public wakeLocal ignores injected greenEvaluate; chat rejects injection fields', async () => {
    const root = await makeRoot();
    try {
      const r = await wakeLocal({
        root,
        objective: 'public seam',
        greenEvaluate: () => ({ disposition: 'fail', failures: ['x'], task_status: 'incomplete' }),
      });
      assert.equal(r.status, 'COMPLETED');
      assert.equal(r.green.disposition, 'pass');

      const app = await startBasicChat({ root, port: 0 });
      try {
        const res = await fetch(`${app.url}/api/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'hi', greenEvaluate: 'evil', autonomyEnabled: true }),
        });
        assert.equal(res.status, 403);
        const body = await res.json();
        assert.equal(body.error, 'INJECTION_REJECTED');
      } finally {
        await app.close();
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('loopback server serves UI and keeps composer markup', async () => {
    const root = await makeRoot();
    const app = await startBasicChat({ root, port: 0 });
    try {
      const html = await (await fetch(`${app.url}/`)).text();
      assert.match(html, /id="message"/);
      assert.match(html, /composer-area/);
      assert.match(html, /id="send"/);
    } finally {
      await app.close();
      await rm(root, { recursive: true, force: true });
    }
  });
});
