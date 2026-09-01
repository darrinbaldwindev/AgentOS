import { claimNextTask, advanceTask } from './worker.mjs';
import { validateProjectOverseerResponse } from '../../scripts/validate-project-overseer-response.mjs';

/** Execute one fail-closed wake cycle against a repository-backed dispatch adapter. */
export async function runGitHubWakeCycle(adapter, receiver, authorityPolicy, inspect, act, leaseStore, now = Date.now()) {
  if (!leaseStore) throw new Error('leaseStore is required');
  const audit = await adapter.readAuditEvents();
  const queued = (audit ?? []).filter((event) => event?.type === 'dispatch.created' && event.task?.status === 'queued' && event.task.target === receiver);
  if (queued.length === 0) return { status: 'IDLE', response: null };

  const candidate = queued[0].task;
  const current = await adapter.readTask(candidate.task_id);
  if (!current || current.status !== 'queued') return { status: 'IDLE', response: null };

  const lease = leaseStore.acquire(current.task_id, receiver, now);
  if (!lease.acquired) return { status: 'IDLE', response: null, reason: lease.reason };

  try {
    const claimed = claimNextTask([current], receiver, authorityPolicy);
    if (!claimed) return { status: 'IDLE', response: null };
    await adapter.writeTask({ ...claimed, lease: lease.lease });
    await adapter.appendAuditEvent({ type: 'dispatch.claimed', task_id: claimed.task_id, responder: receiver, lease_owner: receiver, created_at: new Date(now).toISOString() });

    const working = advanceTask({ ...claimed, lease: lease.lease }, 'start');
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
    await adapter.appendAuditEvent({ type: 'dispatch.response', task_id: terminal.task_id, response, lease_owner: receiver, created_at: response.completed_at });
    return { status: response.status, response, task: terminal };
  } finally {
    leaseStore.release(current.task_id, receiver);
  }
}
