import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileRemoteExecution } from '../runtime/remote-upstream-reconciliation.mjs';

function fixture() {
  const assignment = {
    delivery_id: 'delivery-A', request_id: 'request-A', project_id: 'agentos-local',
    mission_id: 'mission-A', task_id: 'task-A', actor_id: 'owner-mobile', issuer: 'agentos:overseer',
  };
  const receipt = {
    ...assignment, schema_version: 1, status: 'COMPLETED', wake_trace_id: 'wake-A', host_id: 'host-A',
    worker_id: 'agentos:deterministic-skill-agent', code_identity: 'a'.repeat(40), config_identity: 'cfg-A',
    claimed_at: '2026-09-10T00:00:00Z', started_at: '2026-09-10T00:00:01Z', completed_at: '2026-09-10T00:00:02Z',
    budget_reservation_id: 'budget-A', budget_status: 'RECONCILED', green_disposition: 'pass',
    evidence: ['local:wake:wake-A', 'local:task:task-A'],
  };
  const response = { status: 'COMPLETED', mission_id: 'mission-A', wake_trace_id: 'wake-A',
    source_agent: receipt.worker_id, green_disposition: 'pass' };
  const green = { disposition: 'pass', task_id: 'task-A', wake_trace_id: 'wake-A' };
  const executionEvents = [{ eventType: 'agentos.manual-wake.completed', taskId: 'task-A', missionId: 'mission-A', wakeTraceId: 'wake-A' }];
  return { assignment, receipt, response, green, executionEvents };
}

test('exact persisted correlation is reportable but not self-certified assurance', () => {
  const result = reconcileRemoteExecution(fixture());
  assert.equal(result.status, 'CORRELATED_COMPLETION');
  assert.equal(result.reportable_completed, true);
  assert.equal(result.assurance_certified, false);
  assert.equal(result.completion_record_present, true);
  assert.equal(result.rerun_allowed, false);
  assert.equal(result.automatic_recovery_allowed, false);
  assert.deepEqual(result.failures, []);
});

test('completion authorization or missing final receipt cannot be reported complete or authorize rerun', () => {
  const data = fixture();
  data.receipt = null;
  const result = reconcileRemoteExecution(data);
  assert.equal(result.status, 'RECONCILIATION_REQUIRED');
  assert.equal(result.reportable_completed, false);
  assert.equal(result.completion_record_present, false);
  assert.equal(result.rerun_allowed, false);
  assert.equal(result.automatic_recovery_allowed, false);
  assert.ok(result.failures.includes('RECEIPT_MISSING'));
});

test('borrowed task or mission identity fails closed', () => {
  for (const [field, value] of [['task_id', 'task-B'], ['mission_id', 'mission-B'], ['delivery_id', 'delivery-B'], ['request_id', 'request-B']]) {
    const data = fixture();
    data.receipt = { ...data.receipt, [field]: value };
    const result = reconcileRemoteExecution(data);
    assert.equal(result.reportable_completed, false, field);
    assert.equal(result.rerun_allowed, false, field);
    assert.ok(result.failures.some((item) => item.includes(field.toUpperCase())), JSON.stringify(result));
  }
});

test('duplicate correlated completion events are ambiguous and cannot be reported complete', () => {
  const data = fixture();
  data.executionEvents.push({ ...data.executionEvents[0] });
  const result = reconcileRemoteExecution(data);
  assert.equal(result.reportable_completed, false);
  assert.equal(result.rerun_allowed, false);
  assert.ok(result.failures.includes('DUPLICATE_CORRELATED_EXECUTION_EVENTS'));
});

test('missing ancillary completion event after durable receipt requires reconciliation, never rerun', () => {
  const data = fixture();
  data.executionEvents = [];
  const result = reconcileRemoteExecution(data);
  assert.equal(result.status, 'RECONCILIATION_REQUIRED');
  assert.equal(result.reportable_completed, false);
  assert.equal(result.completion_record_present, true);
  assert.equal(result.rerun_allowed, false);
  assert.equal(result.automatic_recovery_allowed, false);
  assert.ok(result.failures.includes('CORRELATED_EXECUTION_EVENT_MISSING'));
  assert.match(result.next_action, /do not rerun automatically/);
});

test('worker success without Green pass or reconciled budget cannot become reportable completion', () => {
  const data = fixture();
  data.green = { ...data.green, disposition: 'fail' };
  data.receipt = { ...data.receipt, green_disposition: 'fail', budget_status: 'UNKNOWN_REQUIRES_RECONCILIATION' };
  const result = reconcileRemoteExecution(data);
  assert.equal(result.reportable_completed, false);
  assert.equal(result.rerun_allowed, false);
  assert.ok(result.failures.includes('GREEN_NOT_PASS'));
  assert.ok(result.failures.includes('BUDGET_NOT_RECONCILED'));
});

test('response wake or worker mismatch is rejected even with a completed receipt', () => {
  const data = fixture();
  data.response = { ...data.response, wake_trace_id: 'wake-B', source_agent: 'worker-B' };
  const result = reconcileRemoteExecution(data);
  assert.equal(result.reportable_completed, false);
  assert.equal(result.rerun_allowed, false);
  assert.ok(result.failures.includes('RESPONSE_WAKE_TRACE_ID_MISMATCH'));
  assert.ok(result.failures.includes('RESPONSE_WORKER_ID_MISMATCH'));
});

for (const green of [{ disposition: 'pass' }, { disposition: 'pass', task_id: '' }]) {
  test(`Green without task correlation fails: ${JSON.stringify(green)}`, () => {
    const data = fixture(); data.green = green;
    assert.equal(reconcileRemoteExecution(data).reportable_completed, false);
  });
}
for (const field of ['host_id', 'worker_id', 'code_identity', 'config_identity', 'wake_trace_id']) {
  test(`independent assignment ${field} cannot be overridden by receipt`, () => {
    const data = fixture(); data.assignment[field] = 'different-expected-value';
    assert.equal(reconcileRemoteExecution(data).reportable_completed, false);
  });
}
test('another wake completing the same task is ambiguity, not evidence to discard', () => {
  const data = fixture();
  data.executionEvents.push({ ...data.executionEvents[0], wakeTraceId: 'wake-B' });
  const result = reconcileRemoteExecution(data);
  assert.equal(result.reportable_completed, false);
  assert.equal(result.rerun_allowed, false);
});
