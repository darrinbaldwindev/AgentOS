import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createAgentRuntime } from '../runtime/agent-runtime.mjs';
import { createMockProvider } from '../runtime/mock-provider.mjs';
import { createToolRegistry } from '../runtime/tool-registry.mjs';
import { executeAgentLoop } from '../runtime/agent-loop.mjs';

const store = createStateStore();
const workspace = store.create('workspace', { id: 'workspace_loop', name: 'Loop' });
const agent = store.create('agent', { id: 'agent_loop', workspaceId: workspace.id, name: 'Loop Agent' });
const runtime = createAgentRuntime({ store, provider: createMockProvider() });
const registry = createToolRegistry([
  { name: 'echo', description: 'Returns a deterministic value', execute: async ({ value }) => `echo:${value}` },
]);

assert.deepEqual(registry.describe(), [{ name: 'echo', description: 'Returns a deterministic value' }]);
assert.equal(await registry.execute('echo', { value: 'ok' }), 'echo:ok');
await assert.rejects(() => registry.execute('missing'), (error) => error.code === 'TOOL_NOT_REGISTERED');

const result = await executeAgentLoop({
  runtime,
  toolRegistry: registry,
  mission: 'Run a bounded task',
  plan: {
    steps: [
      { kind: 'tool', name: 'echo', input: { value: 'ok' } },
      { kind: 'provider', input: { workspaceId: workspace.id, agentId: agent.id, mission: 'Complete bounded task' } },
    ],
  },
});

assert.equal(result.verified, true);
assert.equal(result.stepCount, 2);
assert.equal(result.results[0], 'echo:ok');
assert.equal(result.results[1].result.providerId, 'mock.local');
assert.equal(store.list('run')[0].status, 'completed');

console.log('CORE-001 agent loop and tool registry tests passed');
