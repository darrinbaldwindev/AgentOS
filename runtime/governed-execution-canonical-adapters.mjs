// AGENTOS-P0-GOVERNED-EXECUTION-002
// Thin composition adapters for the existing governed execution boundary.
// These adapters translate canonical AgentOS primitives into the boundary's
// method contracts. They do not create a second authority, policy, approval,
// verification, worker, scheduler, persistence, budget, receipt, Green or PRS system.

import { validateTaskContext } from '../src/dispatch/canonical-context.mjs';
import { authoriseDispatch } from '../src/dispatch/authority.mjs';

function requireObject(value, name) {
  if (!value || typeof value !== 'object') throw new TypeError(`${name} is required`);
  return value;
}

function requireFunction(target, method, label) {
  if (!target || typeof target[method] !== 'function') throw new TypeError(`${label}.${method} is required`);
}

function codedError(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  return error;
}

export function createCanonicalContextGate({ canonicalContext } = {}) {
  requireObject(canonicalContext, 'canonicalContext');
  return Object.freeze({
    async assertValid({ actorContext, task } = {}) {
      requireObject(actorContext, 'actorContext');
      requireObject(task, 'task');
      validateTaskContext(task, canonicalContext);
      return Object.freeze({ mission_id: task.mission_id, decision_id: task.decision_id ?? null });
    },
  });
}

export function createCanonicalAuthorityGate({ authorityPolicy } = {}) {
  requireObject(authorityPolicy, 'authorityPolicy');
  return Object.freeze({
    async assertAllowed({ actorContext, task } = {}) {
      requireObject(actorContext, 'actorContext');
      requireObject(task, 'task');
      authoriseDispatch(task, authorityPolicy);
      return Object.freeze({ issuer: task.issuer, granted_capabilities: [...(task.authority?.granted_capabilities ?? [])] });
    },
  });
}

export function createCanonicalToolPolicyGate({ toolPolicy, resolveToolName } = {}) {
  requireFunction(toolPolicy, 'assertAllowed', 'toolPolicy');
  if (resolveToolName != null && typeof resolveToolName !== 'function') throw new TypeError('resolveToolName must be a function');

  const resolver = resolveToolName ?? (({ task }) => task?.execution?.operation ?? task?.tool_name ?? null);
  return Object.freeze({
    async assertAllowed({ actorContext, task, capabilityEvaluation } = {}) {
      requireObject(actorContext, 'actorContext');
      requireObject(task, 'task');
      const toolName = await resolver({ actorContext, task, capabilityEvaluation });
      if (typeof toolName !== 'string' || !toolName.trim()) throw codedError('EXECUTION_TOOL_IDENTITY_REQUIRED');
      return toolPolicy.assertAllowed(toolName.trim());
    },
  });
}

export function createCanonicalHumanApprovalGate({ humanGate, isApproved } = {}) {
  requireFunction(humanGate, 'get', 'humanGate');
  if (isApproved != null && typeof isApproved !== 'function') throw new TypeError('isApproved must be a function');

  const approvalDecision = isApproved ?? ((record) => record?.status === 'resolved' && record?.decision === 'approved');
  return Object.freeze({
    async assertApproved({ actorContext, task, riskDecision, reservation } = {}) {
      requireObject(actorContext, 'actorContext');
      requireObject(task, 'task');
      const missionId = task.mission_id;
      if (typeof missionId !== 'string' || !missionId.trim()) throw codedError('APPROVAL_MISSION_ID_REQUIRED');
      const record = humanGate.get(missionId);
      if (!record) throw codedError('HUMAN_APPROVAL_RECORD_REQUIRED');
      if (record.status !== 'resolved') throw codedError('HUMAN_APPROVAL_PENDING', record);
      if (approvalDecision(record, { actorContext, task, riskDecision, reservation }) !== true) {
        throw codedError('HUMAN_APPROVAL_DENIED', record);
      }
      return record;
    },
  });
}

export function createCanonicalVerificationGate({ verificationRouter, runVerifier } = {}) {
  requireFunction(verificationRouter, 'selectVerifier', 'verificationRouter');
  if (typeof runVerifier !== 'function') throw new TypeError('runVerifier is required');

  return Object.freeze({
    async verify({ actorContext, task, result, receipt } = {}) {
      requireObject(actorContext, 'actorContext');
      requireObject(task, 'task');
      requireObject(result, 'result');
      requireObject(receipt, 'receipt');

      const verifier = await verificationRouter.selectVerifier({ task, result });
      if (!verifier || typeof verifier !== 'object') throw codedError('EXECUTION_VERIFIER_REQUIRED');
      const verification = await runVerifier({ verifier, actorContext, task, result, receipt });
      if (!verification || typeof verification !== 'object' || typeof verification.passed !== 'boolean') {
        throw codedError('EXECUTION_VERIFICATION_RESULT_INVALID');
      }
      return Object.freeze({ ...verification, verifier_id: verifier.id ?? verification.verifier_id ?? null });
    },
  });
}
