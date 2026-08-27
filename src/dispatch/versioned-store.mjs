export function createVersionedStore({ readVersioned, writeIfUnchanged }) {
  if (typeof readVersioned !== 'function' || typeof writeIfUnchanged !== 'function') {
    throw new Error('readVersioned and writeIfUnchanged are required');
  }

  return {
    async readTask(taskId) {
      return readVersioned(taskId);
    },

    async claimTask(task, nextTask) {
      const current = await readVersioned(task.task_id);
      if (!current || current.sha !== task.sha) {
        return { claimed: false, reason: 'version_conflict', current };
      }
      return writeIfUnchanged(task.task_id, current.sha, nextTask);
    },

    async writeTask(task, expectedSha = null) {
      const current = await readVersioned(task.task_id);
      if (expectedSha !== null && (!current || current.sha !== expectedSha)) {
        return { written: false, reason: 'version_conflict', current };
      }
      return writeIfUnchanged(task.task_id, current?.sha ?? null, task);
    },
  };
}
