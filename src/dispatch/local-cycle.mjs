import { randomUUID } from 'node:crypto';
import { claimNextTask, advanceTask } from './worker.mjs';
import { validateProjectOverseerResponse } from '../../scripts/validate-project-overseer-response.mjs';

export function runLocalProjectOverseerCycle(store, receiver, authorityPolicy, inspect, act) {
  const queued = store.list().filter((task) => task.status === 'queued' && task.target === receiver);
  if (queued.length === 0) return { status: 'IDLE', response: null };

  const sourceTask = queued[0];
  const wakeTraceId = sourceTask.wake_trace_id ?? randomUUID();
  const candidates = store.list().map((candidate) => candidate.task_id === sourceTask.task_id ? { ...candidate, wake_trace_id: wakeTraceId, scheduler_wake_at: new Date().toISOString() } : candidate);
  const task = claimNextTask(candidates, receiver, authorityPolicy);
  if (!task) return { status: 'IDLE', response: null };
  store.replace(task);

  const started = { ...advanceTask(task, 'start'), system_heartbeat_at: new Date().toISOString() };
  store.replace(started);
  const inspection = inspect(started);
  const result = act(started, inspection);
  const evidence = result?.evidence ?? [];
  const usefulWork = (Array.isArray(result?.implemented) && result.implemented.length > 0) || (Array.isArray(result?.verification) && result.verification.length > 0) || evidence.length > 0;
  const progressed = usefulWork ? { ...started, last_useful_work_at: new Date().toISOString() } : started;

  let terminal;
  if (result?.status === 'blocked') terminal = advanceTask(progressed, 'block');
  else if (result?.status === 'escalated') terminal = advanceTask(progressed, 'escalate');
  else {
    const verifying = advanceTask(progressed, 'verify');
    store.replace(verifying);
    terminal = advanceTask(verifying, { type: 'complete', evidence });
  }
  store.replace(terminal);

  const response = {
    mission_id: started.task_id,
    source_agent: result?.source_agent ?? receiver,
    wake_trace_id: wakeTraceId,
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
