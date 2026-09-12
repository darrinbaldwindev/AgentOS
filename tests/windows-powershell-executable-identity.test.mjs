import test from 'node:test';
import assert from 'node:assert/strict';
import { createWindowsPowerShellAdapter } from '../runtime/windows-powershell-adapter.mjs';

const cwd = 'C:/agentos';
const powershell = { path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', version: '5.1.26100.33296' };
const git = { path: 'C:\\Program Files\\Git\\bin\\git.exe', version: 'git version 2.55.0.windows.5' };
const npm = { path: 'C:\\Program Files\\nodejs\\npm.cmd', version: null };

function harness(resolved) {
  const calls = [];
  const adapter = createWindowsPowerShellAdapter({
    allowedRoots: [cwd],
    pathResolver: (input) => input,
    toolResolver: async (tool) => resolved[tool],
    executor: async (request) => {
      calls.push(request);
      return { stdout: 'ok', stderr: '', exitCode: 0 };
    },
  });
  return { adapter, calls };
}

function expected(overrides = {}) {
  return {
    'powershell.exe': { available: true, ...powershell },
    'git.exe': { available: true, ...git },
    'npm.cmd': { available: true, ...npm },
    ...overrides,
  };
}

test('matching expected executable identity permits exactly one invocation', async () => {
  const { adapter, calls } = harness({ 'powershell.exe': powershell, 'git.exe': git });
  const result = await adapter.execute({ operation: 'repo.status', cwd, expectedExecutables: expected() });
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
});

test('PowerShell path drift fails closed before executor invocation', async () => {
  const { adapter, calls } = harness({
    'powershell.exe': { ...powershell, path: 'C:\\Shadow\\powershell.exe' },
    'git.exe': git,
  });
  const result = await adapter.execute({ operation: 'repo.status', cwd, expectedExecutables: expected() });
  assert.equal(result.success, false);
  assert.match(result.stderr, /POWERSHELL_EXECUTABLE_IDENTITY_MISMATCH:powershell\.exe/);
  assert.equal(calls.length, 0);
});

test('Git path drift fails closed before executor invocation', async () => {
  const { adapter, calls } = harness({
    'powershell.exe': powershell,
    'git.exe': { ...git, path: 'C:\\Shadow\\git.exe' },
  });
  const result = await adapter.execute({ operation: 'repo.status', cwd, expectedExecutables: expected() });
  assert.equal(result.success, false);
  assert.match(result.stderr, /POWERSHELL_EXECUTABLE_IDENTITY_MISMATCH:git\.exe/);
  assert.equal(calls.length, 0);
});

test('known Git version drift fails closed before executor invocation', async () => {
  const { adapter, calls } = harness({
    'powershell.exe': powershell,
    'git.exe': { ...git, version: 'git version 9.9.9' },
  });
  const result = await adapter.execute({ operation: 'repo.status', cwd, expectedExecutables: expected() });
  assert.equal(result.success, false);
  assert.match(result.stderr, /POWERSHELL_EXECUTABLE_VERSION_MISMATCH:git\.exe/);
  assert.equal(calls.length, 0);
});

test('known expected version becoming unverifiable fails closed', async () => {
  const { adapter, calls } = harness({
    'powershell.exe': powershell,
    'git.exe': { ...git, version: null },
  });
  const result = await adapter.execute({ operation: 'repo.status', cwd, expectedExecutables: expected() });
  assert.equal(result.success, false);
  assert.match(result.stderr, /POWERSHELL_EXECUTABLE_VERSION_MISMATCH:git\.exe/);
  assert.equal(calls.length, 0);
});

test('npm command shim with matching path and unknown version is allowed', async () => {
  const { adapter, calls } = harness({ 'powershell.exe': powershell, 'npm.cmd': npm });
  const result = await adapter.execute({ operation: 'test.run', cwd, expectedExecutables: expected() });
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
});

test('missing expected operation-tool identity fails closed before invocation', async () => {
  const { adapter, calls } = harness({ 'powershell.exe': powershell, 'git.exe': git });
  const identities = expected();
  delete identities['git.exe'];
  const result = await adapter.execute({ operation: 'repo.status', cwd, expectedExecutables: identities });
  assert.equal(result.success, false);
  assert.match(result.stderr, /POWERSHELL_EXECUTABLE_IDENTITY_REQUIRED:git\.exe/);
  assert.equal(calls.length, 0);
});
