import test from 'node:test';
import assert from 'node:assert/strict';

import { createWindowsPowerShellExecutionVerifier } from '../runtime/windows-powershell-execution-verifier.mjs';

function task(overrides = {}) {
  return {
    delivery_id: 'delivery:verify:1',
    request_id: 'request:verify:1',
    mission_id: 'mission:verify:1',
    task_id: 'task:verify:1',
    wake_trace_id: 'wake:verify:1',
    execution: { adapter: 'windows-powershell', operation: 'repo.status', cwd: 'C:/agentos/AgentOS' },
    ...overrides,
  };
}

function result(overrides = {}) {
  return {
    success: true,
    operation: 'repo.status',
    cwd: 'C:/agentos/AgentOS',
    exit_code: 0,
    timed_out: false,
    truncated: false,
    ...overrides,
  };
}

function receipt(overrides = {}) {
  return {
    status: 'AWAITING_GREEN',
    delivery_id: 'delivery:verify:1',
    request_id: 'request:verify:1',
    mission_id: 'mission:verify:1',
    task_id: 'task:verify:1',
    wake_trace_id: 'wake:verify:1',
    execution: {
      operation: 'repo.status',
      cwd: 'C:/agentos/AgentOS',
      exit_code: 0,
      timed_out: false,
      truncated: false,
    },
    ...overrides,
  };
}

test('verifies exact successful bounded execution evidence without granting assurance completion', async () => {
  const verifier = createWindowsPowerShellExecutionVerifier();
  const verification = await verifier.verify({ task: task(), result: result(), receipt: receipt() });
  assert.equal(verification.passed, true);
  assert.equal(verification.scope, 'execution-evidence-only');
  assert.equal(verification.assurance_complete, false);
  assert.equal(verification.completion_eligible, false);
  assert.deepEqual(verification.failures, []);
});

test('correlation mismatch fails verification', async () => {
  const verifier = createWindowsPowerShellExecutionVerifier();
  const verification = await verifier.verify({
    task: task(),
    result: result(),
    receipt: receipt({ task_id: 'task:borrowed' }),
  });
  assert.equal(verification.passed, false);
  assert.ok(verification.failures.includes('RECEIPT_TASK_CORRELATION_MISMATCH'));
});

test('failed timed-out or truncated process evidence never verifies', async () => {
  const verifier = createWindowsPowerShellExecutionVerifier();
  const verification = await verifier.verify({
    task: task(),
    result: result({ success: false, exit_code: null, timed_out: true, truncated: true }),
    receipt: receipt({
      execution: { operation: 'repo.status', cwd: 'C:/agentos/AgentOS', exit_code: null, timed_out: true, truncated: true },
    }),
  });
  assert.equal(verification.passed, false);
  assert.ok(verification.failures.includes('EXECUTION_RESULT_NOT_SUCCESSFUL'));
  assert.ok(verification.failures.includes('EXECUTION_EXIT_CODE_NOT_ZERO'));
  assert.ok(verification.failures.includes('EXECUTION_TIMED_OUT'));
  assert.ok(verification.failures.includes('EXECUTION_TRUNCATED'));
});

test('receipt evidence drift fails verification even when result reports success', async () => {
  const verifier = createWindowsPowerShellExecutionVerifier();
  const verification = await verifier.verify({
    task: task(),
    result: result(),
    receipt: receipt({
      execution: { operation: 'repo.status', cwd: 'C:/other', exit_code: 7, timed_out: false, truncated: false },
    }),
  });
  assert.equal(verification.passed, false);
  assert.ok(verification.failures.includes('EXECUTION_CWD_MISMATCH'));
  assert.ok(verification.failures.includes('RECEIPT_EXIT_CODE_MISMATCH'));
});

test('non-awaiting-green receipt can never verify as execution success', async () => {
  const verifier = createWindowsPowerShellExecutionVerifier();
  const verification = await verifier.verify({ task: task(), result: result(), receipt: receipt({ status: 'COMPLETED' }) });
  assert.equal(verification.passed, false);
  assert.ok(verification.failures.includes('RECEIPT_NOT_AWAITING_GREEN'));
});
