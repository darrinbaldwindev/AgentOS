// SCHEDULER-TEST-002: deterministic scheduled-trigger adapter.
// The scheduler is only the clock. Manual and scheduled test invocations use
// the same governed GitHub wake contract and fail-closed dispatch primitives.

import { runGitHubWakeCycle } from '../src/dispatch/github-wake.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { LeaseStore } from '../src/dispatch/lease-store.mjs';
import { IdempotencyStore } from '../src/dispatch/idempotency.mjs';

const RECEIVER = 'agentos:project-overseer';
const ISSUER = 'agentos:overseer';
const WORKER = 'agentos:scheduler-test-worker';
const CAPABILITY = 'repository:read';

function createAdapter(task) {
  let current = structuredClone(task);
  const events = [{ type: 'dispatch.created', task: structuredClone(task) }];
  return {
    async readTask() { return structuredClone(current); },
    async writeTask(next) { current = structuredClone(next); },
    async readAuditEvents() { return structuredClone(events); },
    async appendAuditEvent(event) { events.push(structuredClone(event)); },
  };
}

export async function runScheduledWakeTest({ now = Date.now(), trigger = 'scheduled' } = {}) {
  const runToken = `${new Date(now).toISOString().replace(/[-:.TZ]/g, '')}-${process.pid}`;
  const task = {
    task_id: `scheduler-wake-${runToken}`,
    mission_id: `mission:scheduler-wake-${runToken}`,
    project_id: 'agentos-scheduler-test',
    issuer: ISSUER,
    target: RECEIVER,
    objective: 'exercise one governed scheduled Project Overseer wake cycle',
    priority: 'high',
    scope: ['scheduler-test'],
    constraints: ['test-only', 'no production side effects'],
    consent_mode: 'PRE_AUTHORIZED',
    required_capabilities: [CAPABILITY],
    authority: { action: 'execute', granted_capabilities: [CAPABILITY] },
    acceptance_criteria: ['registered test worker executes', 'task and response share wake trace', 'idempotent completion recorded'],
    status: 'queued',
    created_at: new Date(now).toISOString(),
    wake_trace_id: `scheduler-wake-trace-${runToken}`,
    scheduler_wake_at: new Date(now).toISOString(),
    trigger,
  };
  const adapter = createAdapter(task);
  const policy = createAuthorityPolicy({ issuers: [ISSUER], capabilities: [CAPABILITY] });
  const leaseStore = new LeaseStore();
  const idempotencyStore = new IdempotencyStore();

  const result = await runGitHubWakeCycle(
    adapter,
    RECEIVER,
    policy,
    async () => ({ summary: 'scheduler test adapter inspected queued task' }),
    async (started) => ({
      source_agent: WORKER,
      implemented: ['executed the canonical governed GitHub wake contract through the scheduler test adapter'],
      verification: [
        'authority and capability policy accepted the task',
        'lease and idempotency controls accepted the wake',
        'task progressed through claim → working → verification → completed',
        'worker provenance preserved',
      ],
      evidence: [`scheduler-trigger:${trigger}`, `task:${started.task_id}`, `wake-trace:${started.wake_trace_id}`],
      repository_commit: 'scheduler-test-adapter',
    }),
    leaseStore,
    idempotencyStore,
    now,
  );

  if (result.status !== 'COMPLETED') throw new Error(`SCHEDULED_WAKE_NOT_COMPLETED:${result.status}`);
  if (result.task.wake_trace_id !== result.response.wake_trace_id) throw new Error('WAKE_TRACE_CORRELATION_FAILED');
  if (result.response.source_agent !== WORKER) throw new Error('WORKER_PROVENANCE_FAILED');

  return {
    status: 'GREEN',
    trigger,
    task_id: result.task.task_id,
    wake_trace_id: result.response.wake_trace_id,
    source_agent: result.response.source_agent,
    task_status: result.task.status,
    response_status: result.response.status,
    evidence: result.response.evidence,
  };
}

if (process.argv[1]?.endsWith('scheduled-wake-test.mjs')) {
  runScheduledWakeTest({ trigger: process.env.AGENTOS_TRIGGER ?? 'scheduled' })
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(JSON.stringify({ status: 'FAILED', error: error.message }));
      process.exitCode = 1;
    });
}
