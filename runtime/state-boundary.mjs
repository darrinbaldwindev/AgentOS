// CORE-001: classify durable state by portability and sensitivity.

const CLASSES = Object.freeze({
  canonical: 'canonical',
  operational: 'operational',
  secret: 'secret',
});

export function classifyState({ kind, sensitivity = 'normal', portability = 'project' }) {
  if (sensitivity === 'secret') return CLASSES.secret;
  if (portability === 'local') return CLASSES.operational;
  if (['source', 'continuity', 'decision', 'audit'].includes(kind)) return CLASSES.canonical;
  return CLASSES.operational;
}

export function stateSyncDecision(input) {
  const classification = classifyState(input);
  return Object.freeze({
    classification,
    persist: true,
    sync: classification === CLASSES.canonical,
    localOnly: classification === CLASSES.operational,
    forbiddenToSync: classification === CLASSES.secret,
  });
}
