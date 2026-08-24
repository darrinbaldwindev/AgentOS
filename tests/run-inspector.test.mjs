import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { inspectRun } from '../runtime/run-inspector.mjs';

const store = createStateStore();
const workspace = store.create('workspace', {
  id: 'workspace_private',
  name: 'Private workspace name',
  repositoryContent: 'must-not-appear',
});
const agent = store.create('agent', {
  id: 'agent_private',
  workspaceId: workspace.id,
  name: 'Private agent name',
});
const run = store.create('run', {
  id: 'run_private',
  workspaceId: workspace.id,
  agentId: agent.id,
  status: 'completed',
  recovered: true,
  mission: 'private mission input',
});
store.create('event', {
  id: 'event_private',
  runId: run.id,
  eventType: 'run.recovered',
  metadata: { prompt: 'private prompt', token: 'private token' },
});
store.create('artifact', {
  id: 'artifact_private',
  runId: run.id,
  kind: 'overseer-recommendation',
  severity: 'warning',
  status: 'pending-review',
  ownerActionRequired: true,
  audit: { privatePayload: 'must-not-appear' },
});

const countsBefore = ['workspace', 'agent', 'run', 'event', 'artifact']
  .map((type) => [type, store.list(type).length]);
const inspection = inspectRun({ store, runId: run.id });
const rendered = JSON.stringify(inspection);

assert.deepEqual(inspection, {
  schemaVersion: 1,
  run: {
    id: 'run_private',
    workspaceId: 'workspace_private',
    agentId: 'agent_private',
    status: 'completed',
    recovered: true,
  },
  eventTypes: ['run.recovered'],
  overseer: {
    present: true,
    severity: 'warning',
    status: 'pending-review',
    ownerActionRequired: true,
  },
});
assert.equal(Object.isFrozen(inspection), true);
assert.equal(Object.isFrozen(inspection.eventTypes), true);
for (const forbidden of ['private mission input', 'private prompt', 'private token', 'must-not-appear']) {
  assert.equal(rendered.includes(forbidden), false);
}
assert.deepEqual(['workspace', 'agent', 'run', 'event', 'artifact']
  .map((type) => [type, store.list(type).length]), countsBefore);
assert.throws(() => inspectRun({ store, runId: 'missing' }), (error) => error.code === 'RUN_NOT_FOUND');

console.log('CORE-002 safe run-inspector tests passed');
