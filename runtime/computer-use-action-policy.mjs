// AGENTOS-OPERATOR-FIRST-WAVE-POLICY-001
// Pure fail-closed validation for the first-wave computer-use capability.
// This module grants no authority, invokes no provider, performs no side effect,
// and cannot set completion, Green, or PRS state.

export const FIRST_WAVE_COMPUTER_ACTIONS = Object.freeze([
  'computer.observe',
  'computer.click',
  'computer.scroll',
  'computer.type',
  'computer.wait',
]);

const ACTION_SET = new Set(FIRST_WAVE_COMPUTER_ACTIONS);

function fail(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, details);
  return error;
}

function requiredString(value, name) {
  if (typeof value !== 'string' || value.length === 0) throw fail('COMPUTER_USE_INVALID_REQUEST', { field: name });
  return value;
}

function positiveInteger(value, name) {
  if (!Number.isInteger(value) || value < 1) throw fail('COMPUTER_USE_INVALID_REQUEST', { field: name });
  return value;
}

export function validateFirstWaveComputerUseRequest({
  governedTask,
  approvedScope,
  actionBudget,
  selectedProvider,
  selectedModel,
} = {}) {
  if (!governedTask || typeof governedTask !== 'object') throw fail('COMPUTER_USE_INVALID_REQUEST', { field: 'governedTask' });

  const correlation = Object.freeze({
    project_id: requiredString(governedTask.project_id, 'governedTask.project_id'),
    mission_id: requiredString(governedTask.mission_id, 'governedTask.mission_id'),
    task_id: requiredString(governedTask.task_id, 'governedTask.task_id'),
    worker_id: requiredString(governedTask.worker_id, 'governedTask.worker_id'),
  });

  const action = requiredString(governedTask.action, 'governedTask.action');
  if (!ACTION_SET.has(action)) throw fail('COMPUTER_USE_ACTION_NOT_ALLOWED', { action });

  const provider = requiredString(governedTask.provider, 'governedTask.provider');
  const model = requiredString(governedTask.model, 'governedTask.model');
  if (provider !== requiredString(selectedProvider, 'selectedProvider') || model !== requiredString(selectedModel, 'selectedModel')) {
    throw fail('COMPUTER_USE_PROVIDER_IDENTITY_MISMATCH', { provider, model });
  }

  if (!approvedScope || typeof approvedScope !== 'object') throw fail('COMPUTER_USE_SCOPE_REQUIRED');
  const scope = Object.freeze({
    application: requiredString(approvedScope.application, 'approvedScope.application'),
    target: requiredString(approvedScope.target, 'approvedScope.target'),
  });

  if (!actionBudget || typeof actionBudget !== 'object') throw fail('COMPUTER_USE_BUDGET_REQUIRED');
  const budget = Object.freeze({
    max_actions: positiveInteger(actionBudget.max_actions, 'actionBudget.max_actions'),
    max_elapsed_ms: positiveInteger(actionBudget.max_elapsed_ms, 'actionBudget.max_elapsed_ms'),
  });

  if (action === 'computer.type') {
    requiredString(governedTask.text_payload_sha256, 'governedTask.text_payload_sha256');
    if (!/^[a-f0-9]{64}$/i.test(governedTask.text_payload_sha256)) {
      throw fail('COMPUTER_USE_INVALID_REQUEST', { field: 'governedTask.text_payload_sha256' });
    }
  }

  if (governedTask.owner_confirmation_required === true &&
      (typeof governedTask.owner_confirmation_evidence_id !== 'string' || governedTask.owner_confirmation_evidence_id.length === 0)) {
    throw fail('COMPUTER_USE_OWNER_CONFIRMATION_REQUIRED', { action });
  }

  return Object.freeze({
    admitted: true,
    correlation,
    action,
    provider,
    model,
    scope,
    budget,
    owner_confirmation_evidence_id: governedTask.owner_confirmation_evidence_id ?? null,
    text_payload_sha256: governedTask.text_payload_sha256 ?? null,
  });
}
