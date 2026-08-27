import { claimTask, transitionTask, validateDispatchTask } from './dispatch.mjs';

/**
 * Find the first queued task addressed to receiver and claim it.
 * Persistence is deliberately supplied by the caller so the worker remains
 * independent of GitHub, a database, or a particular scheduler.
 */
export function claimNextTask(tasks, receiver) {
  for (const task of tasks) {
    if (task.status !== 'queued' || task.target !== receiver) continue;
    validateDispatchTask(task, { issuer: task.issuer, target: receiver });
    return claimTask(task, receiver);
  }
  return null;
}

export function advanceTask(task, action) {
  if (action === 'start') return transitionTask(task, 'working');
  if (action === 'verify') return transitionTask(task, 'verification');
  if (action.type === 'complete') return transitionTask(task, 'completed', action.evidence);
  if (action === 'block') return transitionTask(task, 'blocked');
  if (action === 'escalate') return transitionTask(task, 'escalated');
  throw new Error(`unknown worker action: ${String(action)}`);
}
