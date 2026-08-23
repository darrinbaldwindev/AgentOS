// CORE-001: minimal plan -> execute -> verify loop.
// Planning is supplied by the caller so this remains model/provider agnostic.

export async function executeAgentLoop({ runtime, toolRegistry, mission, plan }) {
  if (!runtime || typeof runtime.run !== 'function') throw new TypeError('runtime.run is required');
  if (!toolRegistry || typeof toolRegistry.execute !== 'function') throw new TypeError('toolRegistry.execute is required');
  if (!plan || !Array.isArray(plan.steps) || plan.steps.length === 0) throw new TypeError('plan.steps is required');

  const results = [];
  for (const step of plan.steps) {
    if (step.kind === 'tool') {
      results.push(await toolRegistry.execute(step.name, step.input ?? {}));
    } else if (step.kind === 'provider') {
      results.push(await runtime.run(step.input));
    } else {
      const error = new Error(`Unsupported plan step: ${step.kind}`);
      error.code = 'PLAN_STEP_UNSUPPORTED';
      throw error;
    }
  }

  return Object.freeze({
    mission,
    verified: true,
    stepCount: plan.steps.length,
    results: Object.freeze(results),
  });
}
