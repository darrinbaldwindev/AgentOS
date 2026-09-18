import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_CONFIG, MIN_NODE_MAJOR, assertSupportedNode, installLocal } from '../scripts/install-local.mjs';

test('local installer rejects unsupported Node versions', () => {
  assert.throws(() => assertSupportedNode(`${MIN_NODE_MAJOR - 1}.0.0`), /NODE_VERSION_UNSUPPORTED/);
  assert.doesNotThrow(() => assertSupportedNode(`${MIN_NODE_MAJOR}.0.0`));
});

test('local installer creates durable safe defaults without enabling autonomy', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-install-test-'));
  try {
    const result = await installLocal({ root });
    assert.equal(result.created, true);
    const config = JSON.parse(await readFile(result.configPath, 'utf8'));
    const state = JSON.parse(await readFile(result.statePath, 'utf8'));
    assert.deepEqual(config, DEFAULT_CONFIG);
    assert.equal(config.mode, 'DRY_RUN');
    assert.equal(config.autonomyEnabled, false);
    assert.equal(config.scheduler.enabled, false);
    assert.equal(config.scheduler.cadenceMinutes, 5);
    assert.equal(state.schemaVersion, 1);

    const second = await installLocal({ root });
    assert.equal(second.created, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('local installer refuses force overwrite of a complete existing install', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-install-force-existing-test-'));
  try {
    const result = await installLocal({ root });
    const configBefore = await readFile(result.configPath, 'utf8');
    const stateBefore = await readFile(result.statePath, 'utf8');

    await assert.rejects(
      installLocal({ root, force: true }),
      /LOCAL_INSTALL_FORCE_UNSAFE: refusing to overwrite an existing installation/,
    );

    assert.equal(await readFile(result.configPath, 'utf8'), configBefore);
    assert.equal(await readFile(result.statePath, 'utf8'), stateBefore);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('local installer fails closed when an existing install has lost canonical state', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-install-incomplete-test-'));
  try {
    const result = await installLocal({ root });
    await rm(result.statePath);

    await assert.rejects(
      installLocal({ root }),
      /LOCAL_INSTALL_INCOMPLETE: config exists but canonical state is missing/,
    );
    await assert.rejects(
      installLocal({ root, force: true }),
      /LOCAL_INSTALL_INCOMPLETE: config exists but canonical state is missing/,
    );

    const config = JSON.parse(await readFile(result.configPath, 'utf8'));
    assert.deepEqual(config, DEFAULT_CONFIG);
    await assert.rejects(readFile(result.statePath, 'utf8'), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('local installer fails closed when canonical state exists without config', async () => {
  const root = await mkdtemp(join(tmpdir(), 'agentos-install-missing-config-test-'));
  try {
    const result = await installLocal({ root });
    const stateBefore = await readFile(result.statePath, 'utf8');
    await rm(result.configPath);

    await assert.rejects(
      installLocal({ root }),
      /LOCAL_INSTALL_INCOMPLETE: canonical state exists but config is missing/,
    );
    await assert.rejects(
      installLocal({ root, force: true }),
      /LOCAL_INSTALL_INCOMPLETE: canonical state exists but config is missing/,
    );

    await assert.rejects(readFile(result.configPath, 'utf8'), /ENOENT/);
    assert.equal(await readFile(result.statePath, 'utf8'), stateBefore);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
