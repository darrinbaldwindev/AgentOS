// CORE-001 security audit boundary for tool capability decisions.

export function auditToolPlan({ toolNames = [], policy }) {
  if (!policy || typeof policy.decision !== 'function') throw new TypeError('policy.decision is required');
  const decisions = toolNames.map((toolName) => policy.decision(toolName));
  const denied = decisions.filter((item) => item.mode === 'deny');
  return Object.freeze({
    allowed: denied.length === 0,
    decisions: Object.freeze(decisions),
    deniedTools: Object.freeze(denied.map((item) => item.toolName)),
  });
}
