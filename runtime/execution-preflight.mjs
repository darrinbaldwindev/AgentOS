import { authoriseDispatch } from '../src/dispatch/authority.mjs';

function requireText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${field} is required`);
  return value;
}

function assertConsent(task, approvalGate) {
  const mode = task.consent_mode;
  if (mode === 'PRE_AUTHORIZED') return Object.freeze({ mode, approved: true });
  if (mode !== 'EXPLICIT_APPROVAL') throw new Error('CONSENT_REQUIRED');
  if (!approvalGate || typeof approvalGate.get !== 'function') throw new Error('APPROVAL_GATE_REQUIRED');
  const approval = approvalGate.get(task.mission_id);
  if (!approval || approval.status !== 'resolved' || approval.decision !== 'approve') {
    throw new Error('APPROVAL_REQUIRED');
  }
  return Object.freeze({ mode, approved: true, approval });
}

function assertCapabilityGrant(task) {
  const required = task.required_capabilities ?? [];
  const granted = task.authority?.granted_capabilities ?? [];
  if (!Array.isArray(required) || !Array.isArray(granted)) throw new Error('CAPABILITY_DECLARATION_INVALID');
  const missing = required.filter((capability) => !granted.includes(capability));
  if (missing.length) {
    const error = new Error(`CAPABILITY_GRANT_MISSING:${missing.join(',')}`);
    error.code = 'CAPABILITY_GRANT_MISSING';
    throw error;
  }
  return Object.freeze({ required: Object.freeze([...required]), granted: Object.freeze([...granted]) });
}

function assertNonProduction(task) {
  const scope = Array.isArray(task.scope) ? task.scope : [];
  const constraints = Array.isArray(task.constraints) ? task.constraints : [];
  if (scope.includes('production') || constraints.some((value) => /production\s+write/i.test(String(value)))) {
    const error = new Error('PRODUCTION_SCOPE_PROHIBITED');
    error.code = 'PRODUCTION_SCOPE_PROHIBITED';
    throw error;
  }
}

export function createExecutionPreflight({ runtimeShell, authorityPolicy, approvalGate = null, toolPolicy = null, budget = null } = {}) {
  if (!runtimeShell || typeof runtimeShell.assertExecutionEligible !== 'function') {
    throw new TypeError('runtimeShell.assertExecutionEligible is required');
  }
  if (!authorityPolicy) throw new TypeError('authorityPolicy is required');

  async function admit(task, { toolName = null } = {}) {
    if (!task || typeof task !== 'object') throw new TypeError('task is required');
    requireText(task.mission_id, 'mission_id');
    requireText(task.project_id, 'project_id');
    requireText(task.issuer, 'issuer');
    requireText(task.target, 'target');

    // Connectivity/capability eligibility is physical/runtime state, not provider identity.
    const eligibility = await runtimeShell.assertExecutionEligible();

    // Existing dispatch authority remains canonical. This module only composes it.
    authoriseDispatch(task, authorityPolicy);
    const capabilities = assertCapabilityGrant(task);
    const consent = assertConsent(task, approvalGate);
    assertNonProduction(task);

    if (toolName !== null) {
      if (!toolPolicy || typeof toolPolicy.assertAllowed !== 'function') throw new Error('TOOL_POLICY_REQUIRED');
      toolPolicy.assertAllowed(toolName);
    }

    return Object.freeze({ eligibility, capabilities, consent, toolName });
  }

  async function execute({ task, execute: run, toolName = null, budgetUnits = 1 } = {}) {
    if (typeof run !== 'function') throw new TypeError('execute is required');
    const admission = await admit(task, { toolName });

    let reservation = null;
    if (budget) {
      if (typeof budget.reserve !== 'function' || typeof budget.reconcile !== 'function') {
        throw new TypeError('budget.reserve and budget.reconcile are required');
      }
      reservation = budget.reserve({ project_id: task.project_id, mission_id: task.mission_id, limit_units: budgetUnits });
    }

    try {
      const result = await run(task);
      const budgetResult = reservation ? budget.reconcile({ reservation_id: reservation.reservation_id, actual_units: budgetUnits }) : null;
      return Object.freeze({ result, admission, reservation, budget: budgetResult });
    } catch (error) {
      if (reservation) {
        try {
          error.budget = budget.reconcile({ reservation_id: reservation.reservation_id, actual_units: budgetUnits });
        } catch (budgetError) {
          error.budgetError = { name: budgetError.name, message: budgetError.message };
        }
      }
      throw error;
    }
  }

  return Object.freeze({ admit, execute });
}
