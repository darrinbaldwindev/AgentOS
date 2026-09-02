import { randomUUID } from 'node:crypto';
import { claimNextTask, advanceTask } from './worker.mjs';
import { validateProjectOverseerResponse } from '../../scripts/validate-project-overseer-response.mjs';

/** Execute one fail-closed wake cycle against a repository-backed dispatch adapter. */
export async function runGitHubWakeCycle(adapter, receiver, authorityPolicy, inspect, act, leaseStore, idempotencyStore, now = Date.now()) {
  if (!leaseStore || !idempotencyStore) throw new Error('leaseStore and idempotencyStore are required');
  const audit = await adapter.readAuditEvents();
  const queued = (audit ?? []).filter((event) => event?.type === 'dispatch.created' && event.task?.status === 'queued' && event.task.target === receiver);
  if (queued.length === 0) return { status: 'IDLE', response: null };

  const candidate = queued[0].task;
  const current = await adapter.readTask(candidate.task_id);
  if (!current || current.status !== 'queued') return { status: 'IDLE', response: null };

  const wakeTraceId = current.wake_trace_id ?? randomUUID();
  const leasedTask = { ...current, wake_trace_id: wakeTraceId, scheduler_wake_at: new Date(now).toISOString() };
  const lease = await leaseStore.acquire(current.task_id, receiver, now);
  if (!lease.acquired) return { status: 'IDLE', response: null, reason: lease.reason };
  const idempotency = await idempotencyStore.begin(current.task_id, now);
  if (!idempotency.accepted) {
    await leaseStore.release(current.task_id, receiver);
    return { status: 'IDLE', response: null, reason: idempotency.reason };
  }

  try {
    const claimed = claimNextTask([leasedTask], receiver, authorityPolicy);
    if (!claimed) return { status: 'IDLE', response: null };
    await adapter.writeTask({ ...claimed, lease: lease.lease });
    await adapter.appendAuditEvent({ type: 'dispatch.claimed', task_id: claimed.task_id, responder: receiver, lease_owner: receiver, wake_trace_id: wakeTraceId, created_at: new Date(now).toISOString() });

    const working = { ...advanceTask({ ...claimed, lease: lease.lease }, 'start'), system_heartbeat_at: new Date(now).toISOString() };
    await adapter.writeTask(working);
    const inspection = await inspect(working);
    const result = await act(working, inspection);
    const evidence = result?.evidence ?? [];
    const usefulWork = (Array.isArray(result?.implemented) && result.implemented.length > 0)
      || (Array.isArray(result?.verification) && result.verification.length > 0)
      || evidence.length > 0;
    const progressedWorking = usefulWork
      ? { ...working, last_useful_work_at: new Date(now).toISOString() }
      : working;

    let terminal;
    if (result?.status === 'blocked') terminal = advanceTask(progressedWorking, 'block');
    else if (result?.status === 'escalated') terminal = advanceTask(progressedWorking, 'escalate');
    else {
      const verifying = advanceTask(progressedWorking, 'verify');
      await adapter.writeTask(verifying);
      terminal = advanceTask(verifying, { type: 'complete', evidence });
    }
    await adapter.writeTask(terminal);

    const response = {
      mission_id: terminal.task_id,
      source_agent: result?.source_agent ?? receiver,
      wake_trace_id: wakeTraceId,
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
    const completion = await idempotencyStore.complete(terminal.task_id, response, Date.parse(response.completed_at));
    if (!completion.completed) throw new Error(`idempotent completion rejected: ${completion.reason}`);
    await adapter.appendAuditEvent({ type: 'dispatch.response', task_id: terminal.task_id, source_agent: response.source_agent, wake_trace_id: wakeTraceId, response, lease_owner: receiver, created_at: response.completed_at });
    return { status: response.status, response, task: terminal };
  } finally {
    await leaseStore.release(current.task_id, receiver);
  }
}
