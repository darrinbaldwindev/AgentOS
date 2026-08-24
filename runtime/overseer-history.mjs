// Overseer audit history query boundary. Audits remain reviewable and append-only.

export function createOverseerHistory({ store }) {
  if (!store) throw new TypeError('store is required');

  function list(runId = null) {
    return Object.freeze(
      store.list('artifact')
        .filter((artifact) => artifact.kind === 'overseer-recommendation' && (runId === null || artifact.runId === runId))
        .map((artifact) => Object.freeze({
          id: artifact.id,
          runId: artifact.runId,
          severity: artifact.severity,
          status: artifact.status,
          ownerActionRequired: artifact.ownerActionRequired,
        }))
    );
  }

  return Object.freeze({ list });
}
