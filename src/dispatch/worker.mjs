import { claimTask, transitionTask, validateDispatchTask } from './dispatch.mjs';
import { authoriseDispatch } from './authority.mjs';

/**
 * Find the first queued task addressed to receiver, validate its authority,
 * and claim it. Persistence is supplied by the caller.
 */
export function claimNextTask(tasks, receiver, authorityPolicy) {
  for (const task of tasks) {
    if (task.status !== 'queued' || task.target !== receiver) continue;
    validateDispatchTask(task, { issuer: task.issuer, target: receiver });
    authoriseDispatch(task, authorityPolicy);
    return claimTask(task, receiver);
  }
  return null;
}

export function advanceTask(task, action) {
  if (action === 'start') return transitionTask(task, 'working');
  if (action === 'verify') return transitionTask(task, 'verification');
  if (action?.type === 'complete') return transitionTask(task, 'completed', action.evidence);
  if (action === 'block') return transitionTask(task, 'blocked');
  if (action === 'escalate') return transitionTask(task, 'escalated');
  throw new Error(`unknown worker action: ${String(action)}`);
}
