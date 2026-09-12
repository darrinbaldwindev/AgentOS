// AGENTOS-WINDOWS-WORKER-005
// PowerShell-specific evidence binder layered on the canonical remote execution
// receipt. It creates no second receipt authority and cannot declare COMPLETED.

import { createRemoteExecutionReceipt } from './remote-local-bridge-contract.mjs';

const ALLOWED_INTERMEDIATE_STATUSES = new Set(['AWAITING_GREEN', 'GREEN_BLOCKED', 'FAILED', 'BLOCKED']);

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function integer(value, name) {
  if (!Number.isInteger(value)) throw new TypeError(`${name} must be an integer`);
  return value;
}

function executionExitCode(powerShellResult) {
  if (powerShellResult.exit_code === null) {
    if (powerShellResult.timed_out === true || powerShellResult.truncated === true) return null;
    throw new TypeError('powerShellResult.exit_code may be null only for timeout/truncation failure evidence');
  }
  return integer(powerShellResult.exit_code, 'powerShellResult.exit_code');
}

function executableEvidence(powerShellResult) {
  const input = powerShellResult?.resolved_executables;
  if (input == null) return Object.freeze({});
  if (typeof input !== 'object' || Array.isArray(input)) throw new TypeError('powerShellResult.resolved_executables must be an object');
  const normalized = {};
  for (const name of Object.keys(input).sort()) {
    const entry = input[name];
    if (!entry || typeof entry !== 'object') throw new TypeError(`resolved executable ${name} must be an object`);
    const executablePath = requiredString(entry.path, `resolved executable ${name}.path`);
    const version = entry.version == null ? null : requiredString(entry.version, `resolved executable ${name}.version`);
    normalized[name] = Object.freeze({ path: executablePath, version });
  }
  return Object.freeze(normalized);
}

export function createWindowsPowerShellReceiptEvidence({
  candidate,
  task,
  hostId,
  workerId,
  status = 'AWAITING_GREEN',
  powerShellResult,
  budgetStatus,
  codeIdentity,
  createdAt,
} = {}) {
  if (!task || typeof task !== 'object') throw new TypeError('task is required');
  if (!powerShellResult || typeof powerShellResult !== 'object') throw new TypeError('powerShellResult is required');
  if (!ALLOWED_INTERMEDIATE_STATUSES.has(status)) {
    throw new Error('POWERSHELL_RECEIPT_FINAL_COMPLETION_FORBIDDEN');
  }

  const operation = requiredString(powerShellResult.operation, 'powerShellResult.operation');
  const cwd = requiredString(powerShellResult.cwd, 'powerShellResult.cwd');
  const startedAt = requiredString(powerShellResult.started_at, 'powerShellResult.started_at');
  const finishedAt = requiredString(powerShellResult.finished_at, 'powerShellResult.finished_at');
  integer(powerShellResult.duration_ms, 'powerShellResult.duration_ms');
  if (typeof powerShellResult.stdout !== 'string' || typeof powerShellResult.stderr !== 'string') {
    throw new TypeError('PowerShell stdout/stderr evidence must be strings');
  }
  if (typeof powerShellResult.timed_out !== 'boolean' || typeof powerShellResult.truncated !== 'boolean') {
    throw new TypeError('PowerShell timeout/truncation evidence must be boolean');
  }
  const exitCode = executionExitCode(powerShellResult);
  const resolvedExecutables = executableEvidence(powerShellResult);

  if (task.delivery_id !== candidate?.delivery_id || task.request_id !== candidate?.request_id) {
    throw new Error('POWERSHELL_RECEIPT_DELIVERY_CORRELATION_MISMATCH');
  }
  if (!task.mission_id || !task.task_id || !task.wake_trace_id) {
    throw new Error('POWERSHELL_RECEIPT_TASK_CORRELATION_REQUIRED');
  }

  const evidence = [
    `powershell:operation:${operation}`,
    `powershell:cwd:${cwd}`,
    `powershell:exit_code:${exitCode === null ? 'none' : exitCode}`,
    `powershell:started_at:${startedAt}`,
    `powershell:finished_at:${finishedAt}`,
    `powershell:duration_ms:${powerShellResult.duration_ms}`,
    `powershell:timed_out:${powerShellResult.timed_out}`,
    `powershell:truncated:${powerShellResult.truncated}`,
    `powershell:stdout_bytes:${Buffer.byteLength(powerShellResult.stdout, 'utf8')}`,
    `powershell:stderr_bytes:${Buffer.byteLength(powerShellResult.stderr, 'utf8')}`,
  ];
  for (const [name, entry] of Object.entries(resolvedExecutables)) {
    evidence.push(`powershell:executable:${name}:path:${entry.path}`);
    evidence.push(`powershell:executable:${name}:version:${entry.version ?? 'unknown'}`);
  }

  const receipt = createRemoteExecutionReceipt({
    candidate,
    missionId: task.mission_id,
    taskId: task.task_id,
    wakeTraceId: task.wake_trace_id,
    hostId,
    workerId,
    status,
    evidence,
    budgetStatus,
    codeIdentity,
    createdAt,
  });

  return Object.freeze({
    ...receipt,
    execution: Object.freeze({
      operation,
      cwd,
      exit_code: exitCode,
      started_at: startedAt,
      finished_at: finishedAt,
      duration_ms: powerShellResult.duration_ms,
      timed_out: powerShellResult.timed_out,
      truncated: powerShellResult.truncated,
      stdout: powerShellResult.stdout,
      stderr: powerShellResult.stderr,
      resolved_executables: resolvedExecutables,
    }),
  });
}
