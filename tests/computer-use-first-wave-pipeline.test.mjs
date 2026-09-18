import test from 'node:test';
import assert from 'node:assert/strict';
import { executeMockComputerUsePipeline } from '../runtime/computer-use-first-wave-pipeline.mjs';

const candidate = Object.freeze({
  delivery_id: 'delivery-operator-pipeline-1',
  request_id: 'request-operator-pipeline-1',
  project_id: 'agentos',
});

const task = Object.freeze({
  delivery_id: candidate.delivery_id,
  request_id: candidate.request_id,
  project_id: 'agentos',
  mission_id: 'mission-operator-pipeline-1',
  task_id: 'task-operator-pipeline-1',
  wake_trace_id: 'wake-operator-pipeline-1',
  worker_id: 'worker-operator-pipeline-1',
});

const governedTask = Object.freeze({
  project_id: task.project_id,
  mission_id: task.mission_id,
  task_id: task.task_id,
  worker_id: task.worker_id,
  action: 'computer.click',
  provider: 'provider-fixture',
  model: 'model-fixture',
});

const approvedScope = Object.freeze({ application: 'browser', target: 'fixture.local' });
const actionBudget = Object.freeze({ max_actions: 2, max_elapsed_ms: 1000 });
const script = Object.freeze([Object.freeze({
  action: 'computer.click',
  provider: 'provider-fixture',
  model: 'model-fixture',
  scope: approvedScope,
  elapsed_ms: 25,
  screenshot_sha256: 'a'.repeat(64),
})]);

function persistenceHarness({ failCreate = false } = {}) {
  const artifacts = new Map();
  let createCalls = 0;
  return {
    get createCalls() { return createCalls; },
    async create(type, input) {
      createCalls += 1;
      assert.equal(type, 'artifact');
      if (failCreate) throw new Error('fixture persistence failure');
      if (artifacts.has(input.id)) throw new Error('duplicate');
      const entity = structuredClone(input);
      artifacts.set(input.id, entity);
      return structuredClone(entity);
    },
    async list(type) {
      assert.equal(type, 'artifact');
      return [...artifacts.values()].map((value) => structuredClone(value));
    },
  };
}

function baseArgs(persistence) {
  return {
    governedTask,
    approvedScope,
    actionBudget,
    selectedProvider: governedTask.provider,
    selectedModel: governedTask.model,
    script,
    candidate,
    task,
    hostId: 'host-operator-pipeline-1',
    workerId: task.worker_id,
    budgetStatus: 'WITHIN_BUDGET',
    codeIdentity: 'sha256:fixture',
    createdAt: '2026-09-14T00:00:00.000Z',
    persistence,
  };
}

test('composes admitted mock execution into canonical persisted receipt without final completion', async () => {
  const persistence = persistenceHarness();
  const outcome = await executeMockComputerUsePipeline(baseArgs(persistence));

  assert.equal(outcome.status, 'AWAITING_GREEN');
  assert.equal(outcome.result.success, true);
  assert.equal(outcome.receipt.status, 'AWAITING_GREEN');
  assert.equal(outcome.persistedReceiptArtifact.artifactType, 'remote.execution.receipt');
  assert.equal(outcome.persistedReceiptArtifact.payload.execution.action, 'computer.click');
  assert.equal(persistence.createCalls, 1);
});

test('fails policy validation before any receipt persistence', async () => {
  const persistence = persistenceHarness();
  await assert.rejects(
    executeMockComputerUsePipeline({
      ...baseArgs(persistence),
      governedTask: { ...governedTask, action: 'computer.shell' },
    }),
    /COMPUTER_USE_ACTION_NOT_ALLOWED/,
  );
  assert.equal(persistence.createCalls, 0);
});

test('receipt persistence failure cannot return a false-success outcome', async () => {
  const persistence = persistenceHarness({ failCreate: true });
  await assert.rejects(
    executeMockComputerUsePipeline(baseArgs(persistence)),
    (error) => error?.code === 'COMPUTER_USE_RECEIPT_PERSISTENCE_FAILED' && /COMPUTER_USE_RECEIPT_PERSISTENCE_FAILED/.test(error.message),
  );
  assert.equal(persistence.createCalls, 1);
});
