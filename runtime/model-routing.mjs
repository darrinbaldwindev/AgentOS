// CORE-002: Overseer model routing policy.
// Routing separates model capability, user access, live availability and task fit.

export const ACCESS = Object.freeze(['free', 'subscription', 'api', 'local']);

export function scoreModel({ model, task }) {
  const capability = model.capabilities ?? {};
  const requirements = task.requirements ?? {};
  let score = 0;
  for (const [key, required] of Object.entries(requirements)) {
    if (!required) continue;
    if (capability[key] === true) score += 4;
    else if (typeof capability[key] === 'number' && capability[key] >= required) score += 4;
    else score -= 10;
  }
  if (model.available !== true) score -= 1000;
  if (model.access === 'free') score += task.freePreferred === false ? 0 : 3;
  if (model.access === 'local') score += 1;
  score += Number(model.quality ?? 0);
  return score;
}

export function selectModel({ models, task }) {
  const ranked = models
    .filter((model) => ACCESS.includes(model.access))
    .map((model) => ({ model, score: scoreModel({ model, task }) }))
    .sort((a, b) => b.score - a.score);
  const winner = ranked.find((item) => item.score > -1000) ?? null;
  return Object.freeze({
    selected: winner?.model ?? null,
    score: winner?.score ?? null,
    candidates: Object.freeze(ranked.map(Object.freeze)),
    reason: winner ? (winner.model.access === 'free' ? 'suitable-free-model' : 'best-available-fit') : 'no-eligible-model',
  });
}
