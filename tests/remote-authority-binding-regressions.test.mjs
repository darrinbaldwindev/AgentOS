import test from 'node:test';
import assert from 'node:assert/strict';
import { createRemoteAuthorityAdmissionProducer } from '../runtime/remote-authority-admission.mjs';

function persistenceHarness() {
  const records = { artifact: {} };
  return {
    records,
    api: {
      createMany: async (entries) => {
        const staged = structuredClone(records);
        for (const { type, input } of entries) {
          if (staged[type]?.[input.id]) throw new Error(`Duplicate ${type} id: ${input.id}`);
          staged[type] ??= {};
          staged[type][input.id] = structuredClone(input);
        }
        records.artifact = staged.artifact;
      },
    },
  };
}

const actorContext = Object.freeze({ actor_id: 'owner-1', issuer: 'agentos:overseer', authenticated: true });
const candidate = Object.freeze({
  admission_state: 'AWAITING_AUTHORITY',
  delivery_id: 'delivery-regression-1',
  request_id: 'request-regression-1',
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
  evidence_id: 'authority-evidence-regression-1',
  mission_id: 'mission-regression-1',
});

function createProducer(p, authoritySource) {
  let ids = 0;
  return createRemoteAuthorityAdmissionProducer({
    persistence: p.api,
    trustedIssuers: ['agentos:overseer'],
    allowedCapabilities: ['shell.powershell.dev.execute'],
    now: () => new Date('2026-09-14T05:00:00.000Z'),
    idFactory: () => `regression-${++ids}`,
    authoritySource,
  });
}

test('missing authenticated actor fails before grant resolution and leaves zero durable artifacts', async () => {
  const p = persistenceHarness();
  let resolutions = 0;
  const admission = createProducer(p, {
    resolveGrant: async () => { resolutions += 1; return validGrant; },
  });

  await assert.rejects(
    admission.admit({ candidate, targetHostId: 'host-1' }),
    (error) => error.message === 'REMOTE_ACTOR_NOT_AUTHENTICATED',
  );
  assert.equal(resolutions, 0);
  assert.equal(Object.keys(p.records.artifact).length, 0);
});

test('authenticated actor binding mismatch fails before grant resolution and leaves zero durable artifacts', async () => {
  const p = persistenceHarness();
  let resolutions = 0;
  const admission = createProducer(p, {
    resolveGrant: async () => { resolutions += 1; return validGrant; },
  });

  await assert.rejects(
    admission.admit({ candidate, actorContext: { ...actorContext, actor_id: 'other-owner' }, targetHostId: 'host-1' }),
    (error) => error.message === 'REMOTE_ACTOR_CONTEXT_MISMATCH',
  );
  assert.equal(resolutions, 0);
  assert.equal(Object.keys(p.records.artifact).length, 0);
});

test('missing canonical grant evidence fails closed and leaves zero durable artifacts', async () => {
  const p = persistenceHarness();
  const admission = createProducer(p, { resolveGrant: async () => null });

  await assert.rejects(
    admission.admit({ candidate, actorContext, targetHostId: 'host-1' }),
    (error) => error.message === 'REMOTE_AUTHORITY_GRANT_REQUIRED',
  );
  assert.equal(Object.keys(p.records.artifact).length, 0);
});

test('grant provenance mismatch cannot persist admission artifacts', async () => {
  for (const [field, value] of [
    ['actor_id', 'other-owner'],
    ['issuer', 'agentos:other-issuer'],
    ['project_id', 'other-project'],
  ]) {
    const p = persistenceHarness();
    const admission = createProducer(p, {
      resolveGrant: async () => ({ ...validGrant, [field]: value }),
    });

    await assert.rejects(
      admission.admit({ candidate, actorContext, targetHostId: 'host-1' }),
      (error) => error.message === 'REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH',
    );
    assert.equal(Object.keys(p.records.artifact).length, 0);
  }
});

test('reusing the same grant cannot bypass request and delivery replay denial', async () => {
  const p = persistenceHarness();
  const admission = createProducer(p, { resolveGrant: async () => validGrant });

  const first = await admission.admit({ candidate, actorContext, targetHostId: 'host-1' });
  assert.equal(first.task.authority_evidence_id, validGrant.evidence_id);
  assert.equal(Object.keys(p.records.artifact).length, 2);

  await assert.rejects(
    admission.admit({ candidate, actorContext, targetHostId: 'host-1' }),
    (error) => error.message === 'REMOTE_ADMISSION_REPLAY_OR_CONFLICT',
  );
  assert.equal(Object.keys(p.records.artifact).length, 2);
});
