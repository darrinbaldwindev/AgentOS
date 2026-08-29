import test from 'node:test';
import assert from 'node:assert/strict';
import { createHumanGate } from '../runtime/overseer-human-gate.mjs';

test('human gate pauses and resumes a mission decision', () => {
  const gate = createHumanGate();
  const pending = gate.request({ missionId: 'm1', reason: 'unresolved_disagreement', context: { risk: 'high' } });
  assert.equal(pending.status, 'pending');
  assert.equal(gate.listPending().length, 1);
  const resolved = gate.resolve({ missionId: 'm1', decision: 'approve', note: 'Proceed' });
  assert.equal(resolved.status, 'resolved');
  assert.equal(gate.listPending().length, 0);
  assert.equal(gate.get('m1').decision, 'approve');
});
