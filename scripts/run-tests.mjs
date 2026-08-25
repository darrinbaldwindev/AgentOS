import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export function listDeterministicTestFiles({ cwd = process.cwd(), entries = null } = {}) {
  const names = entries ?? readdirSync(resolve(cwd, 'tests'));
  return Object.freeze(
    names
      .filter((name) => name.endsWith('.test.mjs'))
      .sort()
      .map((name) => `tests/${name}`)
  );
}

export function runDeterministicTestFiles({
  files,
  cwd = process.cwd(),
  execute = (file) => spawnSync(process.execPath, [file], { cwd, stdio: 'inherit' }),
} = {}) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new TypeError('at least one deterministic test file is required');
  }

  const results = files.map((file) => {
    const result = execute(file);
    return Object.freeze({ file, status: result.status ?? 1 });
  });
  const failures = results.filter((result) => result.status !== 0);
  return Object.freeze({
    files: Object.freeze([...files]),
    results: Object.freeze(results),
    failures: Object.freeze(failures),
    passed: failures.length === 0,
  });
}

function main() {
  const files = listDeterministicTestFiles();
  const report = runDeterministicTestFiles({ files });
  if (!report.passed) {
    console.error(`Deterministic test suite failed: ${report.failures.map((failure) => failure.file).join(', ')}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Deterministic test suite passed: ${report.files.length} test files`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
