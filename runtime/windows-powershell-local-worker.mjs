// AGENTOS-WINDOWS-WORKER-007
// Composition-only adapter from the governed PowerShell candidate to the existing
// canonical worker contract. This module owns no authority, persistence, budget,
// approval, receipt, scheduler, Green, or PRS semantics.

import { executeWorker } from '../src/workers/worker-contract.mjs';
import { executeWindowsPowerShellGovernedCandidate } from './windows-powershell-governed-candidate.mjs';

export const WINDOWS_POWERSHELL_WORKER_ID = 'agentos:windows-powershell-worker';

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function requireMethod(target, method, label) {
  if (!target || typeof target[method] !== 'function') throw new TypeError(`${label}.${method} is required`);
}

function deriveCapabilities(powerShellAdapter) {
  if (!Array.isArray(powerShellAdapter.operations) || powerShellAdapter.operations.length === 0) {
    throw new TypeError('powerShellAdapter.operations must be a non-empty array');
  }
  const capabilities = new Set();
  for (const operation of powerShellAdapter.operations) {
    const descriptor = powerShellAdapter.describe(operation);
    capabilities.add(requiredString(descriptor?.capability, `powerShellAdapter.describe(${operation}).capability`));
  }
  return Object.freeze([...capabilities].sort());
}

export function createWindowsPowerShellLocalWorker({
  hostIdentity,
  workspaceRoot,
  hostProbe,
  powerShellAdapter,
  executionBoundary,
  runtimeExecutionEnabled = false,
} = {}) {
  if (!hostIdentity || typeof hostIdentity !== 'object') throw new TypeError('hostIdentity is required');
  requiredString(hostIdentity.host_id, 'hostIdentity.host_id');
  requiredString(workspaceRoot, 'workspaceRoot');
  requireMethod(hostProbe, 'probe', 'hostProbe');
  requireMethod(powerShellAdapter, 'describe', 'powerShellAdapter');
  requireMethod(powerShellAdapter, 'execute', 'powerShellAdapter');
  requireMethod(executionBoundary, 'execute', 'executionBoundary');
  if (typeof runtimeExecutionEnabled !== 'boolean') throw new TypeError('runtimeExecutionEnabled must be boolean');

  const capabilities = deriveCapabilities(powerShellAdapter);
  const worker = Object.freeze({
    id: WINDOWS_POWERSHELL_WORKER_ID,
    capabilities,
    execute: async (task) => {
      const actorContext = Object.freeze({ actor_id: requiredString(task?.actor_id, 'task.actor_id') });
      const governed = await executeWindowsPowerShellGovernedCandidate({
        admittedTask: task,
        actorContext,
        hostIdentity,
        workspaceRoot,
        hostProbe,
        powerShellAdapter,
        executionBoundary,
        runtimeExecutionEnabled,
      });
      if (governed.status !== 'VERIFIED' || governed.governed?.status !== 'VERIFIED') {
        throw new Error('POWERSHELL_GOVERNED_RESULT_NOT_VERIFIED');
      }
      return Object.freeze({
        action: 'bounded-windows-powershell',
        status: 'VERIFIED',
        task_id: governed.task_id,
        mission_id: governed.mission_id,
        delivery_id: governed.delivery_id,
        request_id: governed.request_id,
        wake_trace_id: governed.wake_trace_id,
        host_id: governed.host_id,
        operation: governed.intent.operation,
        cwd: governed.intent.cwd,
        pickup_disposition: governed.pickup.disposition,
        governed: governed.governed,
      });
    },
  });

  return Object.freeze({
    worker,
    execute: (task) => executeWorker(worker, task),
  });
}
