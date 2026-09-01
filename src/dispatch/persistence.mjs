/**
 * Persistence contract for production lease/idempotency adapters.
 * Implementations must provide atomic conditional semantics in their backing store.
 */
export function assertPersistenceAdapter(adapter) {
  const required = ['acquireLease', 'renewLease', 'releaseLease', 'getCompletion', 'putCompletion'];
  const missing = required.filter((name) => typeof adapter?.[name] !== 'function');
  if (missing.length) throw new Error(`invalid persistence adapter; missing: ${missing.join(', ')}`);
  return adapter;
}

export function completionKey(taskId) {
  if (!taskId) throw new Error('taskId is required');
  return `dispatch:completion:${taskId}`;
}
