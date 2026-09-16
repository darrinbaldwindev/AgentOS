// AGENTOS-P0-RISK-001
// Provider-neutral execution risk contract for the existing AgentOS policy/security layer.
// This module validates and enforces risk decisions and owns deterministic mappings
// for bounded execution adapters where the policy is explicit. It does not create a
// second policy, authority, consent or approval system.

export const EXECUTION_RISK_LEVELS = Object.freeze(['A0', 'A1', 'A2', 'A3', 'A4']);
const LEVEL_SET = new Set(EXECUTION_RISK_LEVELS);

export const WINDOWS_POWERSHELL_OPERATION_RISK = Object.freeze({
  'repo.status': Object.freeze({
    level: 'A0',
    approvalRequired: false,
    reason: 'read-only repository status inspection',
  }),
  'repo.diff': Object.freeze({
    level: 'A0',
    approvalRequired: false,
    reason: 'read-only repository diff inspection',
  }),
  'process.list': Object.freeze({
    level: 'A0',
    approvalRequired: false,
    reason: 'read-only process inspection',
  }),
  'service.list': Object.freeze({
    level: 'A0',
    approvalRequired: false,
    reason: 'read-only service inspection',
  }),
  'test.run': Object.freeze({
    level: 'A2',
    approvalRequired: false,
    reason: 'bounded non-elevated operational test execution',
  }),
  'audit.run': Object.freeze({
    level: 'A2',
    approvalRequired: false,
    reason: 'bounded non-elevated operational audit execution',
  }),
});

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

export function classifyWindowsPowerShellOperationRisk({ task } = {}) {
  requireObject(task, 'task');
  const execution = requireObject(task.execution, 'task.execution');
  const adapter = requireText(execution.adapter, 'task.execution.adapter');
  if (adapter !== 'windows-powershell') {
    throw codedError('EXECUTION_RISK_ADAPTER_MISMATCH', { adapter });
  }

  const operation = requireText(execution.operation, 'task.execution.operation');
  const mapped = WINDOWS_POWERSHELL_OPERATION_RISK[operation];
  if (!mapped) {
    throw codedError('EXECUTION_RISK_OPERATION_UNKNOWN', { adapter, operation });
  }

  return Object.freeze({
    ...mapped,
    evidence: Object.freeze([
      'policy:agentos-security-control-plane',
      `adapter:${adapter}`,
      `operation:${operation}`,
    ]),
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
