import { resolveOverseerTask } from './overseer-preferences.mjs';
import { mergeObservedPerformance } from '../src/dispatch/adaptive-worker-profile.mjs';

export function createAdaptiveOverseerLoop({ router, execute, observe = async () => null, performanceStore, workers = [], preferences } = {}) {
  if (!router?.select || typeof execute !== 'function') throw new TypeError('router.select and execute are required');
  const profiles = new Map(workers.map(worker => [worker.id, { ...worker }]));

  async function run({ missionId, message, task = {} } = {}) {
    const resolvedTask = resolveOverseerTask(task, preferences);
    const available = [...profiles.values()];
    const route = await router.select({ task: resolvedTask, workers: available });
    if (!route?.selected) return Object.freeze({ status: 'blocked', task: resolvedTask, route });

    const result = await execute({ missionId, message, task: resolvedTask, model: route.selected });
    const observation = await observe({ task: resolvedTask, route, result });
    if (observation && performanceStore) {
      performanceStore.record({ workerId: route.selected.id, ...observation });
      profiles.set(route.selected.id, mergeObservedPerformance(route.selected, observation));
    }
    return Object.freeze({ status: 'completed', task: resolvedTask, route, result, observation });
  }

  return Object.freeze({ run, profiles });
}
