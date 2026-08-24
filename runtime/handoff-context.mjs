// CORE-001 hardening: package a safe context snapshot with explicit handoff lineage.

import { createContextSnapshot } from './context-snapshot.mjs';

export function createHandoffContext({ store, runId, mission, providerId, status, completedSteps, variables, fromProvider, toProvider }) {
  const snapshot = createContextSnapshot({ runId, mission, providerId: toProvider ?? providerId, status, completedSteps, variables });
  const artifact = store.create('artifact', {
    runId,
    kind: 'handoff-context',
    status: 'ready',
    fromProvider: fromProvider ?? null,
    toProvider: toProvider ?? providerId ?? null,
    snapshot,
  });
  store.create('event', {
    runId,
    eventType: 'context.handoff.created',
    fromProvider: fromProvider ?? null,
    toProvider: toProvider ?? providerId ?? null,
    artifactId: artifact.id,
  });
  return Object.freeze({ artifactId: artifact.id, snapshot });
}
