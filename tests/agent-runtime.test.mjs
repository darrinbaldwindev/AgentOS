import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createFilePersistence } from '../runtime/file-persistence.mjs';
import { createAgentRuntime } from '../runtime/agent-runtime.mjs';
import { createMockProvider } from '../runtime/mock-provider.mjs';

async function createFixture(filePath) {
  const persistence = createFilePersistence({ filePath });
  const workspace = await persistence.create('workspace', { id: 'workspace_1', name: 'CORE-002' });
  const agent = await persistence.create('agent', { id: 'agent_1', workspaceId: workspace.id, name: 'Test Agent' });
  return { persistence, workspace, agent };
}

test('AgentRuntime persists successful execution through the canonical file persistence contract', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agentos-'));
  const filePath = join(dir, 'state.json');
  try {
    const { persistence, workspace, agent } = await createFixture(filePath);
    const runtime = createAgentRuntime({ persistence, provider: createMockProvider() });
    const completed = await runtime.run({ workspaceId: workspace.id, agentId: agent.id, mission: 'Perform deterministic smoke task', tools: [{ name: 'noop' }] });

    assert.equal(completed.result.providerId, 'mock.local');
    assert.equal(completed.result.toolCount, 1);
    assert.equal((await persistence.list('run'))[0].status, 'completed');
    assert.deepEqual((await persistence.list('event')).map((event) => event.eventType), ['run.started', 'provider.completed', 'run.completed']);
    assert.equal((await persistence.list('artifact'))[0].status, 'verified');

    const reloaded = createFilePersistence({ filePath });
    assert.equal((await reloaded.list('run'))[0].status, 'completed');
    assert.equal((await reloaded.list('artifact'))[0].status, 'verified');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('AgentRuntime persists provider failure and diagnostic state', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'agentos-'));
  const filePath = join(dir, 'state.json');
  try {
    const { persistence, workspace, agent } = await createFixture(filePath);
    const runtime = createAgentRuntime({ persistence, provider: createMockProvider({ fail: true }) });
    await assert.rejects(
      () => runtime.run({ workspaceId: workspace.id, agentId: agent.id, mission: 'Fail safely' }),
      (error) => error.code === 'MOCK_PROVIDER_FAILURE'
    );
    assert.equal((await persistence.list('run'))[0].status, 'failed');
    const events = await persistence.list('event');
    assert.equal(events.at(-1).eventType, 'run.failed');
    assert.equal(events.at(-1).diagnosticCode, 'MOCK_PROVIDER_FAILURE');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
