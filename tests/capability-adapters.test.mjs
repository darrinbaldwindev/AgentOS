import test from 'node:test';
import assert from 'node:assert/strict';
import { createCapabilityAdapters, probeAgentCapabilities } from '../runtime/capability-adapters.mjs';

test('capability adapters use real injected probes', async () => {
  const adapters = createCapabilityAdapters({
    github: { probeRead: async () => true },
    continuity: { probeRead: async () => true },
    handoff: { probe: async () => true },
    workspace: { probeRead: async () => true, probeWrite: async () => false },
  });
  assert.deepEqual(await probeAgentCapabilities(adapters), {
    githubRead: true,
    continuityRead: true,
    handoff: true,
    workspaceRead: true,
    workspaceWrite: false,
  });
});

test('failed or missing integrations are safely reported unavailable', async () => {
  const adapters = createCapabilityAdapters({ github: { probeRead: async () => { throw new Error('offline'); } } });
  assert.equal((await probeAgentCapabilities(adapters)).githubRead, false);
  assert.equal((await probeAgentCapabilities(adapters)).continuityRead, false);
});
