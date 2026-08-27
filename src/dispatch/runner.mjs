import { claimNextTask, advanceTask } from './worker.mjs';
import { safeWriteTask } from './safe-write.mjs';

async function persist(store, task, expectedSha = null) {
  const result = await safeWriteTask({ store, task, expectedSha });
  if (!result.ok) {
    const error = new Error(result.outcome.action === 'reconcile'
      ? `persistence conflict requires reconciliation: ${task.task_id}`
      : `persistence failure: ${task.task_id}`);
    error.outcome = result.outcome;
    throw error;
  }
  return result.result;
}

export async function runNextTask({ tasks, receiver, authorityPolicy, store, execute }) {
  if (!Array.isArray(tasks)) throw new Error('tasks must be an array');
  if (!store?.writeTask) throw new Error('store.writeTask is required');
  if (typeof execute !== 'function') throw new Error('execute is required');

  const claimed = claimNextTask(tasks, receiver, authorityPolicy);
  if (!claimed) return null;

  let current = claimed;
  let expectedSha = claimed.sha ?? null;
  await persist(store, current, expectedSha);

  try {
    current = advanceTask(current, 'start');
    expectedSha = (await persist(store, current, expectedSha))?.sha ?? expectedSha;

    const result = await execute(current);

    current = advanceTask(current, 'verify');
    expectedSha = (await persist(store, current, expectedSha))?.sha ?? expectedSha;

    current = advanceTask(current, { type: 'complete', evidence: result });
    await persist(store, current, expectedSha);
    return current;
  } catch (error) {
    try {
      current = advanceTask(current, 'escalate');
      await persist(store, { ...current, error: { name: error.name, message: error.message } }, expectedSha);
    } catch (persistenceError) {
      error.persistenceError = { name: persistenceError.name, message: persistenceError.message };
      error.persistenceOutcome = persistenceError.outcome;
    }
    throw error;
  }
}
