import test from 'node:test';
import assert from 'node:assert/strict';

const REQUIRED = ['task_id', 'responder', 'status', 'result', 'evidence', 'next_action', 'created_at'];
const TERMINAL = new Set(['completed', 'blocked', 'escalated', 'cancelled', 'superseded']);

function validateResponse(response, expectedTaskId) {
  for (const field of REQUIRED) assert.ok(response[field] !== undefined, `missing ${field}`);
  assert.equal(response.task_id, expectedTaskId, 'response must correlate to exact task');
  assert.ok(['working', 'verification', ...TERMINAL].includes(response.status));
  assert.ok(typeof response.evidence === 'string' && response.evidence.trim().length > 0);
  assert.ok(['none', 'follow_up_task', 'escalation'].includes(response.next_action));
  if (response.status === 'completed') assert.notEqual(response.evidence.trim(), 'acknowledged');
  return true;
}

test('valid completed response is correlated and evidence-backed', () => {
  assert.equal(validateResponse({
    task_id: 'agentos-e2e-001', responder: 'manus:overseer', status: 'completed',
    result: 'Handshake task read and repository inspection performed.',
    evidence: 'Read .agentos/dispatch/schema.md and .agentos/state/agents.json; target identity matched manus:overseer.',
    next_action: 'follow_up_task', created_at: '2026-08-27T00:00:00Z',
  }, 'agentos-e2e-001'), true);
});

test('mismatched response task id is rejected', () => {
  assert.throws(() => validateResponse({
    task_id: 'wrong-id', responder: 'manus:overseer', status: 'completed', result: 'x',
    evidence: 'real evidence', next_action: 'none', created_at: '2026-08-27T00:00:00Z',
  }, 'agentos-e2e-001'), /exact task/);
});
