import { resolveOverseerTask } from './overseer-preferences.mjs';

export function createOverseerDecisionLoop({ router, execute, observe = async () => null, preferences } = {}) {
  if (!router?.select || typeof execute !== 'function') throw new TypeError('router.select and execute are required');

  async function run({ missionId, message, task = {} } = {}) {
    const resolvedTask = resolveOverseerTask(task, preferences);
    const route = await router.select({ task: resolvedTask });
    if (!route?.selected) return Object.freeze({ status: 'blocked', route, task: resolvedTask });

    const result = await execute({ missionId, message, task: resolvedTask, model: route.selected });
    const observation = await observe({ task: resolvedTask, route, result });

    return Object.freeze({ status: 'completed', task: resolvedTask, route, result, observation });
  }

  return Object.freeze({ run });
}
