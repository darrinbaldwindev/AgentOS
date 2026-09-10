import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, open, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { createLocalChat } from '../runtime/local-chat.mjs';

for (const payload of ['', '{', JSON.stringify({ pid: 999999, startedAt: '2020-01-01T00:00:00Z' })]) {
  test(`uncertain lock remains owned during competing startup: ${JSON.stringify(payload)}`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-publication-'));
    let owner;
    const contenders = [];
    try {
      await installLocal({ root });
      const path = join(root, 'basic-chat.lock');
      owner = await open(path, 'wx');
      await owner.writeFile(payload);
      const results = await Promise.allSettled([createLocalChat({ root }), createLocalChat({ root })]);
      contenders.push(...results.filter(r => r.status === 'fulfilled').map(r => r.value));
      assert.equal(contenders.length, 0, 'no contender may replace an uncertain owner');
      for (const result of results) assert.match(result.reason.message, /BASIC_CHAT_/);
      assert.equal(await readFile(path, 'utf8'), payload);
    } finally {
      for (const chat of contenders) await chat.close();
      await owner?.close();
      await rm(root, { recursive: true, force: true });
    }
  });
}
