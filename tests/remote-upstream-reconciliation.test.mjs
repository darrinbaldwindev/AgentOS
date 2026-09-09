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
  assert.deepEqual(result.failures, []);
});

test('completion authorization or missing final receipt cannot be reported complete', () => {
  const data = fixture();
  data.receipt = null;
  const result = reconcileRemoteExecution(data);
  assert.equal(result.status, 'RECONCILIATION_REQUIRED');
  assert.equal(result.reportable_completed, false);
  assert.ok(result.failures.includes('RECEIPT_MISSING'));
});

test('borrowed task or mission identity fails closed', () => {
  for (const [field, value] of [['task_id', 'task-B'], ['mission_id', 'mission-B'], ['delivery_id', 'delivery-B'], ['request_id', 'request-B']]) {
    const data = fixture();
    data.receipt = { ...data.receipt, [field]: value };
    const result = reconcileRemoteExecution(data);
    assert.equal(result.reportable_completed, false, field);
    assert.ok(result.failures.some((item) => item.includes(field.toUpperCase())), JSON.stringify(result));
  }
});

test('duplicate correlated completion events are ambiguous and cannot be reported complete', () => {
  const data = fixture();
  data.executionEvents.push({ ...data.executionEvents[0] });
  const result = reconcileRemoteExecution(data);
  assert.equal(result.reportable_completed, false);
  assert.ok(result.failures.includes('DUPLICATE_CORRELATED_EXECUTION_EVENTS'));
});

test('worker success without Green pass or reconciled budget cannot become reportable completion', () => {
  const data = fixture();
  data.green = { ...data.green, disposition: 'fail' };
  data.receipt = { ...data.receipt, green_disposition: 'fail', budget_status: 'UNKNOWN_REQUIRES_RECONCILIATION' };
  const result = reconcileRemoteExecution(data);
  assert.equal(result.reportable_completed, false);
  assert.ok(result.failures.includes('GREEN_NOT_PASS'));
  assert.ok(result.failures.includes('BUDGET_NOT_RECONCILED'));
});

test('response wake or worker mismatch is rejected even with a completed receipt', () => {
  const data = fixture();
  data.response = { ...data.response, wake_trace_id: 'wake-B', source_agent: 'worker-B' };
  const result = reconcileRemoteExecution(data);
  assert.equal(result.reportable_completed, false);
  assert.ok(result.failures.includes('RESPONSE_WAKE_TRACE_ID_MISMATCH'));
  assert.ok(result.failures.includes('RESPONSE_WORKER_ID_MISMATCH'));
});
