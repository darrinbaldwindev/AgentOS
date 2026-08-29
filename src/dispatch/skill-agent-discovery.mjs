export function evaluateSkillAgentOpportunity({ history = [], minOccurrences = 3, minSavings = 0 } = {}) {
  const groups = new Map();
  for (const item of history) {
    const key = item.workflow_key;
    if (!key) continue;
    const group = groups.get(key) ?? { workflow_key: key, occurrences: 0, estimated_savings: 0, capabilities: new Set() };
    group.occurrences += 1;
    group.estimated_savings += item.estimated_savings ?? 0;
    for (const capability of item.capabilities ?? []) group.capabilities.add(capability);
    groups.set(key, group);
  }
  const candidates = [...groups.values()]
    .filter(group => group.occurrences >= minOccurrences && group.estimated_savings >= minSavings)
    .map(group => ({ ...group, capabilities: [...group.capabilities], recommended: true }));
  return candidates.sort((a, b) => b.estimated_savings - a.estimated_savings);
}
