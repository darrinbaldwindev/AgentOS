export const TELEMETRY_LEVELS = Object.freeze(['none', 'performance', 'improvement']);

export function createTelemetryConsent(level = 'none') {
  if (!TELEMETRY_LEVELS.includes(level)) throw new Error('invalid telemetry consent level');
  return Object.freeze({ level, enabled: level !== 'none' });
}

export function sanitiseTelemetry(event = {}) {
  return Object.freeze({
    schemaVersion: 1,
    taskCategory: event.taskCategory ?? 'unknown',
    workerType: event.workerType ?? 'unknown',
    workerId: event.workerId ?? undefined,
    quality: event.quality ?? undefined,
    confidence: event.confidence ?? undefined,
    cost: event.cost ?? undefined,
    latencyMs: event.latencyMs ?? undefined,
    tokens: event.tokens ?? undefined,
    success: event.success ?? undefined,
    retries: event.retries ?? undefined,
  });
}

export function shouldTransmit(consent, eventLevel = 'performance') {
  const order = { none: 0, performance: 1, improvement: 2 };
  return !!consent?.enabled && order[consent.level] >= order[eventLevel];
}
