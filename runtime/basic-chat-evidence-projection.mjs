// Presentation-only projection of canonical Basic Chat task evidence.
// This module does not read or mutate persistence. Callers must supply records
// from the existing canonical persistence surface.

const CANONICAL_EVENT_TYPES = new Set([
  'agentos.manual-wake.completed',
  'agentos.manual-wake.green-blocked',
  'agentos.manual-wake.green-failed',
]);

function latest(records) {
  return [...records].sort((a, b) => String(a?.updatedAt ?? a?.createdAt ?? '').localeCompare(String(b?.updatedAt ?? b?.createdAt ?? ''))).at(-1) ?? null;
}

function taskArtifact(artifacts, id, artifactType) {
  return artifacts.find((artifact) => artifact?.id === id && artifact?.artifactType === artifactType) ?? null;
}

function sameIfPresent(a, b) {
  return !a || !b || a === b;
}

function unavailable(task) {
  return Object.freeze({
    schemaVersion: 1,
    taskId: task,
    evidenceAvailable: false,
    missionId: null,
    wakeTraceId: null,
    completionStatus: null,
    greenDisposition: null,
    completedAt: null,
    blockerCount: 0,
  });
}

export function projectBasicChatEvidence({ taskId, artifacts = [], events = [] } = {}) {
  const task = typeof taskId === 'string' && taskId.trim() ? taskId.trim() : null;
  if (!task) return null;
  if (!Array.isArray(artifacts) || !Array.isArray(events)) throw new TypeError('artifacts and events must be arrays');

  const response =
    taskArtifact(artifacts, `response:${task}`, 'project-overseer.response') ??
    taskArtifact(artifacts, `response-incomplete:${task}`, 'project-overseer.response') ??
    taskArtifact(artifacts, `response-green-blocked:${task}`, 'project-overseer.response') ??
    taskArtifact(artifacts, `response-awaiting-green:${task}`, 'project-overseer.response');
  const green = taskArtifact(artifacts, `green-disposition:${task}`, 'green.disposition');
  const taskEvents = events.filter((event) => event?.taskId === task && CANONICAL_EVENT_TYPES.has(event?.eventType));
  const lastEvent = latest(taskEvents);

  const payload = response?.payload && typeof response.payload === 'object' ? response.payload : {};
  const greenPayload = green?.payload && typeof green.payload === 'object' ? green.payload : {};

  // Canonical Green records produced by local-wake carry the assigned task_id.
  // Do not project a Green disposition solely because an artifact key/type looks
  // canonical: missing or conflicting payload identity is false-evidence risk.
  if (green && greenPayload.task_id !== task) return unavailable(task);

  const responseMissionId = typeof payload.mission_id === 'string' ? payload.mission_id : null;
  const responseWakeTraceId = typeof payload.wake_trace_id === 'string' ? payload.wake_trace_id : null;
  const eventMissionId = typeof lastEvent?.missionId === 'string' ? lastEvent.missionId : null;
  const eventWakeTraceId = typeof lastEvent?.wakeTraceId === 'string' ? lastEvent.wakeTraceId : null;
  if (!sameIfPresent(responseMissionId, eventMissionId) || !sameIfPresent(responseWakeTraceId, eventWakeTraceId)) {
    return unavailable(task);
  }

  const completionStatus = typeof payload.status === 'string' ? payload.status : (typeof lastEvent?.status === 'string' ? lastEvent.status : null);
  const greenDisposition = typeof greenPayload.disposition === 'string'
    ? greenPayload.disposition
    : (typeof lastEvent?.greenDisposition === 'string' ? lastEvent.greenDisposition : null);

  return Object.freeze({
    schemaVersion: 1,
    taskId: task,
    evidenceAvailable: Boolean(response || green || taskEvents.length),
    missionId: responseMissionId ?? eventMissionId,
    wakeTraceId: responseWakeTraceId ?? eventWakeTraceId,
    completionStatus,
    greenDisposition,
    completedAt: typeof payload.completed_at === 'string' ? payload.completed_at : null,
    blockerCount: Array.isArray(payload.blockers) ? payload.blockers.length : 0,
  });
}
