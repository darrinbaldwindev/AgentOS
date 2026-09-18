import test from 'node:test';
import assert from 'node:assert/strict';
import { createComputerUseReceiptEvidence } from '../runtime/computer-use-receipt-evidence.mjs';

const candidate = Object.freeze({
  delivery_id: 'delivery-operator-1',
  request_id: 'request-operator-1',
  project_id: 'agentos',
});

const task = Object.freeze({
  delivery_id: candidate.delivery_id,
  request_id: candidate.request_id,
  project_id: 'agentos',
  mission_id: 'mission-operator-1',
  task_id: 'task-operator-1',
  wake_trace_id: 'wake-operator-1',
  worker_id: 'worker-operator-1',
});

const admittedRequest = Object.freeze({
  admitted: true,
  correlation: Object.freeze({
    project_id: task.project_id,
    mission_id: task.mission_id,
    task_id: task.task_id,
    worker_id: task.worker_id,
  }),
  action: 'computer.click',
  provider: 'provider-fixture',
  model: 'model-fixture',
  scope: Object.freeze({ application: 'browser', target: 'fixture.local' }),
  budget: Object.freeze({ max_actions: 3, max_elapsed_ms: 5000 }),
  owner_confirmation_evidence_id: null,
  text_payload_sha256: null,
});

const baseArgs = Object.freeze({
  candidate,
  task,
  admittedRequest,
  hostId: 'host-operator-1',
  workerId: task.worker_id,
  budgetStatus: 'WITHIN_BUDGET',
  codeIdentity: 'sha256:fixture',
  createdAt: '2026-09-14T00:00:00.000Z',
});

test('binds first-wave computer-use execution evidence to the canonical remote receipt', () => {
  const receipt = createComputerUseReceiptEvidence({
    ...baseArgs,
    result: {
      action: 'computer.click',
      provider: 'provider-fixture',
      model: 'model-fixture',
      actions_used: 1,
      elapsed_ms: 250,
      success: true,
      screenshot_sha256: 'a'.repeat(64),
    },
  });

  assert.equal(receipt.delivery_id, candidate.delivery_id);
  assert.equal(receipt.request_id, candidate.request_id);
  assert.equal(receipt.status, 'AWAITING_GREEN');
  assert.equal(receipt.execution.action, 'computer.click');
  assert.equal(receipt.execution.application, 'browser');
  assert.equal(receipt.execution.screenshot_sha256, 'a'.repeat(64));
  assert.ok(receipt.evidence.includes('computer:action:computer.click'));
  assert.ok(receipt.evidence.includes(`computer:screenshot_sha256:${'a'.repeat(64)}`));
});

test('forbids final completion from the computer-use evidence binder', () => {
  assert.throws(() => createComputerUseReceiptEvidence({
    ...baseArgs,
    status: 'COMPLETED',
    result: {
      action: 'computer.click', provider: 'provider-fixture', model: 'model-fixture', actions_used: 1, elapsed_ms: 250, success: true,
    },
  }), /COMPUTER_USE_RECEIPT_FINAL_COMPLETION_FORBIDDEN/);
});

test('fails closed when execution identity differs from admitted provider, model, or action', () => {
  assert.throws(() => createComputerUseReceiptEvidence({
    ...baseArgs,
    result: {
      action: 'computer.scroll', provider: 'provider-fixture', model: 'model-fixture', actions_used: 1, elapsed_ms: 250, success: true,
    },
  }), /COMPUTER_USE_RECEIPT_EXECUTION_IDENTITY_MISMATCH/);
});

test('fails closed when task correlation differs from the admitted request', () => {
  assert.throws(() => createComputerUseReceiptEvidence({
    ...baseArgs,
    task: { ...task, task_id: 'task-other' },
    result: {
      action: 'computer.click', provider: 'provider-fixture', model: 'model-fixture', actions_used: 1, elapsed_ms: 250, success: true,
    },
  }), /COMPUTER_USE_RECEIPT_TASK_CORRELATION_MISMATCH/);
});

test('fails closed when execution evidence exceeds the admitted action or elapsed budget', () => {
  assert.throws(() => createComputerUseReceiptEvidence({
    ...baseArgs,
    result: {
      action: 'computer.click', provider: 'provider-fixture', model: 'model-fixture', actions_used: 4, elapsed_ms: 250, success: false,
    },
  }), /COMPUTER_USE_RECEIPT_BUDGET_EXCEEDED/);

  assert.throws(() => createComputerUseReceiptEvidence({
    ...baseArgs,
    result: {
      action: 'computer.click', provider: 'provider-fixture', model: 'model-fixture', actions_used: 1, elapsed_ms: 5001, success: false,
    },
  }), /COMPUTER_USE_RECEIPT_BUDGET_EXCEEDED/);
});
