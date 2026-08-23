import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createAgentRuntime } from '../runtime/agent-runtime.mjs';
import { createMockProvider } from '../runtime/mock-provider.mjs';

const store = createStateStore();
const project = store.create('project', { id: 'project_1', name: 'AgentOS' });
const workspace = store.create('workspace', { id: 'workspace_1', projectId: project.id, name: 'CORE-001' });
const agent = store.create('agent', { id: 'agent_1', workspaceId: workspace.id, name: 'Test Agent' });

const runtime = createAgentRuntime({ store, provider: createMockProvider() });
const completed = await runtime.run({
  workspaceId: workspace.id,
  agentId: agent.id,
  mission: 'Perform deterministic smoke task',
  tools: [{ name: 'noop' }],
});

assert.equal(completed.result.providerId, 'mock.local');
assert.equal(completed.result.toolCount, 1);
assert.equal(store.list('run')[0].status, 'completed');
assert.deepEqual(store.list('event').map((event) => event.eventType), [
  'run.started', 'provider.completed', 'run.completed',
]);
assert.equal(store.list('artifact')[0].status, 'verified');

const failureStore = createStateStore();
const failureWorkspace = failureStore.create('workspace', { id: 'workspace_failure', name: 'Failure' });
const failureAgent = failureStore.create('agent', { id: 'agent_failure', workspaceId: failureWorkspace.id, name: 'Failure Agent' });
const failureRuntime = createAgentRuntime({ store: failureStore, provider: createMockProvider({ fail: true }) });
await assert.rejects(
  () => failureRuntime.run({ workspaceId: failureWorkspace.id, agentId: failureAgent.id, mission: 'Fail safely' }),
  (error) => error.code === 'MOCK_PROVIDER_FAILURE'
);
assert.equal(failureStore.list('run')[0].status, 'failed');
assert.equal(failureStore.list('event').at(-1).eventType, 'run.failed');
assert.equal(failureStore.list('event').at(-1).diagnosticCode, 'MOCK_PROVIDER_FAILURE');

console.log('CORE-001 AgentRuntime tests passed');
