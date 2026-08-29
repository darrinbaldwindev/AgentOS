export function createWorkerPerformanceStore() {
  const observations = new Map();

  function record({ workerId, quality, confidence = 0, cost = 0, latencyMs = 0, retries = 0, success = true } = {}) {
    if (!workerId) throw new Error('workerId is required');
    const current = observations.get(workerId) ?? { workerId, runs: 0, successes: 0, qualityTotal: 0, confidenceTotal: 0, costTotal: 0, latencyTotal: 0, retriesTotal: 0 };
    current.runs += 1;
    current.successes += success ? 1 : 0;
    current.qualityTotal += quality ?? 0;
    current.confidenceTotal += confidence;
    current.costTotal += cost;
    current.latencyTotal += latencyMs;
    current.retriesTotal += retries;
    observations.set(workerId, current);
    return summary(workerId);
  }

  function summary(workerId) {
    const item = observations.get(workerId);
    if (!item) return null;
    return {
      workerId,
      runs: item.runs,
      successRate: item.successes / item.runs,
      averageQuality: item.qualityTotal / item.runs,
      averageConfidence: item.confidenceTotal / item.runs,
      averageCost: item.costTotal / item.runs,
      averageLatencyMs: item.latencyTotal / item.runs,
      averageRetries: item.retriesTotal / item.runs,
    };
  }

  function all() { return [...observations.keys()].map(summary); }
  return { record, summary, all };
}
