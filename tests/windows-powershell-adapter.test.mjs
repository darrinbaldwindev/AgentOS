import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createWindowsPowerShellAdapter } from '../runtime/windows-powershell-adapter.mjs';

function fixture(overrides = {}) {
  const calls = [];
  const adapter = createWindowsPowerShellAdapter({
    allowedRoots: ['C:/agentos'],
    pathResolver: (input) => input,
    executor: async (request) => {
      calls.push(request);
      return { stdout: 'ok', stderr: '', exitCode: 0 };
    },
    ...overrides,
  });
  return { adapter, calls };
}

function createWin32Resolver(entries) {
  const canonical = new Map(
    Object.entries(entries).map(([input, output]) => [path.win32.normalize(input).toLowerCase(), output])
  );
  return (input) => {
    const key = path.win32.normalize(input).toLowerCase();
    if (!canonical.has(key)) {
      const error = new Error(`ENOENT: ${input}`);
      error.code = 'ENOENT';
      throw error;
    }
    return canonical.get(key);
  };
}

function win32Fixture({ allowedRoots = ['C:\\AgentOS'], mappings = {}, ...overrides } = {}) {
  return fixture({
    allowedRoots,
    pathModule: path.win32,
    pathResolver: createWin32Resolver({
      'C:\\AgentOS': 'C:\\AgentOS',
      ...mappings,
    }),
    ...overrides,
  });
}

test('unknown operation is rejected before execution', async () => {
  const { adapter, calls } = fixture();
  await assert.rejects(adapter.execute({ operation: 'shell.anything', cwd: 'C:/agentos' }), /POWERSHELL_OPERATION_NOT_ALLOWED/);
  assert.equal(calls.length, 0);
});

test('cwd outside approved project roots is rejected before execution', async () => {
  const { adapter, calls } = fixture();
  await assert.rejects(adapter.execute({ operation: 'repo.status', cwd: 'C:/Windows/System32' }), /POWERSHELL_CWD_OUTSIDE_ALLOWED_ROOT/);
  assert.equal(calls.length, 0);
});

test('canonical path escape through a junction or symlink is rejected before execution', async () => {
  const lexicalEscape = path.resolve('C:/agentos/linked');
  const physicalOutside = path.resolve('D:/outside');
  const { adapter, calls } = fixture({
    pathResolver: (input) => input === lexicalEscape ? physicalOutside : input,
  });
  await assert.rejects(adapter.execute({ operation: 'repo.status', cwd: 'C:/agentos/linked' }), /POWERSHELL_CWD_OUTSIDE_ALLOWED_ROOT/);
  assert.equal(calls.length, 0);
});

test('path canonicalization failure is fail-closed before execution', async () => {
  const { adapter, calls } = fixture({ pathResolver: () => { throw new Error('realpath failed'); } });
  await assert.rejects(adapter.execute({ operation: 'repo.status', cwd: 'C:/agentos/AgentOS' }), /POWERSHELL_PATH_CANONICALIZATION_FAILED/);
  assert.equal(calls.length, 0);
});

test('configured allowed-root canonicalization failure is fail-closed before execution', async () => {
  const { adapter, calls } = win32Fixture({
    allowedRoots: ['C:\\AgentOS', 'Z:\\invalid'],
  });
  await assert.rejects(
    adapter.execute({ operation: 'repo.status', cwd: 'C:\\AgentOS' }),
    /POWERSHELL_ALLOWED_ROOT_CANONICALIZATION_FAILED/
  );
  assert.equal(calls.length, 0);
});

test('win32 semantics allow exact canonical approved root', async () => {
  const { adapter, calls } = win32Fixture();
  const result = await adapter.execute({ operation: 'repo.status', cwd: 'C:\\AgentOS' });
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
});

test('win32 semantics allow case-insensitive child path', async () => {
  const { adapter, calls } = win32Fixture({
    mappings: { 'c:\\agentos\\src': 'C:\\AgentOS\\src' },
  });
  const result = await adapter.execute({ operation: 'repo.status', cwd: 'c:\\agentos\\src' });
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
});

test('win32 semantics reject root-prefix collision', async () => {
  const { adapter, calls } = win32Fixture({
    mappings: { 'C:\\AgentOS2': 'C:\\AgentOS2' },
  });
  await assert.rejects(
    adapter.execute({ operation: 'repo.status', cwd: 'C:\\AgentOS2' }),
    /POWERSHELL_CWD_OUTSIDE_ALLOWED_ROOT/
  );
  assert.equal(calls.length, 0);
});

test('win32 semantics reject cross-drive target', async () => {
  const { adapter, calls } = win32Fixture({
    mappings: { 'D:\\outside': 'D:\\outside' },
  });
  await assert.rejects(
    adapter.execute({ operation: 'repo.status', cwd: 'D:\\outside' }),
    /POWERSHELL_CWD_OUTSIDE_ALLOWED_ROOT/
  );
  assert.equal(calls.length, 0);
});

test('win32 semantics reject canonical reparse escape across drives', async () => {
  const { adapter, calls } = win32Fixture({
    mappings: { 'C:\\AgentOS\\linked': 'D:\\outside' },
  });
  await assert.rejects(
    adapter.execute({ operation: 'repo.status', cwd: 'C:\\AgentOS\\linked' }),
    /POWERSHELL_CWD_OUTSIDE_ALLOWED_ROOT/
  );
  assert.equal(calls.length, 0);
});

test('repo status uses fixed non-interactive non-elevated PowerShell invocation', async () => {
  const { adapter, calls } = fixture();
  const result = await adapter.execute({ operation: 'repo.status', cwd: 'C:/agentos/AgentOS' });
  assert.equal(result.success, true);
  assert.equal(result.elevated, false);
  assert.equal(result.interactive, false);
  assert.equal(result.capability, 'shell.powershell.repo.read');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].executable, 'powershell.exe');
  assert.deepEqual(calls[0].args.slice(0, 6), ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'RemoteSigned', '-Command']);
  assert.equal(calls[0].args[6], "& 'git.exe' status --short --branch");
  assert.equal(result.resolved_executables['powershell.exe'].path, 'powershell.exe');
  assert.equal(result.resolved_executables['git.exe'].path, 'git.exe');
});

test('development test operation is fixed and separately classified', async () => {
  const { adapter, calls } = fixture();
  const result = await adapter.execute({ operation: 'test.run', cwd: 'C:/agentos/AgentOS' });
  assert.equal(result.capability, 'shell.powershell.dev.execute');
  assert.equal(calls[0].args[6], "& 'npm.cmd' test");
});

test('resolved executable paths are the exact paths passed to PowerShell and embedded operation tools', async () => {
  const resolved = {
    'powershell.exe': { path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', version: '5.1.26100.33296' },
    'git.exe': { path: 'C:\\Program Files\\Git\\cmd\\git.exe', version: 'git version 2.55.0.windows.5' },
  };
  const { adapter, calls } = fixture({ toolResolver: async (tool) => resolved[tool] });
  const result = await adapter.execute({ operation: 'repo.status', cwd: 'C:/agentos/AgentOS' });
  assert.equal(calls[0].executable, resolved['powershell.exe'].path);
  assert.equal(calls[0].args[6], `& '${resolved['git.exe'].path}' status --short --branch`);
  assert.deepEqual(result.resolved_executables, resolved);
});

test('tool resolution failure returns fail-closed evidence without invoking executor', async () => {
  const { adapter, calls } = fixture({
    toolResolver: async (tool) => tool === 'powershell.exe' ? { path: 'powershell.exe', version: null } : null,
  });
  const result = await adapter.execute({ operation: 'repo.status', cwd: 'C:/agentos/AgentOS' });
  assert.equal(result.success, false);
  assert.match(result.stderr, /POWERSHELL_EXECUTABLE_RESOLUTION_FAILED:git\.exe/);
  assert.equal(calls.length, 0);
});

test('process and service inspection are read-only system capabilities', () => {
  const { adapter } = fixture();
  assert.equal(adapter.describe('process.list').capability, 'shell.powershell.system.read');
  assert.equal(adapter.describe('service.list').capability, 'shell.powershell.system.read');
  assert.equal(adapter.describe('process.list').elevated, false);
});

test('executor failure returns bounded failure evidence instead of throwing away output', async () => {
  const { adapter } = fixture({ executor: async () => {
    const error = new Error('process failed');
    error.code = 7;
    error.stdout = 'partial-out';
    error.stderr = 'partial-err';
    throw error;
  } });
  const result = await adapter.execute({ operation: 'audit.run', cwd: 'C:/agentos/AgentOS' });
  assert.equal(result.success, false);
  assert.equal(result.exit_code, 7);
  assert.equal(result.stdout, 'partial-out');
  assert.equal(result.stderr, 'partial-err');
});

test('operation catalogue contains only the bounded Level-1 set', () => {
  const { adapter } = fixture();
  assert.deepEqual(adapter.operations, ['repo.status','repo.diff','test.run','audit.run','process.list','service.list']);
});
