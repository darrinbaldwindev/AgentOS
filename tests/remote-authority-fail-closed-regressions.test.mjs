import test from 'node:test';
import assert from 'node:assert/strict';
import { createRemoteAuthorityAdmissionProducer } from '../runtime/remote-authority-admission.mjs';

const actorContext = Object.freeze({ actor_id: 'owner-1', issuer: 'agentos:overseer', authenticated: true });
const candidate = Object.freeze({
  admission_state: 'AWAITING_AUTHORITY',
  delivery_id: 'delivery-fail-closed-1',
  request_id: 'request-fail-closed-1',
  actor_id: 'owner-1',
  issuer: 'agentos:overseer',
  project_id: 'agentos-local',
  objective: 'run bounded repository test',
  requested_capabilities: ['shell.powershell.dev.execute'],
  scope: ['local-runtime'],
  constraints: ['DRY_RUN only'],
});

const validGrant = Object.freeze({
  status: 'GRANTED',
  actor_id: 'owner-1',
  issuer: 'agentos:overseer',
  project_id: 'agentos-local',
  granted_capabilities: ['shell.powershell.dev.execute'],
  evidence_id: 'authority-evidence-fail-closed-1',
  mission_id: 'mission-fail-closed-1',
});

function createProducer({ persistence, authoritySource }) {
  let ids = 0;
  return createRemoteAuthorityAdmissionProducer({
    persistence,
    authoritySource,
    trustedIssuers: ['agentos:overseer'],
    allowedCapabilities: ['shell.powershell.dev.execute'],
    now: () => new Date('2026-09-14T06:00:00.000Z'),
    idFactory: () => `fail-closed-${++ids}`,
  });
}

test('authority resolver failure cannot persist or return an admitted task', async () => {
  let persistenceCalls = 0;
  const admission = createProducer({
    persistence: {
      createMany: async () => { persistenceCalls += 1; },
    },
    authoritySource: {
      resolveGrant: async () => { throw new Error('AUTHORITY_SOURCE_UNAVAILABLE'); },
    },
  });

  await assert.rejects(
    admission.admit({ candidate, actorContext, targetHostId: 'host-1' }),
    (error) => error.message === 'AUTHORITY_SOURCE_UNAVAILABLE',
  );
  assert.equal(persistenceCalls, 0);
});

test('durable admission persistence failure cannot be reported as successful admission', async () => {
  let persistenceCalls = 0;
  const admission = createProducer({
    persistence: {
      createMany: async () => {
        persistenceCalls += 1;
        throw new Error('DURABLE_WRITE_FAILED');
      },
    },
    authoritySource: { resolveGrant: async () => validGrant },
  });

  await assert.rejects(
    admission.admit({ candidate, actorContext, targetHostId: 'host-1' }),
    (error) => error.message === 'REMOTE_ADMISSION_REPLAY_OR_CONFLICT' && error.cause?.message === 'DURABLE_WRITE_FAILED',
  );
  assert.equal(persistenceCalls, 1);
});
