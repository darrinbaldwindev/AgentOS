function text(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${field} must be a non-empty string`);
  return value;
}

function iso(value, field) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new TypeError(`${field} must be date-time`);
  return new Date(parsed).toISOString();
}

/**
 * Normalize existing AgentOS execution/audit/CI evidence for Green Agent consumption.
 * Read-only: this function never writes state, schedules work, or grants authority.
 */
export function normalizeGreenEvidence({ packet, now = Date.now() } = {}) {
  if (!packet || typeof packet !== 'object') throw new TypeError('packet is required');
  if (!Number.isFinite(now)) throw new TypeError('now must be a finite timestamp');
  for (const field of ['project', 'repository', 'commit_sha']) text(packet[field], `packet.${field}`);

  const tasks = Array.isArray(packet.tasks) ? packet.tasks : [];
  const responses = Array.isArray(packet.responses) ? packet.responses : [];
  const audit = Array.isArray(packet.audit) ? packet.audit : [];
  const workflowRuns = Array.isArray(packet.workflow_runs) ? packet.workflow_runs : [];
  const expectedWakes = Array.isArray(packet.expected_wakes) ? packet.expected_wakes : [];

  const taskIds = new Set(tasks.map((task) => task?.task_id).filter(Boolean));
  const traces = new Set();
  const duplicateTraces = new Set();
  for (const item of [...tasks, ...responses, ...audit, ...expectedWakes]) {
    if (item?.wake_trace_id) {
      if (traces.has(item.wake_trace_id)) duplicateTraces.add(item.wake_trace_id);
      traces.add(item.wake_trace_id);
    }
  }

  const evidence = [];
  const mismatches = [];
  for (const run of workflowRuns) {
    const runCommit = run?.head_sha ?? run?.commit_sha;
    if (runCommit && runCommit !== packet.commit_sha) {
      mismatches.push({ type: 'WORKFLOW_COMMIT_MISMATCH', workflow_run_id: run.id ?? null, expected: packet.commit_sha, actual: runCommit });
    }
    evidence.push({ kind: 'workflow-run', id: String(run.id ?? ''), status: run.conclusion === 'success' ? 'verified' : 'insufficient_evidence', commit_sha: runCommit ?? null, captured_at: run.completed_at ?? run.updated_at ?? run.created_at ?? null });
  }

  for (const response of responses) {
    if (response?.task_id && !taskIds.has(response.task_id)) mismatches.push({ type: 'RESPONSE_TASK_MISMATCH', task_id: response.task_id });
    evidence.push({ kind: 'response', id: String(response.task_id ?? ''), status: response.status === 'completed' && response.wake_trace_id ? 'verified' : 'insufficient_evidence', wake_trace_id: response.wake_trace_id ?? null, source_agent: response.source_agent ?? null });
  }

  for (const event of audit) {
    if (event?.task_id && !taskIds.has(event.task_id)) mismatches.push({ type: 'AUDIT_TASK_MISMATCH', task_id: event.task_id });
    if (event?.commit_sha && event.commit_sha !== packet.commit_sha) mismatches.push({ type: 'AUDIT_COMMIT_MISMATCH', task_id: event.task_id ?? null, expected: packet.commit_sha, actual: event.commit_sha });
  }

  const times = [];
  for (const wake of expectedWakes) {
    const expectedAt = iso(wake.expected_at, 'expected_wake.expected_at');
    times.push(Date.parse(expectedAt));
    if (!wake.wake_trace_id) mismatches.push({ type: 'EXPECTED_WAKE_TRACE_MISSING' });
  }

  const clockDriftMs = packet.scheduler_clock_ms == null ? null : Number(packet.scheduler_clock_ms);
  if (clockDriftMs != null && (!Number.isFinite(clockDriftMs) || Math.abs(clockDriftMs) > 5 * 60_000)) mismatches.push({ type: 'CLOCK_DRIFT_BREACH', clock_drift_ms: clockDriftMs });

  const usefulProgress = tasks.filter((task) => task?.last_useful_work_at).length;
  const heartbeatOnly = tasks.filter((task) => task?.system_heartbeat_at && !task?.last_useful_work_at).length;
  const contradiction = tasks.some((task) => task?.status === 'completed' && !task?.verification && !task?.evidence);
  if (contradiction) mismatches.push({ type: 'CONTRADICTORY_COMPLETION_EVIDENCE' });

  return Object.freeze({
    schema: 'agentos-green-evidence-v0.1',
    project: packet.project,
    repository: packet.repository,
    commit_sha: packet.commit_sha,
    normalized_at: new Date(now).toISOString(),
    read_only: true,
    evidence,
    identity: Object.freeze({ task_count: tasks.length, response_count: responses.length, audit_count: audit.length, workflow_run_count: workflowRuns.length, expected_wake_count: expectedWakes.length }),
    traces: Object.freeze({ trace_count: traces.size, duplicate_wake_trace_ids: Object.freeze([...duplicateTraces]) }),
    progress: Object.freeze({ useful_progress_count: usefulProgress, heartbeat_without_useful_progress_count: heartbeatOnly }),
    timing: Object.freeze({ expected_wake_times: Object.freeze(times.map((value) => new Date(value).toISOString())), scheduler_clock_ms: clockDriftMs }),
    mismatches: Object.freeze(mismatches.map((item) => Object.freeze(item))),
    status: mismatches.length === 0 && heartbeatOnly === 0 ? 'green' : mismatches.some((item) => ['CONTRADICTORY_COMPLETION_EVIDENCE', 'WORKFLOW_COMMIT_MISMATCH', 'AUDIT_COMMIT_MISMATCH', 'CLOCK_DRIFT_BREACH'].includes(item.type)) ? 'red' : 'yellow'
  });
}
