import test from 'node:test';
import assert from 'node:assert/strict';
import { createRemoteAuthorityAdmissionProducer } from '../runtime/remote-authority-admission.mjs';

function harness() {
  const artifacts = {};
  const persistence = {
    createMany: async (entries) => {
      const staged = structuredClone(artifacts);
      for (const { type, input } of entries) {
        assert.equal(type, 'artifact');
        if (staged[input.id]) throw new Error(`duplicate:${input.id}`);
        staged[input.id] = structuredClone(input);
      }
      Object.assign(artifacts, staged);
    },
  };
  return { artifacts, persistence };
}

const actorContext = Object.freeze({ actor_id: 'owner-correlation', issuer: 'agentos:overseer', authenticated: true });
const candidate = Object.freeze({
  admission_state: 'AWAITING_AUTHORITY',
  delivery_id: 'delivery-correlation',
  request_id: 'request-correlation',
  actor_id: actorContext.actor_id,
  issuer: actorContext.issuer,
  project_id: 'agentos-local',
  objective: 'preserve exact remote admission correlation',
  requested_capabilities: ['shell.powershell.dev.execute'],
  scope: ['local-runtime'],
  constraints: ['DRY_RUN only'],
});
const grant = Object.freeze({
  status: 'GRANTED',
  actor_id: actorContext.actor_id,
  issuer: actorContext.issuer,
  project_id: candidate.project_id,
  granted_capabilities: ['shell.powershell.dev.execute'],
  evidence_id: 'authority-evidence-correlation',
  mission_id: 'mission-correlation',
});

function producer(h, { trustedIssuers = [actorContext.issuer], allowedCapabilities = ['shell.powershell.dev.execute'] } = {}) {
  let id = 0;
  return createRemoteAuthorityAdmissionProducer({
    persistence: h.persistence,
    authoritySource: { resolveGrant: async () => grant },
    trustedIssuers,
    allowedCapabilities,
    now: () => new Date('2026-09-14T07:00:00.000Z'),
    idFactory: () => `correlation-${++id}`,
  });
}

test('successful admission preserves exact delivery/request/task/mission/wake/authority correlation in both durable artifacts', async () => {
  const h = harness();
  const result = await producer(h).admit({ candidate, actorContext, targetHostId: 'host-correlation' });
  const records = Object.values(h.artifacts);
  assert.equal(records.length, 2);
  const marker = records.find((record) => record.artifactType === 'remote.admission.request');
  const dispatch = records.find((record) => record.artifactType === 'dispatch.task');
  assert.ok(marker);
  assert.ok(dispatch);

  const task = result.task;
  assert.equal(task.delivery_id, candidate.delivery_id);
  assert.equal(task.request_id, candidate.request_id);
  assert.equal(task.mission_id, grant.mission_id);
  assert.equal(task.authority_evidence_id, grant.evidence_id);
  assert.match(task.task_id, /^task:remote:correlation-1$/);
  assert.match(task.wake_trace_id, /^wake:remote:correlation-2$/);

  assert.deepEqual(marker.payload, {
    request_id: task.request_id,
    delivery_id: task.delivery_id,
    task_id: task.task_id,
    mission_id: task.mission_id,
    authority_evidence_id: task.authority_evidence_id,
  });
  for (const field of ['delivery_id', 'request_id', 'task_id', 'mission_id', 'wake_trace_id', 'authority_evidence_id']) {
    assert.equal(dispatch.payload[field], task[field]);
  }
});

test('untrusted authenticated issuer fails before durable admission artifacts exist', async () => {
  const h = harness();
  await assert.rejects(
    producer(h, { trustedIssuers: ['agentos:different-issuer'] }).admit({ candidate, actorContext, targetHostId: 'host-correlation' }),
    (error) => error.message === 'REMOTE_ISSUER_NOT_TRUSTED',
  );
  assert.deepEqual(h.artifacts, {});
});

test('capability outside admission policy fails before durable admission artifacts exist', async () => {
  const h = harness();
  await assert.rejects(
    producer(h, { allowedCapabilities: ['repo.status'] }).admit({ candidate, actorContext, targetHostId: 'host-correlation' }),
    (error) => error.message === 'REMOTE_CAPABILITY_NOT_ALLOWED',
  );
  assert.deepEqual(h.artifacts, {});
});
