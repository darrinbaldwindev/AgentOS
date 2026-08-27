import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeShell } from '../runtime/runtime-shell.mjs';

test('runtime shell normalizes adapter aliases before eligibility evaluation', async () => {
  const shell = createRuntimeShell({
    probes: {
      githubRead: async () => true,
      continuityRead: async () => true,
      handoff: async () => true,
      workspaceRead: async () => true,
      workspaceWrite: async () => true,
    },
  });
  const evaluation = await shell.assertExecutionEligible();
  assert.equal(evaluation.eligible, true);
  assert.equal(evaluation.results['github.read'], true);
  assert.equal(evaluation.results['continuity.read'], true);
  assert.equal(evaluation.localPreferred, true);
});

test('runtime shell blocks when canonical required connectivity is absent', async () => {
  const shell = createRuntimeShell({
    probes: {
      githubRead: async () => false,
      continuityRead: async () => true,
      handoff: async () => true,
    },
  });
  await assert.rejects(() => shell.assertExecutionEligible(), (error) => error.code === 'AGENT_NOT_ELIGIBLE');
});
