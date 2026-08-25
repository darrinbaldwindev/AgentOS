import test from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeShell } from '../runtime/runtime-shell.mjs';

test('runtime shell requires real required capability probes', async () => {
  const shell = createRuntimeShell({
    probes: {
      'github.read': async () => true,
      'continuity.read': async () => true,
      handoff: async () => true,
      'workspace.read': async () => true,
      'workspace.write': async () => true,
    },
  });
  const evaluation = await shell.assertExecutionEligible();
  assert.equal(evaluation.eligible, true);
  assert.equal(evaluation.localPreferred, true);
});

test('runtime shell blocks when required connectivity is absent', async () => {
  const shell = createRuntimeShell({
    probes: {
      'github.read': async () => false,
      'continuity.read': async () => true,
      handoff: async () => true,
    },
  });
  await assert.rejects(() => shell.assertExecutionEligible(), (error) => error.code === 'AGENT_NOT_ELIGIBLE');
});
