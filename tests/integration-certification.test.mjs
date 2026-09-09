import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockIntegrationAdapter, FIXTURE_OBSERVED_AT as NOW } from '../mocks/integration-mock-adapters.mjs';
import { evaluateProviderHealth } from '../policy/provider-health-policy.mjs';

// Offline contract certification. These cases do not certify live connectors.
const cases = [
  ['authentication', 'needs_connection', false, 'CONNECTION_REQUIRED'],
  ['permissions', 'permission_denied', false, 'PERMISSION_DENIED'],
  ['plan restriction', 'limited', false, 'PLAN_LIMIT'],
  ['quota', 'rate_limited', false, 'RATE_LIMITED'],
  ['degraded operation', 'degraded', true, null],
  ['network failure', 'offline', false, 'OFFLINE'],
  ['controlled failure', 'error', false, 'MOCK_ERROR'],
];
for (const [label, scenario, ok, code] of cases) {
  test(`integration certification: ${label}`, () => {
    const result = createMockIntegrationAdapter(scenario).execute('repository:read');
    const policy = evaluateProviderHealth(result.state, { now: NOW });
    assert.equal(result.ok, ok);
    assert.equal(result.error?.code ?? null, code);
    assert.equal(policy.state, scenario);
    assert.equal(policy.invokesProvider, false);
    assert.equal(policy.automaticRetry, false);
    if (scenario === 'degraded') assert.equal(policy.requiresConfirmation, true);
    if (scenario === 'rate_limited') assert.equal(policy.retryAfterSeconds, 60);
  });
}

test('stale, absent and future observations cannot certify current availability', () => {
  for (const observedAt of [undefined, NOW - 25 * 60 * 60 * 1000]) {
    const result = evaluateProviderHealth({ kind: 'available', observedAt }, { now: NOW });
    assert.equal(result.recommendation, 'do_not_assume_availability_offer_explicit_recheck_or_local_preview');
  }
  assert.throws(() => evaluateProviderHealth({ kind: 'available', observedAt: NOW + 1 }, { now: NOW }), /future/);
});

test('recovery needs a new observation; last success cannot override a present failure', () => {
  const failed = evaluateProviderHealth({ kind: 'permission_denied', observedAt: NOW, lastSuccessfulAt: NOW }, { now: NOW });
  assert.equal(failed.recommendation, 'request_owner_permission_review_without_retrying');
  const recovered = evaluateProviderHealth({ kind: 'available', observedAt: NOW + 1000 }, { now: NOW + 1000 });
  assert.equal(recovered.freshness.label, 'fresh');
  assert.equal(recovered.invokesProvider, false);
  assert.equal(failed.state, 'permission_denied');
});
