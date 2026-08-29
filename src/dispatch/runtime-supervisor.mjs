export function evaluateRuntime({ status, thresholds = {} }) {
  const maxConsecutiveErrors = thresholds.maxConsecutiveErrors ?? 3;
  const health = status?.health ?? {};
  const control = status?.control ?? {};

  if (control.killed === true) return { action: 'remain_killed', reason: 'runtime_killed' };
  if (control.paused === true) return { action: 'remain_paused', reason: 'runtime_paused' };
  if (health.status === 'degraded' && (health.consecutive_errors ?? 0) >= maxConsecutiveErrors) {
    return { action: 'pause', reason: 'repeated_poll_failures' };
  }
  if (health.status === 'degraded') return { action: 'observe', reason: 'transient_runtime_failure' };
  return { action: 'continue', reason: 'runtime_healthy' };
}
