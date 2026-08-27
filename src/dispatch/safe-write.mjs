import { classifyWriteResult, conflictOutcome } from './conflict.mjs';

export async function safeWriteTask({ store, task, expectedSha = null, now = Date.now() }) {
  const result = await store.writeTask(task, expectedSha);
  const outcome = classifyWriteResult(result);
  if (outcome.kind === 'success') return { ok: true, result };
  if (outcome.kind === 'conflict') {
    return { ok: false, outcome: conflictOutcome(task, result, now) };
  }
  return { ok: false, outcome: { kind: 'failure', action: 'escalate', task_id: task.task_id, error: outcome.error } };
}
