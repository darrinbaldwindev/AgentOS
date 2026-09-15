// Presentation-only projection of canonical dispatch tasks for the Basic Chat Jobs surface.
// This module does not read or mutate persistence and deliberately excludes objectives,
// worker output, authority payloads, credentials, evidence payloads and PRS/recovery claims.

const ALLOWED_STATUSES = new Set(['queued', 'claimed', 'working', 'verifying', 'complete', 'failed', 'blocked', 'cancelled']);

function text(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function timeOf(artifact, payload) {
  return text(payload.updated_at) ?? text(payload.completed_at) ?? text(artifact.updatedAt) ?? text(payload.created_at) ?? text(artifact.createdAt);
}

export function projectBasicChatJobs({ artifacts = [], limit = 5 } = {}) {
  if (!Array.isArray(artifacts)) throw new TypeError('artifacts must be an array');
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new TypeError('limit must be an integer from 1 to 20');

  const jobs = [];
  for (const artifact of artifacts) {
    if (artifact?.artifactType !== 'dispatch.task') continue;
    const payload = artifact?.payload;
    if (!payload || typeof payload !== 'object') continue;
    const taskId = text(payload.task_id);
    if (!taskId || artifact.id !== taskId) continue;
    const missionId = text(payload.mission_id);
    const wakeTraceId = text(payload.wake_trace_id);
    if (!missionId || !wakeTraceId) continue;

    const rawStatus = text(payload.status)?.toLowerCase() ?? null;
    const status = rawStatus && ALLOWED_STATUSES.has(rawStatus) ? rawStatus : 'unknown';
    jobs.push(Object.freeze({
      schemaVersion: 1,
      taskId,
      missionId,
      status,
      priority: text(payload.priority),
      createdAt: text(payload.created_at) ?? text(artifact.createdAt),
      updatedAt: timeOf(artifact, payload),
    }));
  }

  jobs.sort((a, b) => String(b.updatedAt ?? b.createdAt ?? '').localeCompare(String(a.updatedAt ?? a.createdAt ?? '')));
  return Object.freeze(jobs.slice(0, limit));
}
