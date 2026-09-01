import { claimNextTask, advanceTask } from './worker.mjs';
import { validateProjectOverseerResponse } from '../../scripts/validate-project-overseer-response.mjs';

export function runLocalProjectOverseerCycle(store, receiver, authorityPolicy, inspect, act) {
  const queued = store.list().filter((task) => task.status === 'queued' && task.target === receiver);
  if (queued.length === 0) return { status: 'IDLE', response: null };

  const task = claimNextTask(store.list(), receiver, authorityPolicy);
  if (!task) return { status: 'IDLE', response: null };
  store.replace(task);

  const started = advanceTask(task, 'start');
  store.replace(started);
  const inspection = inspect(started);
  const result = act(started, inspection);
  const evidence = result?.evidence ?? [];

  let terminal;
  if (result?.status === 'blocked') terminal = advanceTask(started, 'block');
  else if (result?.status === 'escalated') terminal = advanceTask(started, 'escalate');
  else {
    const verifying = advanceTask(started, 'verify');
    store.replace(verifying);
    terminal = advanceTask(verifying, { type: 'complete', evidence });
  }
  store.replace(terminal);

  const response = {
    mission_id: started.task_id,
    status: terminal.status === 'completed' ? 'COMPLETED' : terminal.status === 'blocked' ? 'BLOCKED' : 'ESCALATED',
    started_at: started.created_at,
    completed_at: new Date().toISOString(),
    repository_commit: result?.repository_commit ?? 'local-unknown',
    inspection_summary: inspection?.summary ?? 'inspection completed',
    work_claimed: [started.objective],
    work_implemented: result?.implemented ?? [],
    verification: result?.verification ?? [],
    evidence,
    blockers: result?.blockers ?? [],
    escalations: result?.escalations ?? [],
    next_action: result?.next_action ?? 'await upstream reconciliation'
  };

  const validation = validateProjectOverseerResponse(response);
  if (!validation.valid) throw new Error(`invalid generated response: ${validation.errors.join('; ')}`);
  return { status: response.status, response, task: terminal };
}
