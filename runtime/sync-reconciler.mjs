// CORE-001: conservative reconciliation planner. It proposes actions; it does not mutate files.

import { createSyncPolicy } from './sync-policy.mjs';

export function createSyncReconciler({ policy = createSyncPolicy() } = {}) {
  function plan(localManifest = [], remoteManifest = []) {
    const local = new Map(localManifest.map((item) => [item.path, item]));
    const remote = new Map(remoteManifest.map((item) => [item.path, item]));
    const paths = new Set([...local.keys(), ...remote.keys()]);
    const actions = [];

    for (const path of paths) {
      const l = local.get(path);
      const r = remote.get(path);
      if (l && !r) actions.push({ path, action: policy.decision(path, l.kind).requiresReview ? 'review' : 'push-local' });
      else if (!l && r) actions.push({ path, action: policy.decision(path, r.kind).requiresReview ? 'review' : 'pull-remote' });
      else if (l?.sha !== r?.sha && l?.hash !== r?.hash) actions.push({ path, action: 'review-conflict' });
    }
    return Object.freeze(actions.map(Object.freeze));
  }
  return Object.freeze({ plan });
}
