export function createAuditEvent({ type, taskId = null, actor, outcome = null, metadata = {}, now = Date.now() }) {
  if (!type) throw new Error('audit event type is required');
  if (!actor) throw new Error('audit actor is required');
  return {
    event_id: `audit:${now}:${Math.random().toString(36).slice(2, 10)}`,
    type,
    task_id: taskId,
    actor,
    outcome,
    metadata,
    occurred_at: new Date(now).toISOString(),
  };
}

export function appendAuditEvent(events, event) {
  if (!Array.isArray(events)) throw new Error('audit events must be an array');
  return [...events, event];
}
