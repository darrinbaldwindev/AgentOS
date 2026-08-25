import assert from 'node:assert/strict';
import {
  listDeterministicTestFiles,
  runDeterministicTestFiles,
} from '../scripts/run-tests.mjs';

const files = listDeterministicTestFiles({
  entries: ['z.test.mjs', 'README.md', 'a.test.mjs', 'nested.test.js'],
});
assert.deepEqual(files, ['tests/a.test.mjs', 'tests/z.test.mjs']);

const successful = runDeterministicTestFiles({
  files: ['tests/a.test.mjs', 'tests/b.test.mjs'],
  execute: () => ({ status: 0 }),
});
assert.equal(successful.passed, true);
assert.equal(successful.failures.length, 0);

const failed = runDeterministicTestFiles({
  files: ['tests/a.test.mjs', 'tests/failing.test.mjs'],
  execute: (file) => ({ status: file.includes('failing') ? 1 : 0 }),
});
assert.equal(failed.passed, false);
assert.deepEqual(failed.failures.map((result) => result.file), ['tests/failing.test.mjs']);

assert.throws(() => runDeterministicTestFiles({ files: [] }), /at least one deterministic test file/);

console.log('CORE-002 deterministic test-runner tests passed');
