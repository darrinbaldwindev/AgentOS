import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRuntimeConfig } from '../src/dispatch/runtime-config.mjs';

test('runtime config requires repository identity', () => {
  assert.throws(() => loadRuntimeConfig({}), /AGENTOS_GITHUB_OWNER, AGENTOS_GITHUB_REPO/);
});

test('runtime config uses safe defaults without exposing credentials', () => {
  const config = loadRuntimeConfig({ AGENTOS_GITHUB_OWNER: 'owner', AGENTOS_GITHUB_REPO: 'repo' });
  assert.deepEqual(config, {
    owner: 'owner', repo: 'repo', branch: 'main', apiBaseUrl: 'https://api.github.com',
  });
  assert.equal('token' in config, false);
  assert.equal('secret' in config, false);
});
