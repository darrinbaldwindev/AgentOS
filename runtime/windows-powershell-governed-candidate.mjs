// AGENTOS-WINDOWS-WORKER-006
// Composition seam only. Binds an already-admitted remote task to the bounded
// PowerShell adapter through the existing governed execution boundary.
// This module is intentionally NOT connected to local-wake or the scheduler.

import { evaluateWindowsPowerShellRemotePickup } from './windows-powershell-remote-gate.mjs';

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function executionIdentity(task) {
  if (!task || typeof task !== 'object' || Array.isArray(task)) throw new TypeError('admittedTask is required');
  return Object.freeze({
    delivery_id: requiredString(task.delivery_id, 'admittedTask.delivery_id'),
    request_id: requiredString(task.request_id, 'admittedTask.request_id'),
    mission_id: requiredString(task.mission_id, 'admittedTask.mission_id'),
    task_id: requiredString(task.task_id, 'admittedTask.task_id'),
    wake_trace_id: requiredString(task.wake_trace_id, 'admittedTask.wake_trace_id'),
  });
}

function executionIntent(task) {
  const execution = task?.execution;
  if (!execution || typeof execution !== 'object' || Array.isArray(execution)) {
    throw new Error('POWERSHELL_EXECUTION_INTENT_REQUIRED');
  }
  if (execution.adapter !== 'windows-powershell') {
    throw new Error('POWERSHELL_EXECUTION_ADAPTER_MISMATCH');
  }
  return Object.freeze({
    operation: requiredString(execution.operation, 'task.execution.operation'),
    cwd: requiredString(execution.cwd, 'task.execution.cwd'),
  });
}

export async function executeWindowsPowerShellGovernedCandidate({
  admittedTask,
  actorContext,
  hostIdentity,
  workspaceRoot,
  hostProbe,
  powerShellAdapter,
  executionBoundary,
  runtimeExecutionEnabled = false,
} = {}) {
  if (typeof runtimeExecutionEnabled !== 'boolean') throw new TypeError('runtimeExecutionEnabled must be boolean');
  if (!powerShellAdapter || typeof powerShellAdapter.describe !== 'function' || typeof powerShellAdapter.execute !== 'function') {
    throw new TypeError('powerShellAdapter describe/execute methods are required');
  }
  if (!executionBoundary || typeof executionBoundary.execute !== 'function') {
    throw new TypeError('executionBoundary.execute is required');
  }
  if (!hostIdentity || typeof hostIdentity !== 'object') throw new TypeError('hostIdentity is required');
  const hostId = requiredString(hostIdentity.host_id, 'hostIdentity.host_id');

  const identity = executionIdentity(admittedTask);
  const intent = executionIntent(admittedTask);
  const descriptor = powerShellAdapter.describe(intent.operation);
  const required = admittedTask?.required_capabilities ?? [];
  if (!Array.isArray(required) || !required.includes(descriptor.capability)) {
    throw new Error('POWERSHELL_EXECUTION_CAPABILITY_MISMATCH');
  }

  const pickup = await evaluateWindowsPowerShellRemotePickup({
    admittedTask,
    hostIdentity,
    workspaceRoot,
    hostProbe,
    runtimeExecutionEnabled,
  });
  if (!pickup.pickup_eligible) {
    const error = new Error(`POWERSHELL_PICKUP_BLOCKED:${pickup.disposition}`);
    error.code = 'POWERSHELL_PICKUP_BLOCKED';
    error.pickup = pickup;
    throw error;
  }

  // Pickup eligibility is not execution authority. The explicit runtime flag is
  // default-false and must combine with canonical eligibility before this seam
  // may reach the governed boundary. local-wake/scheduler do not set it yet.
  if (pickup.execution_authorized !== true) {
    const error = new Error(`POWERSHELL_EXECUTION_NOT_AUTHORIZED:${pickup.disposition}`);
    error.code = 'POWERSHELL_EXECUTION_NOT_AUTHORIZED';
    error.pickup = pickup;
    throw error;
  }

  const expectedExecutables = pickup.host_capability_evidence?.evaluation?.tool_evidence;
  if (!expectedExecutables || typeof expectedExecutables !== 'object') {
    const error = new Error('POWERSHELL_EXECUTABLE_IDENTITY_EVIDENCE_REQUIRED');
    error.code = 'POWERSHELL_EXECUTABLE_IDENTITY_EVIDENCE_REQUIRED';
    error.pickup = pickup;
    throw error;
  }

  const governed = await executionBoundary.execute({
    actorContext,
    task: admittedTask,
    actualUnits: 1,
    invoke: async () => powerShellAdapter.execute({
      operation: intent.operation,
      cwd: intent.cwd,
      expectedExecutables,
    }),
  });

  return Object.freeze({
    status: governed.status,
    ...identity,
    host_id: hostId,
    intent,
    pickup,
    governed,
  });
}
