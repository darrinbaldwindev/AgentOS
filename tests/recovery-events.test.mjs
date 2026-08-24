import assert from 'node:assert/strict';
import { createRecoveryEvent, validateRecoveryEvent, RECOVERY_EVENT_TYPES, SAFE_STATUS_VALUES, privacyBoundary } from '../schemas/recovery-events.mjs';

const base = {
  eventId: 'evt-001',
  eventType: 'model_switch',
  occurredAt: '2026-08-24T00:00:00.000Z',
  workspaceId: 'ws-001',
  missionId: 'mission-001',
  runId: 'run-001',
  providerId: 'provider-a',
  modelId: 'model-a',
  status: 'completed',
  correlationId: 'corr-001',
  diagnosticCode: 'MODEL_SWITCH_COMPLETED',
};

assert.equal(RECOVERY_EVENT_TYPES.length, 9);
assert.deepEqual(SAFE_STATUS_VALUES, [
  'started', 'completed', 'failed', 'cancelled', 'limited', 'offline',
  'degraded', 'rate_limited', 'permission_denied', 'declined', 'recovered',
]);
assert.equal(SAFE_STATUS_VALUES.includes('recovered'), true);

const event = createRecoveryEvent({ ...base, metadata: { reason: 'provider_limit', retryCount: 0 } });
assert.equal(validateRecoveryEvent(event).valid, true);
assert.equal(event.schemaVersion, 1);
assert.equal(Object.isFrozen(event), true);

for (const eventType of RECOVERY_EVENT_TYPES) {
  const candidate = createRecoveryEvent({ ...base, eventId: `evt-${eventType}`, eventType });
  assert.equal(candidate.eventType, eventType);
  assert.equal(validateRecoveryEvent(candidate).valid, true);
}

for (const forbidden of ['prompt', 'apiKey', 'token', 'password', 'repositoryContent', 'artifactContent', 'rawUrl']) {
  assert.throws(
    () => createRecoveryEvent({ ...base, metadata: { [forbidden]: 'blocked' } }),
    /prohibited private\/secret field/
  );
}

assert.equal(validateRecoveryEvent({ ...event, prompt: 'blocked' }).valid, false);
assert.equal(validateRecoveryEvent({ ...event, schemaVersion: 99 }).valid, false);
assert.equal(validateRecoveryEvent({ ...event, eventType: 'unknown' }).valid, false);
assert.equal(validateRecoveryEvent({ ...event, status: 'unknown' }).valid, false);
assert.deepEqual(privacyBoundary.excluded, [
  'prompts', 'conversation messages', 'secrets', 'credentials', 'API keys',
  'repository contents', 'private artifact payloads', 'raw referral URLs',
]);

console.log('recovery event schema tests passed');
