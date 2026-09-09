import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyIntegrationCapability, summarizeIntegrationHealth } from '../runtime/integration-health.mjs';

test('healthy capability is usable', () => {
  const result = classifyIntegrationCapability({
    provider: 'base44', capability: 'app.list', installed: true,
    authenticated: true, probeOk: true, evidence: ['live-app-list'],
  });
  assert.equal(result.state, 'healthy');
  assert.equal(result.usable, true);
  assert.equal(result.ownerActionRequired, false);
});

test('plan-limited capability does not make provider globally unavailable', () => {
  const appList = classifyIntegrationCapability({
    provider: 'base44', capability: 'app.list', installed: true,
    authenticated: true, probeOk: true,
  });
  const sandbox = classifyIntegrationCapability({
    provider: 'base44', capability: 'sandbox.shell', installed: true,
    authenticated: true, probeOk: true, planOk: false, evidence: ['PREMIUM_REQUIRED'],
  });
  const summary = summarizeIntegrationHealth([appList, sandbox]);
  assert.equal(appList.usable, true);
  assert.equal(sandbox.state, 'plan_limited');
  assert.equal(summary.usable, 1);
  assert.equal(summary.blocked, 1);
  assert.equal(summary.allHealthy, false);
});

test('authentication and permission failures require owner action', () => {
  const auth = classifyIntegrationCapability({
    provider: 'mail', capability: 'message.read', installed: true,
    authenticated: false, probeOk: true,
  });
  const permission = classifyIntegrationCapability({
    provider: 'calendar', capability: 'event.write', installed: true,
    authenticated: true, probeOk: true, permissionOk: false,
  });
  assert.equal(auth.state, 'auth_required');
  assert.equal(permission.state, 'permission_denied');
  assert.equal(auth.ownerActionRequired, true);
  assert.equal(permission.ownerActionRequired, true);
});

test('quota exhaustion, rate limit, stale evidence and unavailable probe fail closed', () => {
  const quota = classifyIntegrationCapability({
    provider: 'manus', capability: 'research', installed: true,
    authenticated: true, probeOk: true, quotaRemaining: 0,
  });
  const rate = classifyIntegrationCapability({
    provider: 'search', capability: 'web.search', installed: true,
    authenticated: true, probeOk: true, rateLimited: true,
  });
  const stale = classifyIntegrationCapability({
    provider: 'base44', capability: 'app.build', installed: true,
    authenticated: true, probeOk: true, stale: true,
  });
  const offline = classifyIntegrationCapability({
    provider: 'provider-x', capability: 'x.read', installed: true,
    authenticated: true, probeOk: false,
  });
  assert.equal(quota.state, 'quota_limited');
  assert.equal(rate.state, 'rate_limited');
  assert.equal(stale.state, 'stale');
  assert.equal(offline.state, 'unavailable');
  assert.equal([quota, rate, stale, offline].every((x) => x.usable === false), true);
});
