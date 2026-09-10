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

function sameCorrelation(a, b) {
  return a.task_id === b.task_id && a.mission_id === b.mission_id && a.wake_trace_id === b.wake_trace_id;
}

export function deriveLocalHostStatus({
  hostIdentity,
  config,
  artifacts = [],
  events = [],
  locks = [],
  observedAt = new Date().toISOString(),
  staleAfterMs = 15 * 60 * 1000,
} = {}) {
  if (!hostIdentity?.host_id) throw new TypeError('hostIdentity.host_id is required');
  if (!Number.isFinite(staleAfterMs) || staleAfterMs <= 0) throw new TypeError('staleAfterMs must be positive');
  const now = asTime(observedAt);
  if (now === null) throw new TypeError('observedAt must be an ISO timestamp');

  const hostId = hostIdentity.host_id;
  const mismatched = [...artifacts, ...events].filter((record) => {
    const payload = payloadOf(record);
    return payload.host_id && payload.host_id !== hostId;
  });
  if (mismatched.length) {
    return Object.freeze({
      schema_version: 1,
      host_id: hostId,
      observed_at: observedAt,
      lifecycle_state: 'blocked',
      reason: 'HOST_IDENTITY_CONFLICT',
      evidence_freshness: 'conflicting',
      scheduler_enabled: config?.scheduler?.enabled === true,
      current: null,
      last_result: null,
      assurance: { green: 'unknown', prs: 'unknown' },
    });
  }

  const hostArtifacts = artifacts.filter((record) => exactHostMatch(record, hostId));
  const hostEvents = events.filter((record) => exactHostMatch(record, hostId));
  const latestEvidenceTime = newestTimestamp([...hostArtifacts, ...hostEvents]);
  const evidenceAgeMs = latestEvidenceTime === null ? null : now - latestEvidenceTime;
  const stale = latestEvidenceTime === null || evidenceAgeMs < 0 || evidenceAgeMs > staleAfterMs;

  const recoveryLock = locks.find((lock) => {
    const state = normalizedState(lock?.state ?? lock?.status);
    return RECOVERY_STATES.has(state) || lock?.uncertain === true || lock?.retained === true;
  });
  if (recoveryLock) {
    return Object.freeze({
      schema_version: 1,
      host_id: hostId,
      observed_at: observedAt,
      lifecycle_state: 'recovery_required',
      reason: recoveryLock.reason ?? 'RETAINED_OR_UNCERTAIN_LOCK',
      evidence_freshness: stale ? 'stale' : 'fresh',
      scheduler_enabled: config?.scheduler?.enabled === true,
      current: null,
      last_result: null,
      assurance: { green: 'unknown', prs: 'unknown' },
    });
  }

  if (stale) {
    return Object.freeze({
      schema_version: 1,
      host_id: hostId,
      observed_at: observedAt,
      lifecycle_state: 'offline_or_stale',
      reason: latestEvidenceTime === null ? 'NO_CURRENT_DURABLE_EVIDENCE' : 'EVIDENCE_STALE',
      evidence_freshness: latestEvidenceTime === null ? 'unknown' : 'stale',
      scheduler_enabled: config?.scheduler?.enabled === true,
      current: null,
      last_result: null,
      assurance: { green: 'unknown', prs: 'unknown' },
    });
  }

  const taskArtifacts = hostArtifacts.filter((record) => record?.artifactType === 'dispatch.task');
  const activeTasks = taskArtifacts.filter((record) => ACTIVE_TASK_STATES.has(normalizedState(payloadOf(record).status ?? payloadOf(record).pickup_state)));
  if (activeTasks.length > 1) {
    return Object.freeze({
      schema_version: 1, host_id: hostId, observed_at: observedAt, lifecycle_state: 'blocked',
      reason: 'MULTIPLE_ACTIVE_TASKS', evidence_freshness: 'fresh', scheduler_enabled: config?.scheduler?.enabled === true,
      current: null, last_result: null, assurance: { green: 'unknown', prs: 'unknown' },
    });
  }

  const blockedTask = taskArtifacts.find((record) => BLOCKED_TASK_STATES.has(normalizedState(payloadOf(record).status ?? payloadOf(record).pickup_state)));
  if (blockedTask) {
    return Object.freeze({
      schema_version: 1,
      host_id: hostId,
      observed_at: observedAt,
      lifecycle_state: 'blocked',
      reason: payloadOf(blockedTask).pickup_blocker ?? payloadOf(blockedTask).reason ?? 'TASK_BLOCKED',
      evidence_freshness: 'fresh',
      scheduler_enabled: config?.scheduler?.enabled === true,
      current: correlation(blockedTask),
      last_result: null,
      assurance: { green: 'unknown', prs: 'unknown' },
    });
  }

  if (activeTasks.length === 1) {
    const current = correlation(activeTasks[0]);
    if (!current.task_id || !current.mission_id || !current.wake_trace_id) {
      return Object.freeze({
        schema_version: 1, host_id: hostId, observed_at: observedAt, lifecycle_state: 'blocked',
        reason: 'ACTIVE_TASK_CORRELATION_INCOMPLETE', evidence_freshness: 'fresh', scheduler_enabled: config?.scheduler?.enabled === true,
        current: null, last_result: null, assurance: { green: 'unknown', prs: 'unknown' },
      });
    }
    return Object.freeze({
      schema_version: 1,
      host_id: hostId,
      observed_at: observedAt,
      lifecycle_state: 'working',
      reason: 'CORRELATED_IN_FLIGHT_TASK',
      evidence_freshness: 'fresh',
      scheduler_enabled: config?.scheduler?.enabled === true,
      current,
      last_result: null,
      assurance: { green: 'unknown', prs: 'unknown' },
    });
  }

  const receipts = hostArtifacts
    .filter((record) => record?.artifactType === 'remote.execution.receipt')
    .filter((record) => normalizedState(payloadOf(record).status) === 'completed')
    .sort((a, b) => (newestTimestamp([b]) ?? 0) - (newestTimestamp([a]) ?? 0));
  let lastResult = null;
  let assurance = { green: 'unknown', prs: 'unknown' };
  if (receipts.length) {
    const receipt = payloadOf(receipts[0]);
    const receiptCorrelation = correlation(receipts[0]);
    const completeCorrelation = Object.values(receiptCorrelation).every(Boolean);
    const identityComplete = receipt.host_id === hostId && typeof receipt.code_identity === 'string' && receipt.code_identity.trim();
    if (completeCorrelation && identityComplete) {
      lastResult = {
        ...receiptCorrelation,
        receipt_id: receipts[0].id ?? null,
        completed_at: receipt.completed_at ?? receipts[0].updatedAt ?? receipts[0].createdAt ?? null,
        code_identity: receipt.code_identity,
      };
      assurance = {
        green: receipt.green_disposition ?? 'unknown',
        prs: receipt.prs_disposition ?? 'unknown',
      };
    }
  }

  return Object.freeze({
    schema_version: 1,
    host_id: hostId,
    observed_at: observedAt,
    lifecycle_state: 'idle',
    reason: 'FRESH_HOST_EVIDENCE_WITH_NO_ACTIVE_TASK',
    evidence_freshness: 'fresh',
    scheduler_enabled: config?.scheduler?.enabled === true,
    current: null,
    last_result: lastResult,
    assurance,
  });
}

export async function readLocalHostStatus({ persistence, hostIdentity, config, locks = [], observedAt, staleAfterMs } = {}) {
  if (!persistence?.list) throw new TypeError('persistence.list is required');
  const [artifacts, events] = await Promise.all([persistence.list('artifact'), persistence.list('event')]);
  return deriveLocalHostStatus({ hostIdentity, config, artifacts, events, locks, observedAt, staleAfterMs });
}
