export function resolveDisagreement({ original = {}, verification = {}, task = {} } = {}) {
  const required = task.quality?.required ?? 0.9;
  const originalQuality = original.quality ?? 0;
  const verificationQuality = verification.quality ?? 0;
  const agreement = original.decision === verification.decision || original.output === verification.output;

  if (agreement && originalQuality >= required && verificationQuality >= required) {
    return { decision: 'accept', reason: 'independent_results_agree', confidence: Math.min(original.confidence ?? 0, verification.confidence ?? 0) };
  }
  if (verificationQuality >= required && verification.confidence >= (task.quality?.confidence ?? 0.8)) {
    return { decision: 'accept_verification', reason: 'verification_meets_threshold' };
  }
  if (originalQuality >= required && original.confidence >= (task.quality?.confidence ?? 0.8) && verificationQuality < required) {
    return { decision: 'accept_original', reason: 'verification_below_threshold' };
  }
  return { decision: 'escalate', reason: 'unresolved_disagreement' };
}
