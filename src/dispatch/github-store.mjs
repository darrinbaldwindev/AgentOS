import { createHash } from 'node:crypto';

export function taskPath(taskId) {
  return `.agentos/dispatch/tasks/${taskId}.json`;
}

export function serialiseTask(task) {
  return `${JSON.stringify(task, null, 2)}\n`;
}

export function taskFingerprint(task) {
  return createHash('sha256').update(serialiseTask(task)).digest('hex');
}

/**
 * Adapter contract for a repository-backed implementation.
 * The actual GitHub transport is injected by the caller so credentials and
 * write policy remain outside the dispatch domain.
 */
export function createRepositoryDispatchAdapter({ read, write }) {
  if (typeof read !== 'function' || typeof write !== 'function') {
    throw new Error('read and write functions are required');
  }
  return {
    async readTask(taskId) {
      return read(taskPath(taskId));
    },
    async writeTask(task) {
      return write(taskPath(task.task_id), serialiseTask(task), {
        fingerprint: taskFingerprint(task),
      });
    },
  };
}
