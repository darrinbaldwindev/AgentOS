import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createFilePersistence } from '../runtime/file-persistence.mjs';
import { createAgentRuntime } from '../runtime/agent-runtime.mjs';
import { createMockProvider } from '../runtime/mock-provider.mjs';
import { createToolRegistry } from '../runtime/tool-registry.mjs';
import { executeAgentLoop } from '../runtime/agent-loop.mjs';

const dir = await mkdtemp(join(tmpdir(), 'agentos-'));
const filePath = join(dir, 'state.json');

try {
  const persistence = createFilePersistence({ filePath });
  const workspace = await persistence.create('workspace', { id: 'workspace_loop', name: 'Loop' });
  const agent = await persistence.create('agent', { id: 'agent_loop', workspaceId: workspace.id, name: 'Loop Agent' });
  const runtime = createAgentRuntime({ persistence, provider: createMockProvider() });
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
  assert.equal((await persistence.list('run'))[0].status, 'completed');

  console.log('CORE-001 agent loop and tool registry tests passed');
} finally {
  await rm(dir, { recursive: true, force: true });
}
