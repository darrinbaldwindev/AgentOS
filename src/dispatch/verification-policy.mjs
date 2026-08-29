export function decideVerification({ task = {}, route = {}, result = {}, performance = null } = {}) {
  const required = task.quality?.required ?? 0.9;
  const observed = result.quality ?? performance?.averageQuality ?? 0;
  const confidence = result.confidence ?? performance?.averageConfidence ?? 0;
  const risk = task.risk ?? 'normal';
  const needsReview = risk === 'high' || observed < required || confidence < (task.quality?.confidence ?? 0.8);
  const reason = risk === 'high' ? 'high_risk' : observed < required ? 'quality_below_floor' : confidence < (task.quality?.confidence ?? 0.8) ? 'low_confidence' : 'not_required';
  return { needsReview, reason, requiredQuality: required, observedQuality: observed, confidence };
}
