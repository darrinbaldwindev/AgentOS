// Presentation-only projection of canonical dispatch tasks for the Basic Chat Jobs surface.
// This module does not read or mutate persistence and deliberately excludes objectives,
// worker output, authority payloads, credentials, evidence payloads and PRS/recovery claims.

// Keep canonical runner states intact. Presentation code may translate labels, but the
// projection must not turn `verification` into completion or hide an `escalated` task.
const ALLOWED_STATUSES = new Set([
  'queued', 'claimed', 'working', 'verification', 'completed', 'blocked', 'escalated',
  // Retain bounded compatibility with persisted task producers that may use these states.
  'verifying', 'complete', 'failed', 'cancelled',
]);

function text(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function timeOf(artifact, payload) {
  return text(payload.updated_at) ?? text(payload.completed_at) ?? text(artifact.updatedAt) ?? text(payload.created_at) ?? text(artifact.createdAt);
}

export function projectBasicChatJobs({ artifacts = [], limit = 5, projectId = null } = {}) {
  if (!Array.isArray(artifacts)) throw new TypeError('artifacts must be an array');
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new TypeError('limit must be an integer from 1 to 20');
  const expectedProjectId = projectId === null ? null : text(projectId);
  if (projectId !== null && !expectedProjectId) throw new TypeError('projectId must be a non-empty string or null');

  const jobs = [];
  for (const artifact of artifacts) {
    if (artifact?.artifactType !== 'dispatch.task') continue;
    const payload = artifact?.payload;
    if (!payload || typeof payload !== 'object') continue;
    const taskId = text(payload.task_id);
    if (!taskId || artifact.id !== taskId) continue;
    const missionId = text(payload.mission_id);
    const wakeTraceId = text(payload.wake_trace_id);
    const taskProjectId = text(payload.project_id);
    if (!missionId || !wakeTraceId || !taskProjectId) continue;
    if (expectedProjectId && taskProjectId !== expectedProjectId) continue;

    const rawStatus = text(payload.status)?.toLowerCase() ?? null;
    const status = rawStatus && ALLOWED_STATUSES.has(rawStatus) ? rawStatus : 'unknown';
    jobs.push(Object.freeze({
      schemaVersion: 1,
      taskId,
      missionId,
      projectId: taskProjectId,
      status,
      priority: text(payload.priority),
      createdAt: text(payload.created_at) ?? text(artifact.createdAt),
      updatedAt: timeOf(artifact, payload),
    }));
  }

  jobs.sort((a, b) => String(b.updatedAt ?? b.createdAt ?? '').localeCompare(String(a.updatedAt ?? a.createdAt ?? '')));
  return Object.freeze(jobs.slice(0, limit));
}
