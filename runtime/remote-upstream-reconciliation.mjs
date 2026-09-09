// Read-only upstream reconciliation for persisted remote execution evidence.
// This does not grant authority, execute work or certify independent assurance.
// It answers only whether persisted AgentOS records are internally correlated
// enough for an upstream controller to report a completed local execution.

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function same(value, expected) {
  return typeof value === 'string' && value === expected;
}

export function reconcileRemoteExecution({
  assignment,
  receipt,
  response,
  green,
  executionEvents = [],
} = {}) {
  if (!assignment || typeof assignment !== 'object') throw new TypeError('assignment is required');
  const expected = {
    delivery_id: requiredString(assignment.delivery_id, 'assignment.delivery_id'),
    request_id: requiredString(assignment.request_id, 'assignment.request_id'),
    project_id: requiredString(assignment.project_id, 'assignment.project_id'),
    mission_id: requiredString(assignment.mission_id, 'assignment.mission_id'),
    task_id: requiredString(assignment.task_id, 'assignment.task_id'),
    actor_id: requiredString(assignment.actor_id, 'assignment.actor_id'),
    issuer: requiredString(assignment.issuer, 'assignment.issuer'),
  };

  const failures = [];
  const fail = (code) => failures.push(code);
  const completionRecordPresent = Boolean(receipt && typeof receipt === 'object' && receipt.status === 'COMPLETED');

  if (!receipt || typeof receipt !== 'object') fail('RECEIPT_MISSING');
  if (!response || typeof response !== 'object') fail('FINAL_RESPONSE_MISSING');
  if (!green || typeof green !== 'object') fail('GREEN_RECORD_MISSING');
  if (!Array.isArray(executionEvents)) fail('EXECUTION_EVENTS_INVALID');

  if (receipt && typeof receipt === 'object') {
    for (const [field, value] of Object.entries(expected)) {
      if (!same(receipt[field], value)) fail(`RECEIPT_${field.toUpperCase()}_MISMATCH`);
    }
    for (const field of ['wake_trace_id', 'host_id', 'worker_id', 'code_identity', 'config_identity', 'claimed_at', 'started_at', 'completed_at', 'budget_reservation_id']) {
      if (typeof receipt[field] !== 'string' || !receipt[field].trim()) fail(`RECEIPT_${field.toUpperCase()}_MISSING`);
    }
    if (receipt.status !== 'COMPLETED') fail('RECEIPT_NOT_COMPLETED');
    if (receipt.budget_status !== 'RECONCILED') fail('BUDGET_NOT_RECONCILED');
    if (receipt.green_disposition !== 'pass') fail('RECEIPT_GREEN_NOT_PASS');
    if (!Array.isArray(receipt.evidence) || !receipt.evidence.length || receipt.evidence.some((item) => typeof item !== 'string' || !item.trim())) {
      fail('RECEIPT_EVIDENCE_MISSING');
    }
  }

  if (response && typeof response === 'object' && receipt && typeof receipt === 'object') {
    if (response.status !== 'COMPLETED') fail('FINAL_RESPONSE_NOT_COMPLETED');
    if (!same(response.mission_id, expected.mission_id)) fail('RESPONSE_MISSION_ID_MISMATCH');
    if (!same(response.wake_trace_id, receipt.wake_trace_id)) fail('RESPONSE_WAKE_TRACE_ID_MISMATCH');
    if (!same(response.source_agent, receipt.worker_id)) fail('RESPONSE_WORKER_ID_MISMATCH');
    if (response.green_disposition !== 'pass') fail('RESPONSE_GREEN_NOT_PASS');
  }

  if (green && typeof green === 'object' && receipt && typeof receipt === 'object') {
    if (green.disposition !== 'pass') fail('GREEN_NOT_PASS');
    if (green.task_id && !same(green.task_id, expected.task_id)) fail('GREEN_TASK_ID_MISMATCH');
    if (green.wake_trace_id && !same(green.wake_trace_id, receipt.wake_trace_id)) fail('GREEN_WAKE_TRACE_ID_MISMATCH');
  }

  if (Array.isArray(executionEvents) && receipt && typeof receipt === 'object') {
    const correlated = executionEvents.filter((event) => event?.eventType === 'agentos.manual-wake.completed'
      && event.taskId === expected.task_id
      && event.missionId === expected.mission_id
      && event.wakeTraceId === receipt.wake_trace_id);
    if (correlated.length !== 1) fail(correlated.length === 0 ? 'CORRELATED_EXECUTION_EVENT_MISSING' : 'DUPLICATE_CORRELATED_EXECUTION_EVENTS');
  }

  const uniqueFailures = [...new Set(failures)];
  return Object.freeze({
    status: uniqueFailures.length ? 'RECONCILIATION_REQUIRED' : 'CORRELATED_COMPLETION',
    reportable_completed: uniqueFailures.length === 0,
    assurance_certified: false,
    completion_record_present: completionRecordPresent,
    // Reconciliation uncertainty must never itself authorize another execution.
    // A missing ancillary event can follow a durable completed receipt, while a
    // missing receipt can follow a worker run whose final persistence failed.
    rerun_allowed: false,
    automatic_recovery_allowed: false,
    failures: Object.freeze(uniqueFailures),
    correlation: Object.freeze({
      ...expected,
      wake_trace_id: receipt?.wake_trace_id ?? null,
      host_id: receipt?.host_id ?? null,
      worker_id: receipt?.worker_id ?? null,
      code_identity: receipt?.code_identity ?? null,
    }),
    next_action: uniqueFailures.length ? 'resolve persisted evidence mismatch; do not rerun automatically' : 'submit evidence for independent Green/PRS review',
  });
}
