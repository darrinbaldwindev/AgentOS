import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_CONFIG, MIN_NODE_MAJOR, assertSupportedNode, installLocal } from '../scripts/install-local.mjs';

test('local installer rejects unsupported Node versions', () => {
  assert.throws(() => assertSupportedNode(`${MIN_NODE_MAJOR - 1}.0.0`), /NODE_VERSION_UNSUPPORTED/);
  assert.doesNotThrow(() => assertSupportedNode(`${MIN_NODE_MAJOR}.0.0`));
});

test('local installer creates durable safe defaults without enabling autonomy', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-install-test-'));
  const result = await installLocal({ root });
  assert.equal(result.created, true);
  const config = JSON.parse(await readFile(result.configPath, 'utf8'));
  const state = JSON.parse(await readFile(result.statePath, 'utf8'));
  assert.deepEqual(config, DEFAULT_CONFIG);
  assert.equal(config.mode, 'DRY_RUN');
  assert.equal(config.autonomyEnabled, false);
  assert.equal(state.schemaVersion, 1);

  const second = await installLocal({ root });
  assert.equal(second.created, false);
});
