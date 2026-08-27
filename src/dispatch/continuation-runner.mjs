import { runNextTask } from './runner.mjs';
import { createContinuation } from './continuation.mjs';

/**
 * Run one task and, when the executor supplies an authorised continuation,
 * persist that child task. The child remains queued for the next poll cycle.
 */
export async function runWithContinuation({ tasks, receiver, authorityPolicy, store, execute, nextTask }) {
  const completed = await runNextTask({ tasks, receiver, authorityPolicy, store, execute });
  if (!completed || typeof nextTask !== 'function') return { completed, next: null };

  const candidate = nextTask(completed);
  if (!candidate) return { completed, next: null };

  const child = createContinuation(completed, candidate);
  await store.writeTask(child);
  return { completed, next: child };
}
