import { assertPersistenceAdapter } from './persistence.mjs';

/** Adapt the async production persistence contract to the wake-cycle store API. */
export function createProductionPersistenceStores(adapter) {
  assertPersistenceAdapter(adapter);
  return {
    acquire: (...args) => adapter.acquireLease(...args),
    renew: (...args) => adapter.renewLease(...args),
    release: (...args) => adapter.releaseLease(...args),
    async begin(taskId, now = Date.now()) {
      if (!taskId) return { accepted: false, reason: 'invalid_task_id' };
      const existing = await adapter.getCompletion(taskId);
      if (existing) return { accepted: false, reason: 'already_completed', record: existing };
      return { accepted: true, task_id: taskId, started_at: now };
    },
    async complete(taskId, response) {
      if (!taskId || !response) return { completed: false, reason: 'invalid_completion' };
      const result = await adapter.putCompletion(taskId, response);
      if (result.stored) return { completed: true, record: { task_id: taskId, response: structuredClone(response) } };
      return { completed: false, reason: result.existing ? 'already_completed' : 'completion_conflict', record: result.existing };
    }
  };
}
