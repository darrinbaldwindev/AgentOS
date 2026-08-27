/**
 * Return the next authorised task produced by completed work.
 * A continuation is accepted only when it explicitly targets the same
 * receiver and requests capabilities already granted by the parent task.
 */
export function deriveNextTask(completedTask, nextTask, receiver) {
  if (completedTask.status !== 'completed') throw new Error('continuation requires completed task');
  if (!nextTask || typeof nextTask !== 'object') throw new Error('next task is required');
  if (nextTask.target !== receiver) throw new Error('continuation target mismatch');

  const granted = new Set(completedTask.authority?.granted_capabilities ?? []);
  for (const capability of nextTask.authority?.granted_capabilities ?? []) {
    if (!granted.has(capability)) {
      throw new Error(`continuation exceeds parent authority: ${capability}`);
    }
  }

  return {
    ...nextTask,
    status: 'queued',
    dependencies: [...(nextTask.dependencies ?? []), completedTask.task_id],
    parent_task_id: completedTask.task_id,
  };
}
