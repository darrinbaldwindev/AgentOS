import { randomUUID } from 'node:crypto';

export function createEfficiencyGovernor({ budget = {}, costs = {} } = {}) {
  const limits = {
    maxCost: budget.maxCost ?? Infinity,
    maxCalls: budget.maxCalls ?? Infinity,
    maxTokens: budget.maxTokens ?? Infinity,
  };
  const spent = { cost: costs.cost ?? 0, calls: costs.calls ?? 0, tokens: costs.tokens ?? 0 };
  const reserved = { cost: 0, calls: 0, tokens: 0 };
  const reservations = new Map();

  const normalise = ({ cost = 0, calls = 1, tokens = 0 } = {}) => ({
    cost: Number(cost),
    calls: Number(calls),
    tokens: Number(tokens),
  });

  const estimate = ({ cost = 0, calls = 1, tokens = 0 } = {}) => ({
    cost: spent.cost + reserved.cost + cost,
    calls: spent.calls + reserved.calls + calls,
    tokens: spent.tokens + reserved.tokens + tokens,
  });

  const canSpend = estimate => (
    estimate.cost <= limits.maxCost &&
    estimate.calls <= limits.maxCalls &&
    estimate.tokens <= limits.maxTokens
  );

  const record = ({ cost = 0, calls = 1, tokens = 0 } = {}) => {
    const usage = normalise({ cost, calls, tokens });
    spent.cost += usage.cost;
    spent.calls += usage.calls;
    spent.tokens += usage.tokens;
    return { ...spent };
  };

  // Two-phase budget control: reserve the estimate before execution, then
  // reconcile it with actual usage after execution. Reservations count against
  // the hard ceiling, preventing concurrent callers from double-spending the
  // same remaining budget.
  const reserve = ({ cost = 0, calls = 1, tokens = 0 } = {}) => {
    const usage = normalise({ cost, calls, tokens });
    if (!canSpend(estimate(usage))) return null;

    const id = `r-${randomUUID()}`;
    reservations.set(id, usage);
    reserved.cost += usage.cost;
    reserved.calls += usage.calls;
    reserved.tokens += usage.tokens;
    return Object.freeze({ id, ...usage });
  };

  const reconcile = ({ reservation, actual = {} } = {}) => {
    const id = typeof reservation === 'string' ? reservation : reservation?.id;
    const held = reservations.get(id);
    if (!held) throw new Error('unknown or already reconciled reservation');

    reservations.delete(id);
    reserved.cost -= held.cost;
    reserved.calls -= held.calls;
    reserved.tokens -= held.tokens;

    const usage = normalise({
      cost: actual.cost ?? held.cost,
      calls: actual.calls ?? held.calls,
      tokens: actual.tokens ?? held.tokens,
    });
    const projected = {
      cost: spent.cost + usage.cost,
      calls: spent.calls + usage.calls,
      tokens: spent.tokens + usage.tokens,
    };
    const overBudget = projected.cost > limits.maxCost ||
      projected.calls > limits.maxCalls ||
      projected.tokens > limits.maxTokens;
    if (overBudget) throw new Error('actual usage exceeds budget limits');

    const totals = record(usage);
    return {
      ...totals,
      reservationId: id,
      overBudget: false,
    };
  };

  const release = reservation => {
    const id = typeof reservation === 'string' ? reservation : reservation?.id;
    const held = reservations.get(id);
    if (!held) throw new Error('unknown or already released reservation');
    reservations.delete(id);
    reserved.cost -= held.cost;
    reserved.calls -= held.calls;
    reserved.tokens -= held.tokens;
    return { ...held, reservationId: id };
  };

  const remaining = () => ({
    cost: Math.max(0, limits.maxCost - spent.cost - reserved.cost),
    calls: Math.max(0, limits.maxCalls - spent.calls - reserved.calls),
    tokens: Math.max(0, limits.maxTokens - spent.tokens - reserved.tokens),
  });

  return { estimate, canSpend, record, reserve, reconcile, release, remaining };
}
