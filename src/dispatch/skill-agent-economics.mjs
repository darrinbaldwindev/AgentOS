export function evaluateSkillAgentEconomics({ creationCost = 0, maintenanceCost = 0, projectedSavings = 0, confidence = 1, minConfidence = 0.8 } = {}) {
  const netSavings = projectedSavings - creationCost - maintenanceCost;
  return {
    netSavings,
    confidence,
    worthwhile: confidence >= minConfidence && netSavings > 0,
    reason: confidence < minConfidence ? 'insufficient_confidence' : netSavings > 0 ? 'projected_savings_exceed_cost' : 'creation_cost_exceeds_projected_savings',
  };
}
