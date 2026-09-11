// V1 visibility: observational host status only.
// This module derives status from existing durable AgentOS evidence. It does not
// mutate state, wake the host, grant authority, clear locks, retry work, or promote assurance.

const ACTIVE_TASK_STATES = new Set(['running', 'executing', 'in_flight', 'working']);
const BLOCKED_TASK_STATES = new Set(['blocked', 'green_blocked']);
const RECOVERY_STATES = new Set(['recovery_required']);

function asTime(value) {
  const time = typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? time : null;
}

function newestTimestamp(records = []) {
  let newest = null;
  for (const record of records) {
    const payload = record?.payload ?? record ?? {};
    for (const candidate of [record?.updatedAt, record?.createdAt, payload.updated_at, payload.created_at,
      payload.observed_at, payload.started_at, payload.completed_at, payload.claimed_at]) {
      const time = asTime(candidate);
      if (time !== null && (newest === null || time > newest)) newest = time;
    }
  }
  return newest;
}

function normalizedState(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function payloadOf(record) {
  return record?.payload ?? record ?? {};
}

function exactHostMatch(record, hostId) {
  const payload = payloadOf(record);
  return !payload.host_id || payload.host_id === hostId;
}

function correlation(record) {
  const payload = payloadOf(record);
  return {
    task_id: payload.task_id ?? null,
    mission_id: payload.mission_id ?? null,
    wake_trace_id: payload.wake_trace_id ?? null,
  };
}

function correlationValues(record) {
  const payload = payloadOf(record);
  return [payload.task_id, payload.mission_id, payload.wake_trace_id, payload.delivery_id].filter(Boolean);
}

function hasAnyState(record, states) {
  const payload = payloadOf(record);
  return states.has(normalizedState(payload.status)) || states.has(normalizedState(payload.pickup_state));
}

function newestFirst(records = []) {
  return [...records].sort((a, b) => (newestTimestamp([b]) ?? 0) - (newestTimestamp([a]) ?? 0));
}

function isFreshTimestamp(value, now, staleAfterMs) {
  const time = asTime(value);
  return time !== null && time <= now && now - time <= staleAfterMs;
}

function conflictingHostEvidence(records, hostId) {
  const local = records.filter((record) => payloadOf(record).host_id === hostId);
  const foreign = records.filter((record) => payloadOf(record).host_id && payloadOf(record).host_id !== hostId);
  const localIds = new Set(local.flatMap(correlationValues));
  return foreign.some((record) => correlationValues(record).some((value) => localIds.has(value)));
}

function conflictingClaimEvidence(records, claims, hostId) {
  const localIds = new Set(records
    .filter((record) => exactHostMatch(record, hostId))
    .flatMap(correlationValues));
  return claims.some((claim) => {
    const payload = payloadOf(claim);
    return payload.host_id && payload.host_id !== hostId &&
      correlationValues(claim).some((value) => localIds.has(value));
  });
}

function completedResult(hostArtifacts, hostId) {
  const receipts = newestFirst(hostArtifacts
    .filter((record) => record?.artifactType === 'remote.execution.receipt')
    .filter((record) => normalizedState(payloadOf(record).status) === 'completed'));
  if (!receipts.length) return { lastResult: null, assurance: { green: 'unknown', prs: 'unknown' } };

  const record = receipts[0];
  const receipt = payloadOf(record);
  const receiptCorrelation = correlation(record);
  const completeCorrelation = Object.values(receiptCorrelation).every(Boolean);
  const identityComplete = receipt.host_id === hostId && typeof receipt.code_identity === 'string' && receipt.code_identity.trim();
  if (!completeCorrelation || !identityComplete) {
    return { lastResult: null, assurance: { green: 'unknown', prs: 'unknown' } };
  }

  return {
    lastResult: {
      ...receiptCorrelation,
      receipt_id: record.id ?? null,
      completed_at: receipt.completed_at ?? record.updatedAt ?? record.createdAt ?? null,
      code_identity: receipt.code_identity,
    },
    assurance: {
      green: receipt.green_disposition ?? 'unknown',
      prs: receipt.prs_disposition ?? 'unknown',
    },
  };
}

export function deriveLocalHostStatus({
  hostIdentity,
  config,
  artifacts = [],
  events = [],
  claims = [],
  locks = [],
  observedAt = new Date().toISOString(),
  staleAfterMs = 15 * 60 * 1000,
} = {}) {
  if (!hostIdentity?.host_id) throw new TypeError('hostIdentity.host_id is required');
  if (!Number.isFinite(staleAfterMs) || staleAfterMs <= 0) throw new TypeError('staleAfterMs must be positive');
  const now = asTime(observedAt);
  if (now === null) throw new TypeError('observedAt must be an ISO timestamp');

  const hostId = hostIdentity.host_id;
  const allDurable = [...artifacts, ...events];
  if (conflictingClaimEvidence(allDurable, claims, hostId)) {
    return Object.freeze({
      schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: hostIdentity.last_seen ?? null,
      lifecycle_state: 'blocked', reason: 'CLAIM_CORRELATION_CONFLICT', evidence_freshness: 'conflicting',
      scheduler_enabled: config?.scheduler?.enabled === true, current: null, last_result: null,
      assurance: { green: 'unknown', prs: 'unknown' },
    });
  }
  if (conflictingHostEvidence(allDurable, hostId)) {
    return Object.freeze({
      schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: hostIdentity.last_seen ?? null,
      lifecycle_state: 'blocked', reason: 'HOST_IDENTITY_CONFLICT', evidence_freshness: 'conflicting',
      scheduler_enabled: config?.scheduler?.enabled === true, current: null, last_result: null,
      assurance: { green: 'unknown', prs: 'unknown' },
    });
  }

  const hostArtifacts = artifacts.filter((record) => exactHostMatch(record, hostId));
  const hostEvents = events.filter((record) => exactHostMatch(record, hostId));
  const hostClaims = claims.filter((record) => payloadOf(record).host_id === hostId);
  const { lastResult, assurance } = completedResult(hostArtifacts, hostId);

  const operationalEvidence = [...hostArtifacts.filter((record) => record?.artifactType !== 'remote.execution.receipt'), ...hostEvents, ...hostClaims];
  const latestOperationalTime = newestTimestamp(operationalEvidence);
  const explicitLastSeen = asTime(hostIdentity.last_seen);
  const latestSeen = [latestOperationalTime, explicitLastSeen].filter((value) => value !== null).sort((a, b) => b - a)[0] ?? null;
  const stale = latestSeen === null || latestSeen > now || now - latestSeen > staleAfterMs;

  const recoveryLock = locks.find((lock) => {
    const state = normalizedState(lock?.state ?? lock?.status);
    return RECOVERY_STATES.has(state) || lock?.uncertain === true || lock?.retained === true;
  });
  if (recoveryLock) {
    return Object.freeze({
      schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: latestSeen === null ? null : new Date(latestSeen).toISOString(),
      lifecycle_state: 'recovery_required', reason: recoveryLock.reason ?? 'RETAINED_OR_UNCERTAIN_LOCK',
      evidence_freshness: stale ? 'stale' : 'fresh', scheduler_enabled: config?.scheduler?.enabled === true,
      current: null, last_result: lastResult, assurance,
    });
  }

  const taskArtifacts = hostArtifacts.filter((record) => record?.artifactType === 'dispatch.task');
  const blockedTasks = newestFirst(taskArtifacts.filter((record) => hasAnyState(record, BLOCKED_TASK_STATES)));
  if (blockedTasks.length) {
    const blockedTask = blockedTasks[0];
    return Object.freeze({
      schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: latestSeen === null ? null : new Date(latestSeen).toISOString(),
      lifecycle_state: 'blocked', reason: payloadOf(blockedTask).pickup_blocker ?? payloadOf(blockedTask).reason ?? 'TASK_BLOCKED',
      evidence_freshness: stale ? 'stale' : 'fresh', scheduler_enabled: config?.scheduler?.enabled === true,
      current: correlation(blockedTask), last_result: lastResult, assurance,
    });
  }

  const activeByTaskState = taskArtifacts.filter((record) => hasAnyState(record, ACTIVE_TASK_STATES));
  const activeByClaim = taskArtifacts.filter((task) => {
    const payload = payloadOf(task);
    if (normalizedState(payload.status) !== 'queued' || !payload.delivery_id) return false;
    return hostClaims.some((claim) => {
      const claimPayload = payloadOf(claim);
      return claimPayload.delivery_id === payload.delivery_id && normalizedState(claimPayload.state) === 'claimed' &&
        isFreshTimestamp(claimPayload.claimed_at, now, staleAfterMs);
    });
  });
  const activeTasks = [...new Map([...activeByTaskState, ...activeByClaim].map((record) => [record.id ?? payloadOf(record).task_id, record])).values()];

  if (activeTasks.length > 1) {
    return Object.freeze({
      schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: latestSeen === null ? null : new Date(latestSeen).toISOString(),
      lifecycle_state: 'blocked', reason: 'MULTIPLE_ACTIVE_TASKS', evidence_freshness: stale ? 'stale' : 'fresh',
      scheduler_enabled: config?.scheduler?.enabled === true, current: null, last_result: lastResult, assurance,
    });
  }

  if (activeTasks.length === 1) {
    const current = correlation(activeTasks[0]);
    if (!current.task_id || !current.mission_id || !current.wake_trace_id) {
      return Object.freeze({
        schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: latestSeen === null ? null : new Date(latestSeen).toISOString(),
        lifecycle_state: 'blocked', reason: 'ACTIVE_TASK_CORRELATION_INCOMPLETE', evidence_freshness: stale ? 'stale' : 'fresh',
        scheduler_enabled: config?.scheduler?.enabled === true, current: null, last_result: lastResult, assurance,
      });
    }
    return Object.freeze({
      schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: latestSeen === null ? null : new Date(latestSeen).toISOString(),
      lifecycle_state: 'working', reason: 'CORRELATED_IN_FLIGHT_TASK', evidence_freshness: 'fresh',
      scheduler_enabled: config?.scheduler?.enabled === true, current, last_result: lastResult, assurance,
    });
  }

  if (stale) {
    return Object.freeze({
      schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: latestSeen === null ? null : new Date(latestSeen).toISOString(),
      lifecycle_state: 'offline_or_stale', reason: latestSeen === null ? 'NO_CURRENT_DURABLE_EVIDENCE' : 'EVIDENCE_STALE',
      evidence_freshness: latestSeen === null ? 'unknown' : 'stale', scheduler_enabled: config?.scheduler?.enabled === true,
      current: null, last_result: lastResult, assurance,
    });
  }

  return Object.freeze({
    schema_version: 1, host_id: hostId, observed_at: observedAt, last_seen: new Date(latestSeen).toISOString(),
    lifecycle_state: 'idle', reason: 'FRESH_HOST_EVIDENCE_WITH_NO_ACTIVE_TASK', evidence_freshness: 'fresh',
    scheduler_enabled: config?.scheduler?.enabled === true, current: null, last_result: lastResult, assurance,
  });
}

export async function readLocalHostStatus({ persistence, hostIdentity, config, claims = [], locks = [], observedAt, staleAfterMs } = {}) {
  if (!persistence?.list) throw new TypeError('persistence.list is required');
  const [artifacts, events] = await Promise.all([persistence.list('artifact'), persistence.list('event')]);
  return deriveLocalHostStatus({ hostIdentity, config, artifacts, events, claims, locks, observedAt, staleAfterMs });
}
