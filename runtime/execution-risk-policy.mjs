// AGENTOS-P0-RISK-001
// Provider-neutral execution risk contract for the existing AgentOS policy/security layer.
// This module validates and enforces risk decisions; it does NOT classify tools/tasks
// on its own and does not create a second policy, authority, consent or approval system.

export const EXECUTION_RISK_LEVELS = Object.freeze(['A0', 'A1', 'A2', 'A3', 'A4']);
const LEVEL_SET = new Set(EXECUTION_RISK_LEVELS);

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} is required`);
  return value;
}

function requireText(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function codedError(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  return error;
}

function normalizeDecision(decision) {
  requireObject(decision, 'risk decision');
  const level = requireText(decision.level, 'risk decision.level');
  if (!LEVEL_SET.has(level)) throw codedError('EXECUTION_RISK_LEVEL_UNKNOWN', { level });
  const reason = requireText(decision.reason, 'risk decision.reason');
  if (typeof decision.approvalRequired !== 'boolean') throw codedError('EXECUTION_RISK_APPROVAL_REQUIRED_INVALID');

  // Security-control-plane invariant: A4 is critical/high-impact and always requires approval.
  if (level === 'A4' && decision.approvalRequired !== true) {
    throw codedError('EXECUTION_RISK_A4_APPROVAL_REQUIRED');
  }

  return Object.freeze({
    level,
    approvalRequired: decision.approvalRequired,
    reason,
    evidence: Object.freeze(Array.isArray(decision.evidence) ? [...decision.evidence] : []),
  });
}

export function createExecutionRiskPolicy({ classify } = {}) {
  if (typeof classify !== 'function') throw new TypeError('classify is required');

  return Object.freeze({
    async evaluate({ actorContext, task, capabilityEvaluation } = {}) {
      requireObject(actorContext, 'actorContext');
      requireObject(task, 'task');
      requireObject(capabilityEvaluation, 'capabilityEvaluation');

      const raw = await classify({ actorContext, task, capabilityEvaluation });
      if (raw == null) throw codedError('EXECUTION_RISK_DECISION_REQUIRED');
      return normalizeDecision(raw);
    },
  });
}
