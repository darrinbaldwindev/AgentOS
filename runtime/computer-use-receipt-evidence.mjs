// AGENTOS-OPERATOR-FIRST-WAVE-EVIDENCE-001
// Computer-use-specific evidence binder layered on the canonical remote execution
// receipt. It creates no second receipt authority, invokes no provider, and
// cannot declare final completion or Green/PRS assurance.

import { createRemoteExecutionReceipt } from './remote-local-bridge-contract.mjs';

const ALLOWED_INTERMEDIATE_STATUSES = new Set(['AWAITING_GREEN', 'GREEN_BLOCKED', 'FAILED', 'BLOCKED']);
const FIRST_WAVE_ACTIONS = new Set([
  'computer.observe',
  'computer.click',
  'computer.scroll',
  'computer.type',
  'computer.wait',
]);

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function nonNegativeInteger(value, name) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError(`${name} must be a non-negative integer`);
  return value;
}

export function createComputerUseReceiptEvidence({
  candidate,
  task,
  admittedRequest,
  hostId,
  workerId,
  status = 'AWAITING_GREEN',
  result,
  budgetStatus,
  codeIdentity,
  createdAt,
} = {}) {
  if (!task || typeof task !== 'object') throw new TypeError('task is required');
  if (!admittedRequest || typeof admittedRequest !== 'object') throw new TypeError('admittedRequest is required');
  if (!result || typeof result !== 'object') throw new TypeError('result is required');
  if (!ALLOWED_INTERMEDIATE_STATUSES.has(status)) throw new Error('COMPUTER_USE_RECEIPT_FINAL_COMPLETION_FORBIDDEN');

  if (task.delivery_id !== candidate?.delivery_id || task.request_id !== candidate?.request_id) {
    throw new Error('COMPUTER_USE_RECEIPT_DELIVERY_CORRELATION_MISMATCH');
  }
  for (const field of ['project_id', 'mission_id', 'task_id', 'wake_trace_id', 'worker_id']) {
    requiredString(task[field], `task.${field}`);
  }
  if (task.project_id !== admittedRequest.correlation?.project_id ||
      task.mission_id !== admittedRequest.correlation?.mission_id ||
      task.task_id !== admittedRequest.correlation?.task_id ||
      task.worker_id !== admittedRequest.correlation?.worker_id) {
    throw new Error('COMPUTER_USE_RECEIPT_TASK_CORRELATION_MISMATCH');
  }

  const action = requiredString(admittedRequest.action, 'admittedRequest.action');
  if (!FIRST_WAVE_ACTIONS.has(action)) throw new Error('COMPUTER_USE_RECEIPT_ACTION_NOT_ALLOWED');
  const provider = requiredString(admittedRequest.provider, 'admittedRequest.provider');
  const model = requiredString(admittedRequest.model, 'admittedRequest.model');
  const application = requiredString(admittedRequest.scope?.application, 'admittedRequest.scope.application');
  const target = requiredString(admittedRequest.scope?.target, 'admittedRequest.scope.target');

  const resultAction = requiredString(result.action, 'result.action');
  const resultProvider = requiredString(result.provider, 'result.provider');
  const resultModel = requiredString(result.model, 'result.model');
  if (resultAction !== action || resultProvider !== provider || resultModel !== model) {
    throw new Error('COMPUTER_USE_RECEIPT_EXECUTION_IDENTITY_MISMATCH');
  }

  const actionsUsed = nonNegativeInteger(result.actions_used, 'result.actions_used');
  const elapsedMs = nonNegativeInteger(result.elapsed_ms, 'result.elapsed_ms');
  if (!admittedRequest.budget || typeof admittedRequest.budget !== 'object') throw new TypeError('admittedRequest.budget is required');
  const maxActions = nonNegativeInteger(admittedRequest.budget.max_actions, 'admittedRequest.budget.max_actions');
  const maxElapsedMs = nonNegativeInteger(admittedRequest.budget.max_elapsed_ms, 'admittedRequest.budget.max_elapsed_ms');
  if (actionsUsed > maxActions || elapsedMs > maxElapsedMs) throw new Error('COMPUTER_USE_RECEIPT_BUDGET_EXCEEDED');

  if (typeof result.success !== 'boolean') throw new TypeError('result.success must be boolean');
  const screenshotSha256 = result.screenshot_sha256 == null ? null : requiredString(result.screenshot_sha256, 'result.screenshot_sha256');
  if (screenshotSha256 !== null && !/^[a-f0-9]{64}$/i.test(screenshotSha256)) {
    throw new TypeError('result.screenshot_sha256 must be a SHA-256 hex digest');
  }

  const evidence = [
    `computer:action:${action}`,
    `computer:provider:${provider}`,
    `computer:model:${model}`,
    `computer:application:${application}`,
    `computer:target:${target}`,
    `computer:actions_used:${actionsUsed}`,
    `computer:elapsed_ms:${elapsedMs}`,
    `computer:success:${result.success}`,
  ];
  if (admittedRequest.text_payload_sha256) evidence.push(`computer:text_payload_sha256:${requiredString(admittedRequest.text_payload_sha256, 'admittedRequest.text_payload_sha256')}`);
  if (admittedRequest.owner_confirmation_evidence_id) evidence.push(`computer:owner_confirmation:${requiredString(admittedRequest.owner_confirmation_evidence_id, 'admittedRequest.owner_confirmation_evidence_id')}`);
  if (screenshotSha256) evidence.push(`computer:screenshot_sha256:${screenshotSha256}`);

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
      action,
      provider,
      model,
      application,
      target,
      actions_used: actionsUsed,
      elapsed_ms: elapsedMs,
      success: result.success,
      screenshot_sha256: screenshotSha256,
      text_payload_sha256: admittedRequest.text_payload_sha256 ?? null,
      owner_confirmation_evidence_id: admittedRequest.owner_confirmation_evidence_id ?? null,
    }),
  });
}
