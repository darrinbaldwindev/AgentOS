// CORE-001 hardening: explicit pause/resume lifecycle for a run.

export function createPauseResumeController({ store }) {
  if (!store) throw new TypeError('store is required');

  function pause(runId, reason = 'operator-requested') {
    const run = store.get('run', runId);
    if (!run) throw new Error(`Run not found: ${runId}`);
    if (!['running', 'queued'].includes(run.status)) throw new Error(`Run cannot be paused from ${run.status}`);
    const updated = store.update('run', runId, { status: 'paused', pauseReason: reason });
    store.create('event', { runId, eventType: 'run.paused', reason });
    return updated;
  }

  function resume(runId) {
    const run = store.get('run', runId);
    if (!run) throw new Error(`Run not found: ${runId}`);
    if (run.status !== 'paused') throw new Error(`Run cannot be resumed from ${run.status}`);
    const updated = store.update('run', runId, { status: 'running', pauseReason: null });
    store.create('event', { runId, eventType: 'run.resumed' });
    return updated;
  }

  return Object.freeze({ pause, resume });
}
