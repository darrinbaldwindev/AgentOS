import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { observeBasicChatLock } from '../runtime/basic-chat-lock-observer.mjs';

async function withRoot(fn) {
  const root = await mkdtemp(join(tmpdir(), 'agentos-lock-observer-'));
  try {
    await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('missing Basic Chat lock produces no lock evidence', async () => {
  await withRoot(async (root) => {
    assert.deepEqual(await observeBasicChatLock({ root, processAlive: () => false }), []);
  });
});

for (const payload of ['', '{', JSON.stringify({ pid: 999999, startedAt: '2020-01-01T00:00:00.000Z' })]) {
  test(`uncertain or dead Basic Chat owner requires recovery without mutation: ${JSON.stringify(payload)}`, async () => {
    await withRoot(async (root) => {
      const path = join(root, 'basic-chat.lock');
      await writeFile(path, payload, 'utf8');
      const evidence = await observeBasicChatLock({ root, processAlive: () => false });
      assert.equal(evidence.length, 1);
      assert.equal(evidence[0].state, 'recovery_required');
      assert.equal(evidence[0].retained, true);
      assert.equal(evidence[0].uncertain, true);
      assert.equal(await readFile(path, 'utf8'), payload);
    });
  });
}

test('live Basic Chat owner is observed as held and never recovery-authorized', async () => {
  await withRoot(async (root) => {
    const path = join(root, 'basic-chat.lock');
    const payload = `${JSON.stringify({ pid: 4321, startedAt: '2026-09-11T00:00:00.000Z' })}\n`;
    await writeFile(path, payload, 'utf8');
    const evidence = await observeBasicChatLock({ root, processAlive: (pid) => pid === 4321 });
    assert.equal(evidence.length, 1);
    assert.equal(evidence[0].state, 'held');
    assert.equal(evidence[0].retained, false);
    assert.equal(evidence[0].uncertain, false);
    assert.equal(evidence[0].pid, 4321);
    assert.equal(await readFile(path, 'utf8'), payload);
  });
});

test('liveness-check failure fails closed without mutating the lock', async () => {
  await withRoot(async (root) => {
    const path = join(root, 'basic-chat.lock');
    const payload = JSON.stringify({ pid: 4321, startedAt: '2026-09-11T00:00:00.000Z' });
    await writeFile(path, payload, 'utf8');
    const evidence = await observeBasicChatLock({
      root,
      processAlive: () => { throw new Error('probe failed'); },
    });
    assert.equal(evidence[0].state, 'recovery_required');
    assert.equal(evidence[0].reason, 'BASIC_CHAT_LOCK_LIVENESS_UNKNOWN');
    assert.equal(await readFile(path, 'utf8'), payload);
  });
});
