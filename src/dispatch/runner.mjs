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

function assertResultCorrelation(task, result) {
  if (!result || typeof result !== 'object') return;
  if (result.task_id != null && result.task != null && result.task_id !== result.task) {
    throw new Error(`executor result task aliases conflict: ${task.task_id}`);
  }
  const resultTaskId = result.task_id ?? result.task;
  if (resultTaskId != null && resultTaskId !== task.task_id) {
    throw new Error(`executor result task correlation mismatch: ${task.task_id}`);
  }
  if (result.mission_id != null && result.mission_id !== task.mission_id) {
    throw new Error(`executor result mission correlation mismatch: ${task.mission_id}`);
  }
}

export async function runNextTask({ tasks, receiver, authorityPolicy, store, execute }) {
  if (!Array.isArray(tasks)) throw new Error('tasks must be an array');
  if (!store?.writeTask) throw new Error('store.writeTask is required');
  if (typeof execute !== 'function') throw new Error('execute is required');

  const claimed = claimNextTask(tasks, receiver, authorityPolicy);
  if (!claimed) return null;

  let current = claimed;
  let expectedSha = claimed.dispatch_sha ?? claimed.sha ?? null;
  expectedSha = (await persist(store, current, expectedSha))?.sha ?? expectedSha;

  try {
    current = advanceTask(current, 'start');
    expectedSha = (await persist(store, current, expectedSha))?.sha ?? expectedSha;

    const result = await execute(current);
    assertResultCorrelation(current, result);

    current = advanceTask(current, 'verify');
    expectedSha = (await persist(store, current, expectedSha))?.sha ?? expectedSha;

    const verification = current;
    current = advanceTask(current, { type: 'complete', evidence: result });
    try {
      await persist(store, current, expectedSha);
    } catch (error) {
      // The completed state was not durably written. Keep the last durable
      // verification state so the failure can still be persisted as an
      // escalation instead of becoming trapped behind a local terminal state.
      current = verification;
      throw error;
    }
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
