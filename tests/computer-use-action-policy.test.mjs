import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFirstWaveComputerUseRequest } from '../runtime/computer-use-action-policy.mjs';

const baseTask = Object.freeze({
  project_id: 'agentos',
  mission_id: 'operator-first-wave',
  task_id: 'fixture-1',
  worker_id: 'mock-computer-worker',
  action: 'computer.observe',
  provider: 'mock',
  model: 'mock-cua',
});

const scope = Object.freeze({ application: 'fixture-browser', target: 'local-inert-fixture' });
const budget = Object.freeze({ max_actions: 3, max_elapsed_ms: 5_000 });

function validate(task = baseTask, overrides = {}) {
  return validateFirstWaveComputerUseRequest({
    governedTask: task,
    approvedScope: scope,
    actionBudget: budget,
    selectedProvider: 'mock',
    selectedModel: 'mock-cua',
    ...overrides,
  });
}

test('admits an in-catalogue first-wave action with exact canonical correlation', () => {
  const result = validate();
  assert.equal(result.admitted, true);
  assert.deepEqual(result.correlation, {
    project_id: 'agentos',
    mission_id: 'operator-first-wave',
    task_id: 'fixture-1',
    worker_id: 'mock-computer-worker',
  });
  assert.equal(result.action, 'computer.observe');
});

test('fails closed on incomplete canonical correlation before any adapter exists', () => {
  assert.throws(
    () => validate({ ...baseTask, task_id: '' }),
    (error) => error.code === 'COMPUTER_USE_INVALID_REQUEST' && error.field === 'governedTask.task_id',
  );
});

test('rejects actions outside the fixed first-wave catalogue', () => {
  assert.throws(
    () => validate({ ...baseTask, action: 'computer.shell' }),
    (error) => error.code === 'COMPUTER_USE_ACTION_NOT_ALLOWED' && error.action === 'computer.shell',
  );
});

test('rejects provider or model drift from the upstream governed selection', () => {
  assert.throws(
    () => validate(baseTask, { selectedModel: 'different-model' }),
    (error) => error.code === 'COMPUTER_USE_PROVIDER_IDENTITY_MISMATCH',
  );
});

test('requires explicit application and target scope', () => {
  assert.throws(
    () => validate(baseTask, { approvedScope: { application: 'fixture-browser', target: '' } }),
    (error) => error.code === 'COMPUTER_USE_INVALID_REQUEST' && error.field === 'approvedScope.target',
  );
});

test('requires governed action and elapsed-time budgets', () => {
  assert.throws(
    () => validate(baseTask, { actionBudget: { max_actions: 0, max_elapsed_ms: 5_000 } }),
    (error) => error.code === 'COMPUTER_USE_INVALID_REQUEST' && error.field === 'actionBudget.max_actions',
  );
});

test('typing requires a sha256 payload commitment', () => {
  assert.throws(
    () => validate({ ...baseTask, action: 'computer.type' }),
    (error) => error.code === 'COMPUTER_USE_INVALID_REQUEST' && error.field === 'governedTask.text_payload_sha256',
  );

  const result = validate({
    ...baseTask,
    action: 'computer.type',
    text_payload_sha256: 'a'.repeat(64),
  });
  assert.equal(result.text_payload_sha256, 'a'.repeat(64));
});

test('owner-confirmation boundary fails closed without bound evidence', () => {
  assert.throws(
    () => validate({ ...baseTask, owner_confirmation_required: true }),
    (error) => error.code === 'COMPUTER_USE_OWNER_CONFIRMATION_REQUIRED',
  );
});
