// CORE-001: Overseer audit for local/GitHub divergence.

import { detectSyncDrift } from './sync-drift.mjs';

export function auditSyncState({ store, runId, localManifest, remoteManifest }) {
  if (!store || !runId) throw new TypeError('store and runId are required');
  const result = detectSyncDrift({ localManifest, remoteManifest });
  if (result.clean) return Object.freeze({ ...result, severity: 'info', changeLogId: null });

  const severity = result.requiresReview ? 'warning' : 'info';
  const artifact = store.create('artifact', {
    runId,
    kind: 'overseer-recommendation',
    category: 'synchronization',
    severity,
    status: 'open',
    ownerActionRequired: result.requiresReview,
    recommendation: result.requiresReview
      ? 'Review local/GitHub divergence before reconciliation.'
      : 'Review one-sided files before synchronization.',
    drift: result.drift,
  });
  store.create('event', {
    runId,
    eventType: 'overseer.sync.audit.completed',
    severity,
    artifactId: artifact.id,
    driftCount: result.drift.length,
  });
  return Object.freeze({ ...result, severity, changeLogId: artifact.id });
}
