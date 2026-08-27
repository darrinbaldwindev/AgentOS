import { claimNextTask, advanceTask } from './worker.mjs';

/**
 * Run one authorised dispatch task using an injected executor and persistence
 * adapter. The executor owns the actual work; the runner owns lifecycle state.
 */
export async function runNextTask({ tasks, receiver, authorityPolicy, store, execute }) {
  if (!Array.isArray(tasks)) throw new Error('tasks must be an array');
  if (!store?.writeTask) throw new Error('store.writeTask is required');
  if (typeof execute !== 'function') throw new Error('execute is required');

  const claimed = claimNextTask(tasks, receiver, authorityPolicy);
  if (!claimed) return null;

  let current = claimed;
  await store.writeTask(current);

  try {
    current = advanceTask(current, 'start');
    await store.writeTask(current);

    const result = await execute(current);

    current = advanceTask(current, 'verify');
    await store.writeTask(current);

    current = advanceTask(current, { type: 'complete', evidence: result });
    await store.writeTask(current);
    return current;
  } catch (error) {
    current = advanceTask(current, 'escalate');
    current = { ...current, error: { name: error.name, message: error.message } };
    await store.writeTask(current);
    throw error;
  }
}
