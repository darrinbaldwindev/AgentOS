// AgentOS local recovery-event schemas.
// Privacy boundary: events must never contain prompts, secrets, repository contents,
// private artifact payloads, provider credentials, or raw referral URLs.

export const RECOVERY_EVENT_TYPES = Object.freeze([
  'execution',
  'model_switch',
  'fallback_selection',
  'provider_status',
  'consent',
  'referral_click',
  'redirect_failure',
  'tool_failure',
  'recovery_action',
]);

export const SAFE_STATUS_VALUES = Object.freeze([
  'started', 'completed', 'failed', 'cancelled', 'limited', 'offline',
  'degraded', 'rate_limited', 'permission_denied', 'declined', 'recovered',
]);

const FORBIDDEN_KEYS = new Set([
  'prompt', 'messages', 'secret', 'apiKey', 'api_key', 'token', 'password',
  'credential', 'credentials', 'repositoryContent', 'repoContent', 'fileContent',
  'artifactContent', 'privateArtifact', 'rawUrl', 'referralUrl', 'authorization',
]);

function hasForbiddenKey(value) {
  if (!value || typeof value !== 'object') return false;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) return true;
    if (hasForbiddenKey(nested)) return true;
  }
  return false;
}

export function createRecoveryEvent({
  eventId,
  eventType,
  occurredAt,
  workspaceId,
  missionId = null,
  runId = null,
  providerId = null,
  modelId = null,
  status,
  correlationId,
  diagnosticCode,
  metadata = {},
}) {
  if (!eventId || !eventType || !occurredAt || !workspaceId || !correlationId || !diagnosticCode) {
    throw new TypeError('eventId, eventType, occurredAt, workspaceId, correlationId and diagnosticCode are required');
  }
  if (!RECOVERY_EVENT_TYPES.includes(eventType)) throw new TypeError(`Unsupported eventType: ${eventType}`);
  if (!SAFE_STATUS_VALUES.includes(status)) throw new TypeError(`Unsupported status: ${status}`);
  if (hasForbiddenKey(metadata)) throw new TypeError('metadata contains a prohibited private/secret field');

  return Object.freeze({
    schemaVersion: 1,
    eventId,
    eventType,
    occurredAt,
    workspaceId,
    missionId,
    runId,
    providerId,
    modelId,
    status,
    correlationId,
    diagnosticCode,
    metadata: Object.freeze({ ...metadata }),
  });
}

export function validateRecoveryEvent(event) {
  if (!event || typeof event !== 'object') return { valid: false, reason: 'event must be an object' };
  if (event.schemaVersion !== 1) return { valid: false, reason: 'unsupported schemaVersion' };
  if (!RECOVERY_EVENT_TYPES.includes(event.eventType)) return { valid: false, reason: 'invalid eventType' };
  if (!SAFE_STATUS_VALUES.includes(event.status)) return { valid: false, reason: 'invalid status' };
  if (hasForbiddenKey(event)) return { valid: false, reason: 'prohibited private/secret field detected' };
  return { valid: true };
}

export const privacyBoundary = Object.freeze({
  excluded: [
    'prompts', 'conversation messages', 'secrets', 'credentials', 'API keys',
    'repository contents', 'private artifact payloads', 'raw referral URLs',
  ],
  allowedExamples: [
    'opaque identifiers', 'provider/model identifiers', 'status values',
    'diagnostic codes', 'timestamps', 'capability labels', 'retry counts',
  ],
});
