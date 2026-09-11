// AGENTOS-P0-GOVERNED-EXECUTION-001
// Composition boundary only: reuses existing governance/runtime primitives rather
// than creating a second authority, policy, budget, worker, persistence or assurance system.

function requireMethod(target, method, label) {
  if (!target || typeof target[method] !== 'function') {
    throw new TypeError(`${label}.${method} is required`);
  }
}

export function createGovernedExecutionBoundary({
  context,
  authority,
  consent,
  capability,
  policy,
  risk,
  budget,
  approval,
  receipts,
  verification,
} = {}) {
  requireMethod(context, 'assertValid', 'context');
  requireMethod(authority, 'assertAllowed', 'authority');
  requireMethod(consent, 'assertAllowed', 'consent');
  requireMethod(capability, 'assertExecutionEligible', 'capability');
  requireMethod(policy, 'assertAllowed', 'policy');
  requireMethod(risk, 'evaluate', 'risk');
  requireMethod(budget, 'reserve', 'budget');
  requireMethod(budget, 'reconcile', 'budget');
  requireMethod(approval, 'assertApproved', 'approval');
  requireMethod(receipts, 'record', 'receipts');
  requireMethod(verification, 'verify', 'verification');

  async function execute({ actorContext, task, invoke, actualUnits = 1 } = {}) {
    if (!actorContext || typeof actorContext !== 'object') throw new TypeError('actorContext is required');
    if (!task || typeof task !== 'object') throw new TypeError('task is required');
    if (typeof invoke !== 'function') throw new TypeError('invoke is required');
    if (!Number.isInteger(actualUnits) || actualUnits < 0) throw new TypeError('actualUnits must be a non-negative integer');

    await context.assertValid({ actorContext, task });
    await authority.assertAllowed({ actorContext, task });
    await consent.assertAllowed({ actorContext, task });
    const capabilityEvaluation = await capability.assertExecutionEligible({ actorContext, task });
    await policy.assertAllowed({ actorContext, task, capabilityEvaluation });
    const riskDecision = await risk.evaluate({ actorContext, task, capabilityEvaluation });
    if (!riskDecision || typeof riskDecision.approvalRequired !== 'boolean') throw new Error('RISK_DECISION_INVALID');

    const reservation = await budget.reserve({ project_id: task.project_id, mission_id: task.mission_id, limit_units: Math.max(1, actualUnits) });
    let invoked = false;
    let reconciled = false;
    try {
      if (riskDecision.approvalRequired) await approval.assertApproved({ actorContext, task, riskDecision, reservation });
      invoked = true;
      const result = await invoke({ actorContext, task, capabilityEvaluation, riskDecision, reservation });
      const receipt = await receipts.record({ actorContext, task, result, reservation, riskDecision });
      if (!receipt) throw new Error('EXECUTION_RECEIPT_REQUIRED');
      const verificationResult = await verification.verify({ actorContext, task, result, receipt });
      if (!verificationResult?.passed) {
        const error = new Error('EXECUTION_VERIFICATION_FAILED');
        error.code = 'EXECUTION_VERIFICATION_FAILED';
        error.receipt = receipt;
        error.verification = verificationResult ?? null;
        throw error;
      }
      const budgetResult = await budget.reconcile({ reservation_id: reservation.reservation_id, actual_units: actualUnits });
      reconciled = true;
      return Object.freeze({ status: 'VERIFIED', result, receipt, verification: verificationResult, budget: budgetResult, risk: riskDecision, capability: capabilityEvaluation });
    } catch (error) {
      if (!reconciled && reservation?.reservation_id) {
        try {
          await budget.reconcile({ reservation_id: reservation.reservation_id, actual_units: invoked ? actualUnits : 0 });
        } catch (budgetError) {
          error.budgetReconciliationError = { name: budgetError?.name ?? 'Error', message: budgetError?.message ?? String(budgetError) };
        }
      }
      throw error;
    }
  }
  return Object.freeze({ execute });
}
