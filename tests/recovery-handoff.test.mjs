import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createMockProvider } from '../runtime/mock-provider.mjs';
import { createProviderRegistry } from '../runtime/provider-registry.mjs';
import { createRecoveryController } from '../runtime/recovery-handoff.mjs';

const store = createStateStore();
const workspace = store.create('workspace', { id: 'workspace_recovery', name: 'Recovery' });
const agent = store.create('agent', { id: 'agent_recovery', workspaceId: workspace.id, name: 'Recovery Agent' });
const failing = createMockProvider({ fail: true });
const healthy = createMockProvider({ response: 'RECOVERED' });
const registry = createProviderRegistry([
  { ...failing, id: 'provider.failed' },
  { ...healthy, id: 'provider.healthy' },
]);
const controller = createRecoveryController({ store, providers: registry });

const result = await controller.executeWithRecovery({
  workspaceId: workspace.id,
  agentId: agent.id,
  mission: 'Continue after provider failure',
  providerIds: ['provider.failed', 'provider.healthy'],
});

assert.equal(result.providerId, 'provider.healthy');
assert.equal(result.recovered, true);
assert.equal(result.result.response, 'RECOVERED');
assert.equal(store.list('run')[0].status, 'completed');
assert.equal(store.list('run')[0].recovered, true);
assert.deepEqual(store.list('event').map((event) => event.eventType), [
  'provider.selected',
  'provider.failed',
  'provider.handoff',
  'run.recovered',
]);
assert.equal(store.list('artifact')[0].providerId, 'provider.healthy');

console.log('CORE-001 recovery and provider handoff tests passed');
