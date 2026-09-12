import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createWindowsPowerShellAdapter } from '../runtime/windows-powershell-adapter.mjs';
import { createWindowsPowerShellReceiptEvidence } from '../runtime/windows-powershell-receipt-evidence.mjs';

function task() {
  return {
    delivery_id: 'delivery-adapter-receipt-1',
    request_id: 'request-adapter-receipt-1',
    project_id: 'agentos-local',
    mission_id: 'mission-adapter-receipt-1',
    task_id: 'task-adapter-receipt-1',
    wake_trace_id: 'wake-adapter-receipt-1',
  };
}

function deterministicClock(...values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

test('actual bounded adapter result feeds canonical PowerShell intermediate receipt without translation', async () => {
  const admitted = task();
  const adapter = createWindowsPowerShellAdapter({
    allowedRoots: ['C:/agentos'],
    pathResolver: (input) => input,
    pathModule: path.win32,
    now: deterministicClock(1_000, 1_125),
    executor: async () => ({ stdout: '## main\n', stderr: '', exitCode: 0 }),
  });
  const result = await adapter.execute({ operation: 'repo.status', cwd: 'C:/agentos/AgentOS' });

  assert.equal(result.success, true);
  assert.equal(result.duration_ms, 125);
  assert.equal(result.finished_at, result.completed_at);
  assert.equal(result.timed_out, false);
  assert.equal(result.truncated, false);

  const receipt = createWindowsPowerShellReceiptEvidence({
    candidate: admitted,
    task: admitted,
    hostId: 'host-win-adapter-receipt-1',
    workerId: 'agentos:windows-powershell-worker',
    status: 'AWAITING_GREEN',
    powerShellResult: result,
    budgetStatus: 'RECONCILED',
    codeIdentity: '3431a2f945d28de3d268e4d707b1f166ff48966a',
    createdAt: '2026-09-12T06:13:00.000Z',
  });

  assert.equal(receipt.status, 'AWAITING_GREEN');
  assert.equal(receipt.task_id, admitted.task_id);
  assert.equal(receipt.wake_trace_id, admitted.wake_trace_id);
  assert.equal(receipt.execution.operation, 'repo.status');
  assert.equal(receipt.execution.cwd, path.win32.resolve('C:/agentos/AgentOS'));
  assert.equal(receipt.execution.duration_ms, 125);
  assert.equal(receipt.execution.exit_code, 0);
  assert.equal(receipt.execution.stdout, '## main\n');
  assert.equal(receipt.evidence.includes('powershell:timed_out:false'), true);
  assert.equal(receipt.evidence.includes('powershell:truncated:false'), true);
});

test('adapter timeout remains failed evidence and cannot be mistaken for successful execution', async () => {
  const adapter = createWindowsPowerShellAdapter({
    allowedRoots: ['C:/agentos'],
    pathResolver: (input) => input,
    pathModule: path.win32,
    now: deterministicClock(2_000, 2_500),
    executor: async () => {
      const error = new Error('timed out');
      error.killed = true;
      error.signal = 'SIGTERM';
      error.stdout = 'partial';
      error.stderr = 'timeout';
      throw error;
    },
  });
  const result = await adapter.execute({ operation: 'test.run', cwd: 'C:/agentos/AgentOS' });
  assert.equal(result.success, false);
  assert.equal(result.exit_code, null);
  assert.equal(result.timed_out, true);
  assert.equal(result.truncated, false);
  assert.equal(result.stdout, 'partial');
  assert.equal(result.stderr, 'timeout');
});

test('adapter max-buffer failure is explicit truncation evidence rather than success', async () => {
  const adapter = createWindowsPowerShellAdapter({
    allowedRoots: ['C:/agentos'],
    pathResolver: (input) => input,
    pathModule: path.win32,
    now: deterministicClock(3_000, 3_010),
    executor: async () => {
      const error = new Error('stdout maxBuffer length exceeded');
      error.code = 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
      error.stdout = 'bounded-partial';
      throw error;
    },
  });
  const result = await adapter.execute({ operation: 'repo.diff', cwd: 'C:/agentos/AgentOS' });
  assert.equal(result.success, false);
  assert.equal(result.exit_code, null);
  assert.equal(result.timed_out, false);
  assert.equal(result.truncated, true);
  assert.equal(result.stdout, 'bounded-partial');
});
