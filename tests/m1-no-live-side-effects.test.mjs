import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const modules = [
  'agentos-boot.mjs',
  'overseer-bootstrap.mjs',
  'overseer-session.mjs',
  'task-pipeline.mjs',
  'model-registry.mjs',
  'overseer-router.mjs',
  'provider-adapter.mjs',
  'provider-executor.mjs',
];

const forbidden = [
  /\bfetch\s*\(/,
  /https?:\/\//,
  /node:child_process/,
  /\bexec(?:File)?\s*\(/,
  /\bspawn\s*\(/,
  /node:fs/,
  /process\.env/,
];

test('M1 boot-to-observation modules retain injected local-only boundaries', async () => {
  for (const file of modules) {
    const source = await readFile(resolve('runtime', file), 'utf8');
    for (const pattern of forbidden) {
      assert.equal(pattern.test(source), false, `${file} must not contain ${pattern}`);
    }
  }
});

console.log('M1 no-live-side-effect boundary test passed');
