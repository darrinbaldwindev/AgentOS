import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeGreenEvidence } from '../runtime/green-agent-evidence.mjs';

const base = () => ({
  project: 'agentos', repository: 'darrinbaldwindev/AgentOS', commit_sha: 'abc123',
  tasks: [{ task_id: 't1', status: 'completed', wake_trace_id: 'trace-1', last_useful_work_at: '2026-09-02T05:00:00Z', verification: { status: 'verified' }, evidence: { status: 'verified' } }],
  responses: [{ task_id: 't1', status: 'completed', wake_trace_id: 'trace-1', source_agent: 'agentos:repo-worker' }],
  audit: [{ task_id: 't1', commit_sha: 'abc123' }],
  workflow_runs: [{ id: 1, head_sha: 'abc123', conclusion: 'success', completed_at: '2026-09-02T05:05:00Z' }],
  expected_wakes: [{ wake_trace_id: 'trace-1', expected_at: '2026-09-02T05:00:00Z', status: 'expected' }]
});

test('normalizes valid canonical evidence as green and read-only', () => {
  const result = normalizeGreenEvidence({ packet: base(), now: Date.parse('2026-09-02T05:10:00Z') });
  assert.equal(result.status, 'green');
  assert.equal(result.read_only, true);
  assert.equal(result.traces.trace_count, 1);
  assert.equal(result.evidence[0].status, 'verified');
});

test('rejects workflow evidence from another commit', () => {
  const packet = base(); packet.workflow_runs[0].head_sha = 'wrong';
  const result = normalizeGreenEvidence({ packet });
  assert.equal(result.status, 'red');
  assert.equal(result.mismatches[0].type, 'WORKFLOW_COMMIT_MISMATCH');
});

test('detects heartbeat without useful progress', () => {
  const packet = base(); delete packet.tasks[0].last_useful_work_at; packet.tasks[0].system_heartbeat_at = '2026-09-02T05:00:00Z';
  const result = normalizeGreenEvidence({ packet });
  assert.equal(result.status, 'yellow');
  assert.equal(result.progress.heartbeat_without_useful_progress_count, 1);
});

test('detects contradictory completion evidence', () => {
  const packet = base(); delete packet.tasks[0].verification; delete packet.tasks[0].evidence;
  const result = normalizeGreenEvidence({ packet });
  assert.equal(result.status, 'red');
  assert.equal(result.mismatches[0].type, 'CONTRADICTORY_COMPLETION_EVIDENCE');
});

test('detects duplicate wake traces', () => {
  const packet = base(); packet.tasks.push({ task_id: 't2', wake_trace_id: 'trace-1', status: 'completed', last_useful_work_at: '2026-09-02T05:00:00Z' });
  const result = normalizeGreenEvidence({ packet });
  assert.deepEqual(result.traces.duplicate_wake_trace_ids, ['trace-1']);
});
