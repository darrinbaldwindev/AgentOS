// CORE-001: compare local and GitHub manifests without mutating either side.

export function detectSyncDrift({ localManifest = [], remoteManifest = [] }) {
  const local = new Map(localManifest.map((item) => [item.path, item.sha ?? item.hash ?? null]));
  const remote = new Map(remoteManifest.map((item) => [item.path, item.sha ?? item.hash ?? null]));
  const paths = new Set([...local.keys(), ...remote.keys()]);
  const drift = [];

  for (const path of paths) {
    const localHash = local.get(path);
    const remoteHash = remote.get(path);
    if (!local.has(path)) drift.push({ path, type: 'remote-only' });
    else if (!remote.has(path)) drift.push({ path, type: 'local-only' });
    else if (localHash !== remoteHash) drift.push({ path, type: 'modified' });
  }

  return Object.freeze({
    clean: drift.length === 0,
    drift: Object.freeze(drift.map(Object.freeze)),
    requiresReview: drift.some((item) => item.type === 'modified'),
  });
}
