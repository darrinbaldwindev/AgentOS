import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { createLocalChat } from '../runtime/local-chat.mjs';

async function makeRoot() {
  const root = await mkdtemp(join(tmpdir(), 'agentos-chat-stop-sticky-'));
  await installLocal({ root });
  const configPath = join(root, 'config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  config.scheduler = { ...(config.scheduler ?? {}), enabled: false };
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
  return root;
}

describe('Basic Chat Stop is sticky for the current host lifetime', () => {
  it('rejects Resume after Stop and keeps future sends blocked', async () => {
    const root = await makeRoot();
    const chat = await createLocalChat({ root });
    try {
      const stopped = await chat.control('stop');
      assert.equal(stopped.stopped, true);
      assert.equal(stopped.ready, false);

      await assert.rejects(() => chat.control('resume'), /CHAT_STOPPED/);
      const afterResumeAttempt = await chat.snapshot();
      assert.equal(afterResumeAttempt.stopped, true);
      assert.equal(afterResumeAttempt.ready, false);
      await assert.rejects(() => chat.send('must remain blocked'), /CHAT_STOPPED/);
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('rejects Pause after Stop instead of weakening the stopped state', async () => {
    const root = await makeRoot();
    const chat = await createLocalChat({ root });
    try {
      await chat.control('stop');
      await assert.rejects(() => chat.control('pause'), /CHAT_STOPPED/);
      const snapshot = await chat.snapshot();
      assert.equal(snapshot.stopped, true);
      assert.equal(snapshot.paused, false);
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('clears only transient Stop state after a clean host close and new host acquisition', async () => {
    const root = await makeRoot();
    const first = await createLocalChat({ root });
    try {
      await first.control('stop');
      const stopped = await first.snapshot();
      assert.equal(stopped.stopped, true);
      assert.equal(stopped.ready, false);
      await first.close();

      const restarted = await createLocalChat({ root });
      try {
        const snapshot = await restarted.snapshot();
        assert.equal(snapshot.stopped, false);
        assert.equal(snapshot.paused, false);
        assert.equal(snapshot.ready, true);
      } finally {
        await restarted.close();
      }
    } finally {
      await first.close();
      await rm(root, { recursive: true, force: true });
    }
  });
});
