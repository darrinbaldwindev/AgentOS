// CORE-001 hardening: append-only lineage for a mission across provider handoffs.

export function createMissionLineage({ store }) {
  if (!store) throw new TypeError('store is required');

  function record(runId, type, data = {}) {
    const run = store.get('run', runId);
    if (!run) throw new Error(`Run not found: ${runId}`);
    return store.create('event', {
      runId,
      eventType: `lineage.${type}`,
      missionId: run.missionId ?? runId,
      ...data,
    });
  }

  function history(runId) {
    return Object.freeze(store.list('event').filter((event) => event.runId === runId));
  }

  function handoff(runId, fromProvider, toProvider, snapshotId) {
    return record(runId, 'handoff', { fromProvider, toProvider, snapshotId });
  }

  return Object.freeze({ record, history, handoff });
}
