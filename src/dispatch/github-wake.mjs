import { claimNextTask, advanceTask } from './worker.mjs';
import { validateProjectOverseerResponse } from '../../scripts/validate-project-overseer-response.mjs';

/**
 * Execute one fail-closed wake cycle against a repository-backed dispatch adapter.
 * Callers supply repository I/O and bounded inspection/action functions.
 */
export async function runGitHubWakeCycle(adapter, receiver, authorityPolicy, inspect, act) {
  const audit = await adapter.readAuditEvents();
  const queued = [];
  for (const event of audit ?? []) {
    if (event?.type === 'dispatch.created' && event.task?.status === 'queued' && event.task.target === receiver) queued.push(event.task);
  }
  if (queued.length === 0) return { status: 'IDLE', response: null };

  const candidate = queued[0];
  const current = await adapter.readTask(candidate.task_id);
  if (!current || current.status !== 'queued') return { status: 'IDLE', response: null };

  const claimed = claimNextTask([current], receiver, authorityPolicy);
  if (!claimed) return { status: 'IDLE', response: null };
  await adapter.writeTask(claimed);
  await adapter.appendAuditEvent({ type: 'dispatch.claimed', task_id: claimed.task_id, responder: receiver, created_at: new Date().toISOString() });

  const working = advanceTask(claimed, 'start');
  await adapter.writeTask(working);
  const inspection = await inspect(working);
  const result = await act(working, inspection);
  const evidence = result?.evidence ?? [];

  let terminal;
  if (result?.status === 'blocked') terminal = advanceTask(working, 'block');
  else if (result?.status === 'escalated') terminal = advanceTask(working, 'escalate');
  else {
    const verifying = advanceTask(working, 'verify');
    await adapter.writeTask(verifying);
    terminal = advanceTask(verifying, { type: 'complete', evidence });
  }
  await adapter.writeTask(terminal);

  const response = {
    mission_id: terminal.task_id,
    status: terminal.status === 'completed' ? 'COMPLETED' : terminal.status === 'blocked' ? 'BLOCKED' : 'ESCALATED',
    started_at: working.created_at,
    completed_at: new Date().toISOString(),
    repository_commit: result?.repository_commit ?? 'unknown',
    inspection_summary: inspection?.summary ?? 'inspection completed',
    work_claimed: [working.objective],
    work_implemented: result?.implemented ?? [],
    verification: result?.verification ?? [],
    evidence,
    blockers: result?.blockers ?? [],
    escalations: result?.escalations ?? [],
    next_action: result?.next_action ?? 'await upstream reconciliation'
  };
  const validation = validateProjectOverseerResponse(response);
  if (!validation.valid) throw new Error(`invalid generated response: ${validation.errors.join('; ')}`);

  await adapter.appendAuditEvent({ type: 'dispatch.response', task_id: terminal.task_id, response, created_at: response.completed_at });
  return { status: response.status, response, task: terminal };
}
