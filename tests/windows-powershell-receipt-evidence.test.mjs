import test from 'node:test';
import assert from 'node:assert/strict';
import { createWindowsPowerShellReceiptEvidence } from '../runtime/windows-powershell-receipt-evidence.mjs';

function candidate() {
  return {
    delivery_id: 'delivery-pwsh-1',
    request_id: 'request-pwsh-1',
    project_id: 'agentos-local',
  };
}

function task(overrides = {}) {
  return {
    delivery_id: 'delivery-pwsh-1',
    request_id: 'request-pwsh-1',
    mission_id: 'mission-pwsh-1',
    task_id: 'task-pwsh-1',
    wake_trace_id: 'wake-pwsh-1',
    ...overrides,
  };
}

function result(overrides = {}) {
  return {
    operation: 'repo.status',
    cwd: 'C:\\AgentOS',
    started_at: '2026-09-12T05:50:00.000Z',
    finished_at: '2026-09-12T05:50:00.100Z',
    duration_ms: 100,
    exit_code: 0,
    stdout: 'clean\n',
    stderr: '',
    timed_out: false,
    truncated: false,
    ...overrides,
  };
}

function make(overrides = {}) {
  return createWindowsPowerShellReceiptEvidence({
    candidate: candidate(),
    task: task(),
    hostId: 'host-win-1',
    workerId: 'agentos:windows-powershell-worker',
    status: 'AWAITING_GREEN',
    powerShellResult: result(),
    budgetStatus: 'RECONCILED',
    codeIdentity: '9986ba18c85516a332d3f117b522994b66c6672e',
    createdAt: '2026-09-12T05:50:01.000Z',
    ...overrides,
  });
}

test('binds exact PowerShell execution evidence to canonical remote correlation', () => {
  const receipt = make();
  assert.equal(receipt.delivery_id, 'delivery-pwsh-1');
  assert.equal(receipt.request_id, 'request-pwsh-1');
  assert.equal(receipt.mission_id, 'mission-pwsh-1');
  assert.equal(receipt.task_id, 'task-pwsh-1');
  assert.equal(receipt.wake_trace_id, 'wake-pwsh-1');
  assert.equal(receipt.host_id, 'host-win-1');
  assert.equal(receipt.worker_id, 'agentos:windows-powershell-worker');
  assert.equal(receipt.status, 'AWAITING_GREEN');
  assert.equal(receipt.execution.operation, 'repo.status');
  assert.equal(receipt.execution.exit_code, 0);
  assert.equal(receipt.execution.stdout, 'clean\n');
  assert.equal(receipt.evidence.includes('powershell:exit_code:0'), true);
  assert.equal(receipt.evidence.includes('powershell:stdout_bytes:6'), true);
});

test('PowerShell evidence binder cannot self-declare completion', () => {
  assert.throws(() => make({ status: 'COMPLETED' }), /POWERSHELL_RECEIPT_FINAL_COMPLETION_FORBIDDEN/);
});

test('delivery and request mismatch fail closed before receipt creation', () => {
  assert.throws(() => make({ task: task({ delivery_id: 'borrowed-delivery' }) }), /POWERSHELL_RECEIPT_DELIVERY_CORRELATION_MISMATCH/);
  assert.throws(() => make({ task: task({ request_id: 'borrowed-request' }) }), /POWERSHELL_RECEIPT_DELIVERY_CORRELATION_MISMATCH/);
});

test('missing mission task or wake identity fails closed', () => {
  for (const field of ['mission_id', 'task_id', 'wake_trace_id']) {
    assert.throws(() => make({ task: task({ [field]: '' }) }), /POWERSHELL_RECEIPT_TASK_CORRELATION_REQUIRED/);
  }
});

test('malformed execution evidence cannot be persisted as a PowerShell receipt', () => {
  assert.throws(() => make({ powerShellResult: result({ exit_code: '0' }) }), /exit_code must be an integer/);
  assert.throws(() => make({ powerShellResult: result({ exit_code: null }) }), /may be null only for timeout\/truncation failure evidence/);
  assert.throws(() => make({ powerShellResult: result({ stdout: null }) }), /stdout\/stderr evidence must be strings/);
  assert.throws(() => make({ powerShellResult: result({ timed_out: 'false' }) }), /timeout\/truncation evidence must be boolean/);
});

test('failed PowerShell execution remains an intermediate failed receipt with captured stderr', () => {
  const receipt = make({
    status: 'FAILED',
    powerShellResult: result({ exit_code: 1, stdout: '', stderr: 'fatal\n' }),
  });
  assert.equal(receipt.status, 'FAILED');
  assert.equal(receipt.execution.exit_code, 1);
  assert.equal(receipt.execution.stderr, 'fatal\n');
  assert.equal(receipt.evidence.includes('powershell:stderr_bytes:6'), true);
});

test('timeout with no process exit code persists durable failed receipt evidence', () => {
  const receipt = make({
    status: 'FAILED',
    powerShellResult: result({
      exit_code: null,
      stdout: 'partial\n',
      stderr: 'timed out\n',
      timed_out: true,
    }),
  });
  assert.equal(receipt.status, 'FAILED');
  assert.equal(receipt.execution.exit_code, null);
  assert.equal(receipt.execution.timed_out, true);
  assert.equal(receipt.execution.truncated, false);
  assert.equal(receipt.evidence.includes('powershell:exit_code:none'), true);
  assert.equal(receipt.evidence.includes('powershell:timed_out:true'), true);
});

test('max-buffer truncation with no process exit code persists durable blocked receipt evidence', () => {
  const receipt = make({
    status: 'BLOCKED',
    powerShellResult: result({
      exit_code: null,
      stdout: 'bounded-output',
      stderr: '',
      truncated: true,
    }),
  });
  assert.equal(receipt.status, 'BLOCKED');
  assert.equal(receipt.execution.exit_code, null);
  assert.equal(receipt.execution.timed_out, false);
  assert.equal(receipt.execution.truncated, true);
  assert.equal(receipt.evidence.includes('powershell:exit_code:none'), true);
  assert.equal(receipt.evidence.includes('powershell:truncated:true'), true);
});
