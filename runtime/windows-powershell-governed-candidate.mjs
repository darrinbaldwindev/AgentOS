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
} = {}) {
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
  });
  if (!pickup.pickup_eligible) {
    const error = new Error(`POWERSHELL_PICKUP_BLOCKED:${pickup.disposition}`);
    error.code = 'POWERSHELL_PICKUP_BLOCKED';
    error.pickup = pickup;
    throw error;
  }

  // Pickup eligibility proves only that the task/host/capability correlation is
  // suitable for this worker. The remote PowerShell gate deliberately returns
  // execution_authorized=false until runtime wiring is explicitly implemented.
  // Treat that flag as authoritative so a fail-closed runtime-disabled state can
  // never reach the governed boundary or adapter by accident.
  if (pickup.execution_authorized !== true) {
    const error = new Error(`POWERSHELL_EXECUTION_NOT_AUTHORIZED:${pickup.disposition}`);
    error.code = 'POWERSHELL_EXECUTION_NOT_AUTHORIZED';
    error.pickup = pickup;
    throw error;
  }

  // Host eligibility is evidence, not authority. Authority/consent/policy/risk/
  // budget/approval/receipt/verification remain exclusively in the existing
  // governed execution boundary below once runtime execution is explicitly wired.
  const governed = await executionBoundary.execute({
    actorContext,
    task: admittedTask,
    actualUnits: 1,
    invoke: async () => powerShellAdapter.execute({
      operation: intent.operation,
      cwd: intent.cwd,
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
