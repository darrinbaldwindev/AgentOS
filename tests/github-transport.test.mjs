import test from 'node:test';
import assert from 'node:assert/strict';
import { createGitHubTransport } from '../src/dispatch/github-transport.mjs';

test('GitHub transport rejects stale writes before mutation', async () => {
  let writes = 0;
  const transport = createGitHubTransport({
    getFile: async () => ({ sha: 'sha-current', content: 'current' }),
    putFile: async () => { writes += 1; return { sha: 'sha-next' }; },
    appendFile: async () => ({ ok: true }),
  });
  const result = await transport.write('task.json', '{}', { expectedSha: 'sha-stale' });
  assert.equal(result.written, false);
  assert.equal(result.reason, 'version_conflict');
  assert.equal(writes, 0);
});

test('GitHub transport writes against the current blob when version matches', async () => {
  let args;
  const transport = createGitHubTransport({
    getFile: async () => ({ sha: 'sha-current' }),
    putFile: async (...values) => { args = values; return { sha: 'sha-next' }; },
    appendFile: async () => ({ ok: true }),
  });
  const result = await transport.write('task.json', '{}', { expectedSha: 'sha-current', fingerprint: 'fp' });
  assert.equal(result.written, true);
  assert.equal(result.sha, 'sha-next');
  assert.equal(args[2].sha, 'sha-current');
  assert.equal(args[2].fingerprint, 'fp');
});
