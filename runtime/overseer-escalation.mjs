export function decideEscalation({ consensus = {}, task = {}, budget = {} } = {}) {
  if (consensus.decision !== 'escalate') return { action: 'deliver', reason: 'consensus_resolved' };
  if (task.risk === 'high') return { action: 'human_review', reason: 'high_risk_unresolved' };
  if (budget.remainingCost != null && budget.remainingCost <= 0) return { action: 'defer', reason: 'budget_exhausted' };
  if (task.maxVerificationRounds != null && task.verificationRounds >= task.maxVerificationRounds) return { action: 'human_review', reason: 'verification_limit_reached' };
  return { action: 'additional_review', reason: 'unresolved_disagreement' };
}
