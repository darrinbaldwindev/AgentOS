export function normaliseIntelligenceProfile(worker = {}) {
  return Object.freeze({
    ...worker,
    quality: {
      floor: worker.quality?.floor ?? 0,
      confidence: worker.quality?.confidence ?? 0,
    },
    estimated_cost: worker.estimated_cost ?? 0,
    estimated_tokens: worker.estimated_tokens ?? 0,
    estimated_latency_ms: worker.estimated_latency_ms ?? Infinity,
    capabilities: [...new Set(worker.capabilities ?? [])],
  });
}

export function meetsQuality(worker, requiredQuality = 0) {
  return (worker.quality?.floor ?? 0) >= requiredQuality;
}
