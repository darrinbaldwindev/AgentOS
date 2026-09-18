// AGENTOS-WINDOWS-WORKER-010
// Deterministic verifier implementation for the existing execution-verification gate.
// It verifies bounded PowerShell process evidence and exact receipt/task correlation only.
// It does not grant authority, complete Green/PRS assurance, schedule work, or authorize replay.

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} is required`);
  return value;
}

function requireText(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function correlationMatches(task, receipt) {
  return receipt.delivery_id === task.delivery_id &&
    receipt.request_id === task.request_id &&
    receipt.mission_id === task.mission_id &&
    receipt.task_id === task.task_id &&
    receipt.wake_trace_id === task.wake_trace_id;
}

export const WINDOWS_POWERSHELL_EXECUTION_VERIFIER_ID = 'agentos:windows-powershell-execution-verifier';

export function createWindowsPowerShellExecutionVerifier({
  id = WINDOWS_POWERSHELL_EXECUTION_VERIFIER_ID,
} = {}) {
  const verifierId = requireText(id, 'id');

  return Object.freeze({
    id: verifierId,
    capabilities: Object.freeze(['verification', 'shell.powershell.execution.verify']),

    async verify({ task, result, receipt } = {}) {
      requireObject(task, 'task');
      requireObject(result, 'result');
      requireObject(receipt, 'receipt');

      const failures = [];
      if (!correlationMatches(task, receipt)) failures.push('RECEIPT_TASK_CORRELATION_MISMATCH');
      if (receipt.status !== 'AWAITING_GREEN') failures.push('RECEIPT_NOT_AWAITING_GREEN');
      if (receipt.execution?.operation !== task.execution?.operation) failures.push('EXECUTION_OPERATION_MISMATCH');
      if (receipt.execution?.cwd !== result.cwd) failures.push('EXECUTION_CWD_MISMATCH');
      if (result.success !== true) failures.push('EXECUTION_RESULT_NOT_SUCCESSFUL');
      if (result.exit_code !== 0) failures.push('EXECUTION_EXIT_CODE_NOT_ZERO');
      if (result.timed_out !== false) failures.push('EXECUTION_TIMED_OUT');
      if (result.truncated !== false) failures.push('EXECUTION_TRUNCATED');
      if (receipt.execution?.exit_code !== result.exit_code) failures.push('RECEIPT_EXIT_CODE_MISMATCH');
      if (receipt.execution?.timed_out !== result.timed_out) failures.push('RECEIPT_TIMEOUT_MISMATCH');
      if (receipt.execution?.truncated !== result.truncated) failures.push('RECEIPT_TRUNCATION_MISMATCH');

      return Object.freeze({
        passed: failures.length === 0,
        verifier_id: verifierId,
        scope: 'execution-evidence-only',
        assurance_complete: false,
        completion_eligible: false,
        failures: Object.freeze(failures),
        evidence: Object.freeze([
          `verifier:${verifierId}`,
          `delivery:${task.delivery_id ?? 'missing'}`,
          `task:${task.task_id ?? 'missing'}`,
          `wake:${task.wake_trace_id ?? 'missing'}`,
          `operation:${task.execution?.operation ?? 'missing'}`,
        ]),
      });
    },
  });
}
