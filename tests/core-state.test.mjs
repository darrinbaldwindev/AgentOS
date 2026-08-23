import assert from 'node:assert/strict';
import { createStateStore, TYPES, RUN_STATUSES } from '../runtime/core-state.mjs';

const store = createStateStore();

const project = store.create('project', { id: 'project_agentos', name: 'AgentOS' });
const workspace = store.create('workspace', { id: 'workspace_core', projectId: project.id, name: 'CORE-001' });
const agent = store.create('agent', { id: 'agent_overseer', workspaceId: workspace.id, name: 'Overseer', role: 'supervisor' });
const run = store.create('run', { id: 'run_001', workspaceId: workspace.id, agentId: agent.id, status: 'queued' });
const event = store.create('event', { id: 'event_001', runId: run.id, eventType: 'run.created' });
const artifact = store.create('artifact', { id: 'artifact_001', runId: run.id, kind: 'recommendation', status: 'pending' });

assert.deepEqual(TYPES, ['project', 'workspace', 'agent', 'run', 'event', 'artifact']);
assert.equal(RUN_STATUSES.includes('running'), true);
assert.equal(store.get('workspace', workspace.id).projectId, project.id);
assert.equal(store.get('agent', agent.id).workspaceId, workspace.id);
assert.equal(store.get('event', event.id).runId, run.id);
assert.equal(store.get('artifact', artifact.id).runId, run.id);
assert.equal(store.update('run', run.id, { status: 'running' }).status, 'running');
assert.throws(() => store.update('run', run.id, { status: 'invalid' }), /Invalid run status/);
assert.throws(() => store.create('run', { id: 'run_bad', status: 'invalid' }), /Invalid run status/);
assert.throws(() => store.create('workspace', { id: workspace.id }), /Duplicate workspace id/);
assert.equal(store.snapshot().project.length, 1);
assert.equal(store.snapshot().workspace.length, 1);
assert.equal(store.snapshot().agent.length, 1);
assert.equal(store.snapshot().run.length, 1);
assert.equal(store.snapshot().event.length, 1);
assert.equal(store.snapshot().artifact.length, 1);

console.log('CORE-001 state primitive tests passed');
