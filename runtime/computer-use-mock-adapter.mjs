// AGENTOS-OPERATOR-FIRST-WAVE-MOCK-ADAPTER-001
// Deterministic, side-effect-free mock provider loop for first-wave computer use.
// Consumes only an already-admitted request. It grants no authority, performs no
// external I/O, persists no receipt, and cannot set completion, Green, or PRS.

const FIRST_WAVE_ACTIONS = new Set([
  'computer.observe',
  'computer.click',
  'computer.scroll',
  'computer.type',
  'computer.wait',
]);

function fail(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, details);
  return error;
}

function requiredString(value, field) {
  if (typeof value !== 'string' || value.length === 0) throw fail('COMPUTER_USE_MOCK_INVALID_INPUT', { field });
  return value;
}

function nonNegativeInteger(value, field) {
  if (!Number.isInteger(value) || value < 0) throw fail('COMPUTER_USE_MOCK_INVALID_INPUT', { field });
  return value;
}

function sameScope(expected, actual) {
  return actual && actual.application === expected.application && actual.target === expected.target;
}

export function executeMockComputerUse({ admittedRequest, script } = {}) {
  if (!admittedRequest || admittedRequest.admitted !== true) {
    throw fail('COMPUTER_USE_MOCK_ADMISSION_REQUIRED');
  }
  if (!Array.isArray(script) || script.length === 0) {
    throw fail('COMPUTER_USE_MOCK_INVALID_INPUT', { field: 'script' });
  }

  const action = requiredString(admittedRequest.action, 'admittedRequest.action');
  if (!FIRST_WAVE_ACTIONS.has(action)) throw fail('COMPUTER_USE_MOCK_ACTION_NOT_ALLOWED', { action });
  const provider = requiredString(admittedRequest.provider, 'admittedRequest.provider');
  const model = requiredString(admittedRequest.model, 'admittedRequest.model');
  const scope = admittedRequest.scope;
  if (!scope || typeof scope !== 'object') throw fail('COMPUTER_USE_MOCK_INVALID_INPUT', { field: 'admittedRequest.scope' });
  requiredString(scope.application, 'admittedRequest.scope.application');
  requiredString(scope.target, 'admittedRequest.scope.target');

  const maxActions = nonNegativeInteger(admittedRequest.budget?.max_actions, 'admittedRequest.budget.max_actions');
  const maxElapsedMs = nonNegativeInteger(admittedRequest.budget?.max_elapsed_ms, 'admittedRequest.budget.max_elapsed_ms');

  let elapsedMs = 0;
  let lastScreenshotSha256 = null;
  const transcript = [];

  for (let index = 0; index < script.length; index += 1) {
    const step = script[index];
    if (!step || typeof step !== 'object') throw fail('COMPUTER_USE_MOCK_INVALID_INPUT', { field: `script[${index}]` });
    if (index + 1 > maxActions) throw fail('COMPUTER_USE_MOCK_ACTION_BUDGET_EXCEEDED', { max_actions: maxActions });

    if (step.action !== action) throw fail('COMPUTER_USE_MOCK_ACTION_DRIFT', { expected: action, actual: step.action });
    if (step.provider !== provider || step.model !== model) {
      throw fail('COMPUTER_USE_MOCK_PROVIDER_IDENTITY_MISMATCH', { provider: step.provider, model: step.model });
    }
    if (!sameScope(scope, step.scope)) throw fail('COMPUTER_USE_MOCK_SCOPE_DRIFT');

    const stepElapsedMs = nonNegativeInteger(step.elapsed_ms, `script[${index}].elapsed_ms`);
    elapsedMs += stepElapsedMs;
    if (elapsedMs > maxElapsedMs) throw fail('COMPUTER_USE_MOCK_TIME_BUDGET_EXCEEDED', { max_elapsed_ms: maxElapsedMs });

    const screenshotSha256 = step.screenshot_sha256 == null ? null : requiredString(step.screenshot_sha256, `script[${index}].screenshot_sha256`);
    if (screenshotSha256 !== null && !/^[a-f0-9]{64}$/i.test(screenshotSha256)) {
      throw fail('COMPUTER_USE_MOCK_INVALID_INPUT', { field: `script[${index}].screenshot_sha256` });
    }

    if (action === 'computer.type') {
      const payloadSha256 = requiredString(step.text_payload_sha256, `script[${index}].text_payload_sha256`);
      if (payloadSha256 !== admittedRequest.text_payload_sha256) throw fail('COMPUTER_USE_MOCK_TYPED_PAYLOAD_MISMATCH');
    }

    if (step.owner_confirmation_evidence_id != null &&
        step.owner_confirmation_evidence_id !== admittedRequest.owner_confirmation_evidence_id) {
      throw fail('COMPUTER_USE_MOCK_OWNER_CONFIRMATION_MISMATCH');
    }

    if (screenshotSha256) lastScreenshotSha256 = screenshotSha256;
    transcript.push(Object.freeze({
      sequence: index + 1,
      action,
      provider,
      model,
      scope: Object.freeze({ application: scope.application, target: scope.target }),
      elapsed_ms: stepElapsedMs,
      screenshot_sha256: screenshotSha256,
    }));
  }

  return Object.freeze({
    action,
    provider,
    model,
    actions_used: transcript.length,
    elapsed_ms: elapsedMs,
    success: true,
    screenshot_sha256: lastScreenshotSha256,
    transcript: Object.freeze(transcript),
  });
}
