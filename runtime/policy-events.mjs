// CORE-001: make capability decisions observable to the event/audit stream.

export function createPolicyEventRecorder({ store }) {
  if (!store) throw new TypeError('store is required');

  function record({ runId, toolName, mode, reason = null }) {
    if (!runId || !toolName || !mode) throw new TypeError('runId, toolName and mode are required');
    return store.create('event', {
      runId,
      eventType: mode === 'allow' ? 'tool.policy.allowed' : 'tool.policy.denied',
      toolName,
      mode,
      reason,
    });
  }

  function recordPlan({ runId, decisions }) {
    return decisions.map((decision) => record({
      runId,
      toolName: decision.toolName,
      mode: decision.mode,
      reason: decision.mode === 'allow' ? 'explicit-capability-grant' : 'default-deny',
    }));
  }

  return Object.freeze({ record, recordPlan });
}
