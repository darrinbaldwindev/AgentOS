import { recoverStaleTask } from './recovery.mjs';
import { runWithContinuation } from './continuation-runner.mjs';

export async function pollDispatch({ tasks, receiver, authorityPolicy, store, execute, nextTask, now = Date.now(), claimTimeoutMs }) {
  const recovered = tasks.map(task => recoverStaleTask(task, now, claimTimeoutMs));
  for (const task of recovered) {
    if (task.status !== 'queued' || task.target !== receiver) continue;
    const result = await runWithContinuation({
      tasks: [task], receiver, authorityPolicy, store, execute, nextTask,
    });
    return { ...result, recovered };
  }
  return { completed: null, next: null, recovered };
}
