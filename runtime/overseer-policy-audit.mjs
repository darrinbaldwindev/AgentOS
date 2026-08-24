// CORE-001: Overseer view of tool policy decisions.

export function auditPolicyEvents({ store, runId }) {
  if (!store || !runId) throw new TypeError('store and runId are required');
  const events = store.list('event').filter((event) => event.runId === runId && event.eventType.startsWith('tool.policy.'));
  const denied = events.filter((event) => event.mode === 'deny');
  const allowed = events.filter((event) => event.mode === 'allow');
  const severity = denied.length ? 'warning' : 'info';
  return Object.freeze({
    runId,
    severity,
    allowedCount: allowed.length,
    deniedCount: denied.length,
    deniedTools: Object.freeze([...new Set(denied.map((event) => event.toolName))]),
    recommendation: denied.length
      ? 'Review denied tool requests before granting additional capabilities.'
      : 'No denied tool capability requests observed.',
  });
}
