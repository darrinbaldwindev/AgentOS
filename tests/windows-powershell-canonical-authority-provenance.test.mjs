import test from 'node:test';
import assert from 'node:assert/strict';

import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { createCanonicalAuthorityGate } from '../runtime/governed-execution-canonical-adapters.mjs';

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

test('remote admission-shaped metadata cannot self-grant canonical issuer authority', async () => {
  const gate = createCanonicalAuthorityGate({
    authorityPolicy: createAuthorityPolicy({
      issuers: ['agentos:overseer'],
      capabilities: ['shell.powershell.dev.execute'],
    }),
  });

  await assert.rejects(
    gate.assertAllowed({ actorContext, task: remoteTask() }),
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
    gate.assertAllowed({
      actorContext,
      task: remoteTask({ issuer: 'agentos:overseer' }),
    }),
    /unauthorised capability: shell\.powershell\.dev\.execute/,
  );
});
