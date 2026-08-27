import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCanonicalContext, validateTaskContext } from '../src/dispatch/canonical-context.mjs';

const current = { schemaVersion: 1, stateAuthority: '.agentos/state', repositoryAuthority: 'github' };
const agents = [{ id: 'agentos:overseer', default: true }];
const missions = { missions: [{ id: 'mission:core-003', status: 'active' }] };
const decisions = { decisions: [{ id: 'decision:001', status: 'accepted' }] };

test('builds context from canonical state', () => {
  const context = buildCanonicalContext({ current, agents, missions, decisions });
  assert.equal(context.defaultOverseer, 'agentos:overseer');
  assert.equal(context.missions[0].id, 'mission:core-003');
});

test('requires an existing mission and accepted decision', () => {
  const context = buildCanonicalContext({ current, agents, missions, decisions });
  assert.equal(validateTaskContext({ mission_id: 'mission:core-003', decision_id: 'decision:001' }, context), true);
  assert.throws(() => validateTaskContext({}, context), /mission_id/);
  assert.throws(() => validateTaskContext({ mission_id: 'mission:missing' }, context), /unknown mission/);
});

test('rejects unaccepted decisions', () => {
  const context = buildCanonicalContext({ current, agents, missions, decisions: { decisions: [{ id: 'decision:002', status: 'proposed' }] } });
  assert.throws(() => validateTaskContext({ mission_id: 'mission:core-003', decision_id: 'decision:002' }, context), /not accepted/);
});
