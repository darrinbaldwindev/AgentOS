export function mergeObservedPerformance(worker, observation, smoothing = 0.25) {
  const s = Math.max(0, Math.min(1, smoothing));
  const blend = (prior, observed) => prior == null ? observed : prior * (1 - s) + observed * s;
  return {
    ...worker,
    quality: {
      ...(worker.quality ?? {}),
      floor: blend(worker.quality?.floor, observation.quality),
      confidence: blend(worker.quality?.confidence, observation.confidence),
    },
    estimated_cost: blend(worker.estimated_cost, observation.cost),
    estimated_latency_ms: blend(worker.estimated_latency_ms, observation.latencyMs),
    estimated_tokens: blend(worker.estimated_tokens, observation.tokens ?? worker.estimated_tokens ?? 0),
  };
}

export function shouldUseObservation({ observedQuality = 0, requiredQuality = 0, confidence = 0 } = {}) {
  return observedQuality >= requiredQuality && confidence >= 0.8;
}
