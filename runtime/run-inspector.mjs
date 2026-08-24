// CORE-002 safe run inspection. Read-only summary only; no payload exposure or mutation.

function requireStore(store) {
  if (!store || typeof store.get !== 'function' || typeof store.list !== 'function') {
    throw new TypeError('store with get and list is required');
  }
}

export function inspectRun({ store, runId }) {
  requireStore(store);
  if (!runId) throw new TypeError('runId is required');

  const run = store.get('run', runId);
  if (!run) {
    const error = new Error(`Run not found: ${runId}`);
    error.code = 'RUN_NOT_FOUND';
    throw error;
  }

  const events = store.list('event')
    .filter((event) => event.runId === runId)
    .map((event) => event.eventType);
  const recommendation = store.list('artifact')
    .filter((artifact) => artifact.runId === runId && artifact.kind === 'overseer-recommendation')
    .at(-1);

  return Object.freeze({
    schemaVersion: 1,
    run: Object.freeze({
      id: run.id,
      workspaceId: run.workspaceId,
      agentId: run.agentId,
      status: run.status,
      recovered: run.recovered === true,
    }),
    eventTypes: Object.freeze([...events]),
    overseer: recommendation
      ? Object.freeze({
        present: true,
        severity: recommendation.severity,
        status: recommendation.status,
        ownerActionRequired: recommendation.ownerActionRequired === true,
      })
      : Object.freeze({ present: false }),
  });
}
