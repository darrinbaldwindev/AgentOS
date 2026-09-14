// Presentation-only projection of canonical Basic Chat task evidence.
// This module does not read or mutate persistence. Callers must supply records
// from the existing canonical persistence surface.

function latest(records) {
  return [...records].sort((a, b) => String(a?.updatedAt ?? a?.createdAt ?? '').localeCompare(String(b?.updatedAt ?? b?.createdAt ?? ''))).at(-1) ?? null;
}

function taskArtifact(artifacts, id) {
  return artifacts.find((artifact) => artifact?.id === id) ?? null;
}

export function projectBasicChatEvidence({ taskId, artifacts = [], events = [] } = {}) {
  const task = typeof taskId === 'string' && taskId.trim() ? taskId.trim() : null;
  if (!task) return null;
  if (!Array.isArray(artifacts) || !Array.isArray(events)) throw new TypeError('artifacts and events must be arrays');

  const response =
    taskArtifact(artifacts, `response:${task}`) ??
    taskArtifact(artifacts, `response-incomplete:${task}`) ??
    taskArtifact(artifacts, `response-green-blocked:${task}`) ??
    taskArtifact(artifacts, `response-awaiting-green:${task}`);
  const green = taskArtifact(artifacts, `green-disposition:${task}`);
  const taskEvents = events.filter((event) => event?.taskId === task);
  const lastEvent = latest(taskEvents);

  const payload = response?.payload && typeof response.payload === 'object' ? response.payload : {};
  const greenPayload = green?.payload && typeof green.payload === 'object' ? green.payload : {};
  const completionStatus = typeof payload.status === 'string' ? payload.status : (typeof lastEvent?.status === 'string' ? lastEvent.status : null);
  const greenDisposition = typeof greenPayload.disposition === 'string'
    ? greenPayload.disposition
    : (typeof lastEvent?.greenDisposition === 'string' ? lastEvent.greenDisposition : null);

  return Object.freeze({
    schemaVersion: 1,
    taskId: task,
    evidenceAvailable: Boolean(response || green || taskEvents.length),
    missionId: typeof payload.mission_id === 'string' ? payload.mission_id : (typeof lastEvent?.missionId === 'string' ? lastEvent.missionId : null),
    wakeTraceId: typeof payload.wake_trace_id === 'string' ? payload.wake_trace_id : (typeof lastEvent?.wakeTraceId === 'string' ? lastEvent.wakeTraceId : null),
    completionStatus,
    greenDisposition,
    completedAt: typeof payload.completed_at === 'string' ? payload.completed_at : null,
    blockerCount: Array.isArray(payload.blockers) ? payload.blockers.length : 0,
  });
}
