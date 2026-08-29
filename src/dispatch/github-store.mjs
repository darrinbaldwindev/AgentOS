import { createHash } from 'node:crypto';

export function taskPath(taskId) {
  return `.agentos/dispatch/tasks/${taskId}.json`;
}

export function auditPath() {
  return '.agentos/dispatch/audit/events.jsonl';
}

export function serialiseTask(task) {
  return `${JSON.stringify(task, null, 2)}\n`;
}

export function taskFingerprint(task) {
  return createHash('sha256').update(serialiseTask(task)).digest('hex');
}

export function createRepositoryDispatchAdapter({ read, write, append }) {
  if (typeof read !== 'function' || typeof write !== 'function') {
    throw new Error('read and write functions are required');
  }
  if (typeof append !== 'function') throw new Error('append function is required for audit persistence');

  return {
    async readTask(taskId) {
      return read(taskPath(taskId));
    },
    async writeTask(task, expectedSha = null) {
      return write(taskPath(task.task_id), serialiseTask(task), {
        expectedSha,
        fingerprint: taskFingerprint(task),
      });
    },
    async appendAuditEvent(event) {
      return append(auditPath(), `${JSON.stringify(event)}\n`);
    },
  };
}
