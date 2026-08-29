import { spawnSync } from 'node:child_process';

const parallelArgs = ['--test', '--parallel', 'tests/**/*.test.mjs'];
const sequentialArgs = ['--test', 'tests/**/*.test.mjs'];

function run(args) {
  const res = spawnSync(process.execPath, args, { stdio: 'inherit' });
  return res.status ?? 1;
}

// Try parallel first; if it fails (non-zero exit), fall back to sequential.
let status = run(parallelArgs);
if (status !== 0) {
  console.warn('\nParallel test runner failed or unsupported, falling back to sequential tests.');
  status = run(sequentialArgs);
}
process.exit(status);
