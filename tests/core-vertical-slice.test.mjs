import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createMockProvider } from '../runtime/mock-provider.mjs';
import { createProviderRegistry } from '../runtime/provider-registry.mjs';
import { createRecoveryController } from '../runtime/recovery-handoff.mjs';
import { createToolRegistry } from '../runtime/tool-registry.mjs';
import { executeAgentLoop } from '../runtime/agent-loop.mjs';
import { createOverseer } from '../runtime/overseer.mjs';

// CORE-001 deterministic end-to-end proof: task -> tool -> provider failure ->
// provider handoff -> verified completion -> Overseer recommendation.
const store = createStateStore();
const workspace = store.create('workspace', { id: 'workspace_vertical', name: 'CORE-001 vertical slice' });
const agent = store.create('agent', { id: 'agent_vertical', workspaceId: workspace.id, name: 'Default Agent' });

const firstProvider = { ...createMockProvider({ fail: true }), id: 'provider.primary' };
const fallbackProvider = { ...createMockProvider({ response: 'fallback-completed' }), id: 'provider.fallback' };
const providers = createProviderRegistry([firstProvider, fallbackProvider]);
const recovery = createRecoveryController({ store, providers });
const tools = createToolRegistry([
  { name: 'checkpoint', description: 'Creates a deterministic checkpoint', execute: async ({ label }) => ({ checkpoint: label }) },
]);

const planResult = await executeAgentLoop({
  runtime: {
    run: async ({ workspaceId, agentId, mission }) => recovery.executeWithRecovery({
      workspaceId,
      agentId,
      mission,
      providerIds: ['provider.primary', 'provider.fallback'],
    }),
  },
  toolRegistry: tools,
  mission: 'Complete a bounded autonomous task',
  plan: { steps: [{ kind: 'tool', name: 'checkpoint', input: { label: 'before-provider' } }, { kind: 'provider', input: { workspaceId: workspace.id, agentId: agent.id, mission: 'Complete bounded task' } }] },
});

assert.equal(planResult.verified, true);
assert.equal(planResult.stepCount, 2);
assert.equal(planResult.results[0].checkpoint, 'before-provider');
assert.equal(planResult.results[1].recovered, true);
assert.equal(planResult.results[1].providerId, 'provider.fallback');

const run = store.list('run')[0];
assert.equal(run.status, 'completed');
assert.equal(run.recovered, true);

const report = createOverseer({ store }).auditRun(run.id);
assert.equal(report.audit.severity, 'warning');
assert.equal(report.audit.findings[0].code, 'PROVIDER_FAILURE_RECOVERED');
assert.equal(store.get('artifact', report.changeLogId).kind, 'overseer-recommendation');
assert.equal(store.list('event').at(-1).eventType, 'overseer.audit.completed');

console.log('CORE-001 end-to-end vertical slice passed');
