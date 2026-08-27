export function classifyWriteResult(result) {
  if (result?.written === true || result?.claimed === true) return { kind: 'success' };
  if (result?.reason === 'version_conflict') {
    return { kind: 'conflict', recoverable: true, current: result.current ?? null };
  }
  return { kind: 'failure', recoverable: false, error: result?.error ?? 'persistence write failed' };
}

export function conflictOutcome(task, result, now = Date.now()) {
  const classification = classifyWriteResult(result);
  if (classification.kind !== 'conflict') return classification;
  return {
    kind: 'conflict',
    action: 'reconcile',
    task_id: task.task_id,
    detected_at: new Date(now).toISOString(),
    reason: 'repository_version_changed',
    current: classification.current,
  };
}
