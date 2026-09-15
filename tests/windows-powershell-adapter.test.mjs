import test from 'node:test';
import assert from 'node:assert/strict';
import { createWindowsPowerShellAdapter } from '../runtime/windows-powershell-adapter.mjs';

function fixture(overrides = {}) {
  const calls = [];
  const adapter = createWindowsPowerShellAdapter({
    allowedRoots: ['C:/agentos'],
    executor: async (request) => {
      calls.push(request);
      return { stdout: 'ok', stderr: '', exitCode: 0 };
    },
    ...overrides,
  });
  return { adapter, calls };
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
  assert.equal(calls[0].args[6], 'git status --short --branch');
});

test('development test operation is fixed and separately classified', async () => {
  const { adapter, calls } = fixture();
  const result = await adapter.execute({ operation: 'test.run', cwd: 'C:/agentos/AgentOS' });
  assert.equal(result.capability, 'shell.powershell.dev.execute');
  assert.equal(calls[0].args[6], 'npm test');
});

test('process and service inspection are read-only system capabilities', () => {
  const { adapter } = fixture();
  assert.equal(adapter.describe('process.list').capability, 'shell.powershell.system.read');
  assert.equal(adapter.describe('service.list').capability, 'shell.powershell.system.read');
  assert.equal(adapter.describe('process.list').elevated, false);
});

test('executor failure returns bounded failure evidence instead of throwing away output', async () => {
  const { adapter } = fixture({
    executor: async () => {
      const error = new Error('process failed');
      error.code = 7;
      error.stdout = 'partial-out';
      error.stderr = 'partial-err';
      throw error;
    },
  });
  const result = await adapter.execute({ operation: 'audit.run', cwd: 'C:/agentos/AgentOS' });
  assert.equal(result.success, false);
  assert.equal(result.exit_code, 7);
  assert.equal(result.stdout, 'partial-out');
  assert.equal(result.stderr, 'partial-err');
});

test('operation catalogue contains only the bounded Level-1 set', () => {
  const { adapter } = fixture();
  assert.deepEqual(adapter.operations, [
    'repo.status',
    'repo.diff',
    'test.run',
    'audit.run',
    'process.list',
    'service.list',
  ]);
});
