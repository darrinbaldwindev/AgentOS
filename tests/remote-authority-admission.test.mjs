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
  delivery_id: 'delivery-1',
  request_id: 'request-1',
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
  evidence_id: 'authority-evidence-1',
  mission_id: 'mission-1',
});

function producer(p, overrides = {}) {
  let ids = 0;
  return createRemoteAuthorityAdmissionProducer({
    persistence: p.api,
    trustedIssuers: ['agentos:overseer'],
    allowedCapabilities: ['shell.powershell.dev.execute'],
    now: () => new Date('2026-09-13T12:00:00.000Z'),
    idFactory: () => `id-${++ids}`,
    authoritySource: { resolveGrant: async () => validGrant },
    ...overrides,
  });
}

test('derives authority-bearing task fields from locally bound grant evidence and atomically persists request marker plus dispatch task', async () => {
  const p = persistenceHarness();
  const result = await producer(p).admit({
    candidate,
    actorContext,
    targetHostId: 'host-1',
    execution: { adapter: 'windows-powershell', operation: 'test.run', cwd: 'C:/AgentOS' },
  });
  assert.equal(result.task.authority_admitted, true);
  assert.equal(result.task.admitted_by, 'agentos:overseer');
  assert.deepEqual(result.task.authority.granted_capabilities, ['shell.powershell.dev.execute']);
  assert.equal(result.task.authority_evidence_id, 'authority-evidence-1');
  assert.equal(result.task.environment, 'DRY_RUN');
  assert.equal(result.task.pickup_state, 'QUEUED');
  assert.equal(p.records.artifact[result.artifact_id].artifactType, 'dispatch.task');
  assert.equal(p.records.artifact[result.request_marker_id].artifactType, 'remote.admission.request');
});

test('rejects an unauthenticated or mismatched actor context before authority resolution', async () => {
  const p = persistenceHarness();
  let resolutions = 0;
  const admission = producer(p, { authoritySource: { resolveGrant: async () => { resolutions += 1; return {}; } } });
  await assert.rejects(admission.admit({ candidate, actorContext: { ...actorContext, authenticated: false }, targetHostId: 'host-1' }), /REMOTE_ACTOR_NOT_AUTHENTICATED/);
  await assert.rejects(admission.admit({ candidate, actorContext: { ...actorContext, actor_id: 'other' }, targetHostId: 'host-1' }), /REMOTE_ACTOR_CONTEXT_MISMATCH/);
  assert.equal(resolutions, 0);
});

test('rejects grant evidence bound to a different actor, issuer, or project without persisting a task', async () => {
  for (const [field, value] of [
    ['actor_id', 'other-owner'],
    ['issuer', 'agentos:other-issuer'],
    ['project_id', 'other-project'],
  ]) {
    const p = persistenceHarness();
    const grant = { ...validGrant, [field]: value };
    const admission = producer(p, { authoritySource: { resolveGrant: async () => grant } });
    await assert.rejects(
      admission.admit({ candidate, actorContext, targetHostId: 'host-1' }),
      (error) => error.message === 'REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH',
    );
    assert.equal(Object.keys(p.records.artifact).length, 0);
  }
});

test('rejects grant evidence missing actor, issuer, or project provenance without persisting a task', async () => {
  for (const field of ['actor_id', 'issuer', 'project_id']) {
    const p = persistenceHarness();
    const grant = { ...validGrant };
    delete grant[field];
    const admission = producer(p, { authoritySource: { resolveGrant: async () => grant } });
    await assert.rejects(
      admission.admit({ candidate, actorContext, targetHostId: 'host-1' }),
      (error) => error.message === 'REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH',
    );
    assert.equal(Object.keys(p.records.artifact).length, 0);
  }
});

test('rejects missing, incomplete, and out-of-policy local grants without persisting a task', async () => {
  for (const grant of [
    { status: 'DENIED' },
    { ...validGrant, granted_capabilities: [] },
    { ...validGrant, granted_capabilities: ['shell.powershell.dev.execute', 'shell.unrestricted'] },
  ]) {
    const p = persistenceHarness();
    const admission = producer(p, { authoritySource: { resolveGrant: async () => grant } });
    await assert.rejects(admission.admit({ candidate, actorContext, targetHostId: 'host-1' }));
    assert.equal(Object.keys(p.records.artifact).length, 0);
  }
});

test('same request or same delivery cannot be admitted twice', async () => {
  const p = persistenceHarness();
  const admission = producer(p);
  await admission.admit({ candidate, actorContext, targetHostId: 'host-1' });
  await assert.rejects(admission.admit({ candidate, actorContext, targetHostId: 'host-1' }), (error) => error.message === 'REMOTE_ADMISSION_REPLAY_OR_CONFLICT');
  const sameRequestNewDelivery = { ...candidate, delivery_id: 'delivery-2' };
  await assert.rejects(admission.admit({ candidate: sameRequestNewDelivery, actorContext, targetHostId: 'host-1' }), (error) => error.message === 'REMOTE_ADMISSION_REPLAY_OR_CONFLICT');
  const sameDeliveryNewRequest = { ...candidate, request_id: 'request-2' };
  await assert.rejects(admission.admit({ candidate: sameDeliveryNewRequest, actorContext, targetHostId: 'host-1' }), (error) => error.message === 'REMOTE_ADMISSION_REPLAY_OR_CONFLICT');
  assert.equal(Object.keys(p.records.artifact).length, 2);
});

test('rejects absent canonical grant evidence without persisting request or task artifacts', async () => {
  const p = persistenceHarness();
  const admission = producer(p, { authoritySource: { resolveGrant: async () => null } });
  await assert.rejects(
    admission.admit({ candidate, actorContext, targetHostId: 'host-1' }),
    (error) => error.message === 'REMOTE_AUTHORITY_GRANT_REQUIRED',
  );
  assert.equal(Object.keys(p.records.artifact).length, 0);
});

test('preserves exact delivery request task mission wake and authority evidence correlation in durable admission artifacts', async () => {
  const p = persistenceHarness();
  const result = await producer(p).admit({ candidate, actorContext, targetHostId: 'host-1' });
  const taskArtifact = p.records.artifact[result.artifact_id];
  const markerArtifact = p.records.artifact[result.request_marker_id];

  assert.equal(result.task.delivery_id, candidate.delivery_id);
  assert.equal(result.task.request_id, candidate.request_id);
  assert.equal(result.task.mission_id, validGrant.mission_id);
  assert.match(result.task.task_id, /^task:remote:/);
  assert.match(result.task.wake_trace_id, /^wake:remote:/);
  assert.equal(result.task.authority_evidence_id, validGrant.evidence_id);

  assert.equal(taskArtifact.payload.delivery_id, result.task.delivery_id);
  assert.equal(taskArtifact.payload.request_id, result.task.request_id);
  assert.equal(taskArtifact.payload.task_id, result.task.task_id);
  assert.equal(taskArtifact.payload.mission_id, result.task.mission_id);
  assert.equal(taskArtifact.payload.wake_trace_id, result.task.wake_trace_id);
  assert.equal(taskArtifact.payload.authority_evidence_id, result.task.authority_evidence_id);

  assert.deepEqual(markerArtifact.payload, {
    request_id: result.task.request_id,
    delivery_id: result.task.delivery_id,
    task_id: result.task.task_id,
    mission_id: result.task.mission_id,
    authority_evidence_id: result.task.authority_evidence_id,
  });
});
