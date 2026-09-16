import test from 'node:test';
import assert from 'node:assert/strict';
import { executeMockComputerUse } from '../runtime/computer-use-mock-adapter.mjs';

const admittedRequest = Object.freeze({
  admitted: true,
  correlation: Object.freeze({
    project_id: 'agentos',
    mission_id: 'operator-first-wave',
    task_id: 'fixture-1',
    worker_id: 'mock-computer-worker',
  }),
  action: 'computer.observe',
  provider: 'mock',
  model: 'mock-cua',
  scope: Object.freeze({ application: 'fixture-browser', target: 'local-inert-fixture' }),
  budget: Object.freeze({ max_actions: 2, max_elapsed_ms: 100 }),
  owner_confirmation_evidence_id: null,
  text_payload_sha256: null,
});

function step(overrides = {}) {
  return {
    action: 'computer.observe',
    provider: 'mock',
    model: 'mock-cua',
    scope: { application: 'fixture-browser', target: 'local-inert-fixture' },
    elapsed_ms: 10,
    screenshot_sha256: 'a'.repeat(64),
    ...overrides,
  };
}

test('runs a deterministic mock provider loop with receipt-compatible evidence and no external dependency', () => {
  const result = executeMockComputerUse({ admittedRequest, script: [step(), step({ screenshot_sha256: 'b'.repeat(64) })] });

  assert.equal(result.success, true);
  assert.equal(result.action, 'computer.observe');
  assert.equal(result.provider, 'mock');
  assert.equal(result.model, 'mock-cua');
  assert.equal(result.actions_used, 2);
  assert.equal(result.elapsed_ms, 20);
  assert.equal(result.screenshot_sha256, 'b'.repeat(64));
  assert.deepEqual(result.transcript.map(({ sequence }) => sequence), [1, 2]);
});

test('requires an already-admitted request', () => {
  assert.throws(
    () => executeMockComputerUse({ admittedRequest: { ...admittedRequest, admitted: false }, script: [step()] }),
    (error) => error.code === 'COMPUTER_USE_MOCK_ADMISSION_REQUIRED',
  );
});

test('fails closed on provider/model or scope drift', () => {
  assert.throws(
    () => executeMockComputerUse({ admittedRequest, script: [step({ model: 'drifted-model' })] }),
    (error) => error.code === 'COMPUTER_USE_MOCK_PROVIDER_IDENTITY_MISMATCH',
  );

  assert.throws(
    () => executeMockComputerUse({ admittedRequest, script: [step({ scope: { application: 'other-browser', target: 'local-inert-fixture' } })] }),
    (error) => error.code === 'COMPUTER_USE_MOCK_SCOPE_DRIFT',
  );
});

test('fails closed when action or elapsed-time budget is exceeded', () => {
  assert.throws(
    () => executeMockComputerUse({ admittedRequest, script: [step(), step(), step()] }),
    (error) => error.code === 'COMPUTER_USE_MOCK_ACTION_BUDGET_EXCEEDED',
  );

  assert.throws(
    () => executeMockComputerUse({ admittedRequest, script: [step({ elapsed_ms: 101 })] }),
    (error) => error.code === 'COMPUTER_USE_MOCK_TIME_BUDGET_EXCEEDED',
  );
});

test('fails closed on action drift before reporting success', () => {
  assert.throws(
    () => executeMockComputerUse({ admittedRequest, script: [step({ action: 'computer.shell' })] }),
    (error) => error.code === 'COMPUTER_USE_MOCK_ACTION_DRIFT',
  );
});

test('typing is bound to the exact admitted payload commitment and owner confirmation evidence', () => {
  const typed = Object.freeze({
    ...admittedRequest,
    action: 'computer.type',
    text_payload_sha256: 'c'.repeat(64),
    owner_confirmation_evidence_id: 'owner-confirmation-1',
  });

  assert.throws(
    () => executeMockComputerUse({
      admittedRequest: typed,
      script: [step({ action: 'computer.type', text_payload_sha256: 'd'.repeat(64) })],
    }),
    (error) => error.code === 'COMPUTER_USE_MOCK_TYPED_PAYLOAD_MISMATCH',
  );

  assert.throws(
    () => executeMockComputerUse({
      admittedRequest: typed,
      script: [step({
        action: 'computer.type',
        text_payload_sha256: 'c'.repeat(64),
        owner_confirmation_evidence_id: 'wrong-confirmation',
      })],
    }),
    (error) => error.code === 'COMPUTER_USE_MOCK_OWNER_CONFIRMATION_MISMATCH',
  );

  const result = executeMockComputerUse({
    admittedRequest: typed,
    script: [step({
      action: 'computer.type',
      text_payload_sha256: 'c'.repeat(64),
      owner_confirmation_evidence_id: 'owner-confirmation-1',
    })],
  });
  assert.equal(result.success, true);
  assert.equal(result.actions_used, 1);
});
