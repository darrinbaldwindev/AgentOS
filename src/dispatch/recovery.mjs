export function isStaleClaim(task, now, timeoutMs) {
  if (!['claimed', 'working', 'verification'].includes(task.status)) return false;
  if (!task.updated_at) return false;
  return now - new Date(task.updated_at).getTime() > timeoutMs;
}

export function recoverStaleTask(task, now = Date.now(), timeoutMs = 15 * 60 * 1000) {
  if (!isStaleClaim(task, now, timeoutMs)) return task;
  return {
    ...task,
    status: 'queued',
    recovery: {
      recovered_at: new Date(now).toISOString(),
      reason: 'stale_claim',
    },
    updated_at: new Date(now).toISOString(),
  };
}

export function createRunBudget({ maxTasks = 1, timeoutMs = 15 * 60 * 1000 } = {}) {
  if (!Number.isInteger(maxTasks) || maxTasks < 1) throw new Error('maxTasks must be a positive integer');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('timeoutMs must be positive');
  return { maxTasks, timeoutMs };
}

export function evaluateRecovery({ health, attempts = 0, maxAttempts = 2 } = {}) {
  const consecutiveErrors = health?.consecutive_errors ?? 0;
  if (consecutiveErrors === 0) return { action: 'none', reason: 'healthy' };
  if (attempts < maxAttempts) return { action: 'retry', reason: 'recovery_budget_available', attempts: attempts + 1 };
  return { action: 'escalate', reason: 'recovery_budget_exhausted', attempts };
}

export function applyRecoveryDecision({ control, decision, applyControl }) {
  if (!applyControl) throw new Error('applyControl is required');
  if (decision.action === 'escalate') return applyControl(control, 'pause');
  return control;
}
