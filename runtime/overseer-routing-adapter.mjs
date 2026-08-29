import { normaliseIntelligenceProfile } from '../src/dispatch/intelligence-profile.mjs';
import { chooseQualityAwareWorker } from '../src/dispatch/quality-aware-router.mjs';

export function createOverseerRoutingAdapter({ workers = [], governor = null } = {}) {
  const profiles = workers.map(normaliseIntelligenceProfile);

  return Object.freeze({
    async select({ task = {} } = {}) {
      const result = chooseQualityAwareWorker({ workers: profiles, task, governor });
      if (!result.worker) return { selected: null, reason: result.reason };
      return { selected: result.worker, reason: result.reason, estimate: result.estimate };
    },
  });
}
