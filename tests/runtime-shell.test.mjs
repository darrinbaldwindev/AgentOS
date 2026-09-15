import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRuntimeShell as createEligibilityShell,
  evaluateCapabilityResults,
  assertCapabilityResults,
} from '../runtime/runtime-shell.mjs';
import { createRuntimeShell as createIntegrationShell } from '../runtime/shell-contract.mjs';

test('runtime shell normalizes adapter aliases before eligibility evaluation', async () => {
  const shell = createEligibilityShell({
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
  const shell = createEligibilityShell({
    probes: {
      githubRead: async () => false,
      continuityRead: async () => true,
      handoff: async () => true,
    },
  });
  await assert.rejects(() => shell.assertExecutionEligible(), (error) => error.code === 'AGENT_NOT_ELIGIBLE');
});

test('pure capability evaluation normalizes aliases through one canonical helper', () => {
  const evaluation = evaluateCapabilityResults({
    githubRead: true,
    continuityRead: true,
    handoff: true,
    workspaceRead: true,
    workspaceWrite: true,
  });
  assert.equal(evaluation.eligible, true);
  assert.equal(evaluation.localPreferred, true);
  assert.equal(evaluation.results['github.read'], true);
});

test('pure capability assertion fails closed for missing required connectivity', () => {
  assert.throws(
    () => assertCapabilityResults({ githubRead: false, continuityRead: true, handoff: true }),
    (error) => error.code === 'AGENT_NOT_ELIGIBLE',
  );
});

test('canonical and legacy capability names may agree without changing eligibility', () => {
  const evaluation = evaluateCapabilityResults({
    githubRead: true,
    'github.read': true,
    continuityRead: true,
    'continuity.read': true,
    handoff: true,
  });
  assert.equal(evaluation.eligible, true);
  assert.equal(evaluation.results['github.read'], true);
  assert.equal(evaluation.results['continuity.read'], true);
});

test('contradictory legacy alias cannot override canonical capability evidence', () => {
  assert.throws(
    () => evaluateCapabilityResults({
      'github.read': true,
      githubRead: false,
      'continuity.read': true,
      handoff: true,
    }),
    (error) => error.code === 'CAPABILITY_EVIDENCE_CONFLICT' && error.capability === 'github.read',
  );
});

test('contradictory canonical capability cannot override legacy alias evidence', () => {
  assert.throws(
    () => evaluateCapabilityResults({
      githubRead: true,
      'github.read': false,
      continuityRead: true,
      handoff: true,
    }),
    (error) => error.code === 'CAPABILITY_EVIDENCE_CONFLICT' && error.capability === 'github.read',
  );
});

test('integration shell reuses canonical evaluation for alias-shaped probe results', async () => {
  const workspaceAdapter = { id: 'workspace' };
  const githubAdapter = { id: 'github' };
  const shell = createIntegrationShell({
    capabilityProbe: {
      probe: async () => ({
        githubRead: true,
        continuityRead: true,
        handoff: true,
        workspaceRead: true,
        workspaceWrite: true,
      }),
    },
    workspaceAdapter,
    githubAdapter,
  });

  const authorization = await shell.authorize('agent-1');
  assert.equal(authorization.evaluation.eligible, true);
  assert.equal(authorization.mode, 'local-preferred');
  assert.deepEqual(shell.adapters(), { workspace: workspaceAdapter, github: githubAdapter });
});

test('integration shell accepts previously evaluated result shape without treating eligible flag as authority', async () => {
  const shell = createIntegrationShell({
    capabilityProbe: {
      probe: async () => ({
        evaluation: {
          eligible: true,
          results: {
            'github.read': true,
            'continuity.read': true,
            handoff: true,
            'workspace.read': false,
            'workspace.write': false,
          },
        },
      }),
    },
  });

  const authorization = await shell.authorize('agent-2');
  assert.equal(authorization.evaluation.eligible, true);
  assert.equal(authorization.mode, 'github');
});

test('integration shell rejects an asserted eligible flag when canonical results are missing', async () => {
  const shell = createIntegrationShell({
    capabilityProbe: {
      probe: async () => ({ evaluation: { eligible: true } }),
    },
  });

  await assert.rejects(() => shell.authorize('agent-3'), (error) => error.code === 'AGENT_NOT_ELIGIBLE');
});
