// CORE-001 persistence/synchronisation policy.
// Defines what may cross the local <-> GitHub boundary.

const SYNC_CLASSES = Object.freeze({
  source: 'sync',
  continuity: 'sync',
  configuration: 'review',
  runtime: 'local-only',
  secret: 'never-sync',
});

export function createSyncPolicy() {
  function classify(path, kind = 'source') {
    if (!path) throw new TypeError('path is required');
    const normalized = path.toLowerCase();
    if (kind === 'secret' || /(^|\/)(\.env|secrets?|credentials?)(\/|$)/.test(normalized)) return SYNC_CLASSES.secret;
    if (kind === 'runtime' || normalized.startsWith('.agentos/runtime/')) return SYNC_CLASSES['local-only'];
    if (kind === 'configuration') return SYNC_CLASSES.configuration;
    if (kind === 'continuity' || /(^|\/)(agentos_checkpoint|continuity_protocol|change.?log)/i.test(normalized)) return SYNC_CLASSES.continuity;
    return SYNC_CLASSES.source;
  }

  function decision(path, kind) {
    const classification = classify(path, kind);
    return Object.freeze({
      path,
      classification,
      syncable: classification === 'sync' || classification === 'review',
      requiresReview: classification === 'review',
    });
  }

  return Object.freeze({ classify, decision, classes: SYNC_CLASSES });
}
