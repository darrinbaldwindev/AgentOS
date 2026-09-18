import test from 'node:test';
import assert from 'node:assert/strict';

import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { createCanonicalAuthorityGate } from '../runtime/governed-execution-canonical-adapters.mjs';
import { createGovernedExecutionBoundary } from '../runtime/governed-execution-boundary.mjs';

const actorContext = Object.freeze({ actor_id: 'agentos:windows-worker' });

function remoteTask(overrides = {}) {
  return {
    task_id: 'task:remote:self-grant:1',
    mission_id: 'mission:remote:self-grant:1',
    delivery_id: 'delivery:remote:self-grant:1',
    request_id: 'request:remote:self-grant:1',
    issuer: 'remote:untrusted-client',
    admitted_by: 'agentos:overseer',
    authority_admitted: true,
    authority: { granted_capabilities: ['shell.powershell.dev.execute'] },
    required_capabilities: ['shell.powershell.dev.execute'],
    execution: { adapter: 'windows-powershell', operation: 'test.run', cwd: 'C:/agentos/AgentOS' },
    ...overrides,
  };
}

function trustedGate() {
  return createCanonicalAuthorityGate({
    authorityPolicy: createAuthorityPolicy({
      issuers: ['agentos:overseer'],
      capabilities: ['shell.powershell.dev.execute'],
    }),
  });
}

test('remote admission-shaped metadata cannot self-grant canonical issuer authority', async () => {
  await assert.rejects(
    trustedGate().assertAllowed({ actorContext, task: remoteTask() }),
    /untrusted issuer: remote:untrusted-client/,
  );
});

test('remote admission-shaped metadata cannot self-grant an unapproved PowerShell capability', async () => {
  const gate = createCanonicalAuthorityGate({
    authorityPolicy: createAuthorityPolicy({
      issuers: ['agentos:overseer'],
      capabilities: ['shell.powershell.repo.read'],
    }),
  });

  await assert.rejects(
    gate.assertAllowed({ actorContext, task: remoteTask({ issuer: 'agentos:overseer' }) }),
    /unauthorised capability: shell\.powershell\.dev\.execute/,
  );
});

test('trusted issuer and admission-shaped metadata cannot execute a required but ungranted PowerShell capability', async () => {
  const calls = [];
  const boundary = createGovernedExecutionBoundary({
    context: { assertValid: async () => { calls.push('context'); } },
    authority: trustedGate(),
    consent: { assertAllowed: async () => { calls.push('consent'); } },
    capability: { assertExecutionEligible: async () => { calls.push('host capability'); return {}; } },
    policy: { assertAllowed: async () => { calls.push('policy'); } },
    risk: { evaluate: async () => { calls.push('risk'); return { approvalRequired: false }; } },
    budget: {
      reserve: async () => { calls.push('reserve'); return { reservation_id: 'reservation:1' }; },
      reconcile: async () => { calls.push('reconcile'); },
    },
    approval: { assertApproved: async () => { calls.push('approval'); } },
    receipts: { record: async () => { calls.push('receipt'); return {}; } },
    verification: { verify: async () => { calls.push('verify'); return { passed: true }; } },
  });
  const task = remoteTask({
    issuer: 'agentos:overseer',
    authority: { granted_capabilities: [] },
  });

  await assert.rejects(
    boundary.execute({
      actorContext,
      task,
      invoke: async () => { calls.push('worker invocation'); return { success: true }; },
    }),
    /capability not granted to task: shell\.powershell\.dev\.execute/,
  );
  assert.deepEqual(calls, ['context']);
});

test('malformed grant metadata cannot bypass task-capability binding', async () => {
  await assert.rejects(
    trustedGate().assertAllowed({
      actorContext,
      task: remoteTask({ issuer: 'agentos:overseer', authority: { granted_capabilities: 'shell.powershell.dev.execute' } }),
    }),
    /capability grants and requirements must be arrays/,
  );
});
