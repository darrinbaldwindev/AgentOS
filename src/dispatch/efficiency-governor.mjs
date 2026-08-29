export function createEfficiencyGovernor({ budget = {}, costs = {} } = {}) {
  const limits = {
    maxCost: budget.maxCost ?? Infinity,
    maxCalls: budget.maxCalls ?? Infinity,
    maxTokens: budget.maxTokens ?? Infinity,
  };
  const spent = { cost: costs.cost ?? 0, calls: costs.calls ?? 0, tokens: costs.tokens ?? 0 };

  const estimate = ({ cost = 0, calls = 1, tokens = 0 } = {}) => ({
    cost: spent.cost + cost,
    calls: spent.calls + calls,
    tokens: spent.tokens + tokens,
  });

  const canSpend = estimate => (
    estimate.cost <= limits.maxCost &&
    estimate.calls <= limits.maxCalls &&
    estimate.tokens <= limits.maxTokens
  );

  const record = ({ cost = 0, calls = 1, tokens = 0 } = {}) => {
    spent.cost += cost;
    spent.calls += calls;
    spent.tokens += tokens;
    return { ...spent };
  };

  const remaining = () => ({
    cost: Math.max(0, limits.maxCost - spent.cost),
    calls: Math.max(0, limits.maxCalls - spent.calls),
    tokens: Math.max(0, limits.maxTokens - spent.tokens),
  });

  return { estimate, canSpend, record, remaining };
}
