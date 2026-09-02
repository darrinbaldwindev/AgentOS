import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectScheduleHealth } from '../runtime/green-agent.mjs';

const now = Date.parse('2026-09-02T12:00:00Z');
const expected = (trace, at = '2026-09-02T11:00:00Z') => ({ wake_trace_id: trace, expected_at: at });

test('Green detects a dropped wake from expected-wake evidence', () => {
  const result = inspectScheduleHealth({ expectedWakes: [expected('trace-drop')], tasks: [], now, dispatchSlaMs: 15 * 60_000 });
  assert.equal(result.status, 'red');
  assert.equal(result.findings[0].type, 'MISSED_WAKE');
  assert.equal(result.read_only, true);
});

test('Green distinguishes heartbeats from useful progress and detects stalled work', () => {
  const result = inspectScheduleHealth({
    expectedWakes: [expected('trace-stall')],
    tasks: [{ wake_trace_id: 'trace-stall', status: 'working', started_at: '2026-09-02T10:00:00Z', system_heartbeat_at: '2026-09-02T11:59:00Z', last_useful_work_at: '2026-09-02T10:00:00Z' }],
    now,
    usefulProgressSlaMs: 30 * 60_000,
  });
  assert.equal(result.status, 'red');
  assert.equal(result.findings[0].type, 'STALLED_WORK_DETECTED');
});

test('Green detects duplicate execution traces even when prevention is elsewhere', () => {
  const result = inspectScheduleHealth({
    expectedWakes: [expected('trace-dup')],
    tasks: [
      { wake_trace_id: 'trace-dup', status: 'completed', started_at: '2026-09-02T11:01:00Z' },
      { wake_trace_id: 'trace-dup', status: 'completed', started_at: '2026-09-02T11:02:00Z' },
    ],
    now,
  });
  assert.equal(result.status, 'yellow');
  assert.equal(result.findings[0].type, 'DUPLICATE_WAKE');
});

test('Green detects dispatch SLA drift without changing scheduler behavior', () => {
  const result = inspectScheduleHealth({
    expectedWakes: [expected('trace-late', '2026-09-02T10:00:00Z')],
    tasks: [{ wake_trace_id: 'trace-late', status: 'completed', scheduler_wake_at: '2026-09-02T10:00:00Z', dispatched_at: '2026-09-02T11:00:00Z', started_at: '2026-09-02T11:00:00Z' }],
    now,
    dispatchSlaMs: 15 * 60_000,
  });
  assert.equal(result.status, 'yellow');
  assert.equal(result.findings[0].type, 'WAKE_LATENCY_BREACH');
});

test('Green ignores legitimate paused or cancelled expected work', () => {
  const result = inspectScheduleHealth({
    expectedWakes: [expected('trace-paused'), { ...expected('trace-cancelled'), status: 'cancelled' }],
    tasks: [],
    now,
    dispatchSlaMs: 15 * 60_000,
  });
  assert.equal(result.status, 'green');
  assert.equal(result.findings.length, 0);
});
