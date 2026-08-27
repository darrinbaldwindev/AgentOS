import test from 'node:test';
import assert from 'node:assert/strict';
import { createDispatchEnvelope, validateDispatchEnvelope } from '../src/dispatch/envelope.mjs';

const baseTask = {
  task_id: 'env-001', issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project',
  objective: 'Validate envelope', priority: 'high', scope: ['tests'], constraints: [],
  acceptance_criteria: ['valid'], authority: { granted_capabilities: ['tests'] }, status: 'queued',
};
const context = {
  stateAuthority: '.agentos/state', schemaVersion: 1, repositoryAuthority: 'github',
  missions: [{ id: 'mission:core-003' }], decisions: [{ id: 'decision:001', status: 'accepted' }],
};

test('envelope binds task to canonical mission and accepted decision', () => {
  const envelope = createDispatchEnvelope({ task: baseTask, missionId: 'mission:core-003', decisionId: 'decision:001' });
  assert.equal(validateDispatchEnvelope(envelope, { issuer: baseTask.issuer, target: baseTask.target, canonicalContext: context }), true);
});

test('conflicting canonical references are rejected', () => {
  const task = { ...baseTask, mission_id: 'mission:other' };
  assert.throws(() => createDispatchEnvelope({ task, missionId: 'mission:core-003' }), /mission_id conflict/);
});
