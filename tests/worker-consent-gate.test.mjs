import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWorkerConsentGate,
  WORKER_CONSENT_STATES,
} from '../runtime/worker-consent-gate.mjs';

function actorContext() {
  return Object.freeze({ actor_id: 'agentos:overseer', project_id: 'agentos-local' });
}

function task() {
  return Object.freeze({
    task_id: 'task-consent-1',
    mission_id: 'mission-consent-1',
    project_id: 'agentos-local',
    required_capabilities: Object.freeze(['shell.powershell.repo.read']),
    scope: Object.freeze(['local-runtime']),
    execution: Object.freeze({ adapter: 'windows-powershell', operation: 'repo.status' }),
  });
}

function registryHarness() {
  const records = [];
  return {
    registry: {
      async record(entry) {
        records.push(entry);
        return Object.freeze({ intervention_id: `int-${records.length}` });
      },
    },
    records,
  };
}

test('PRE_AUTHORIZED passes without intervention and does not mutate task or actor context', async () => {
  const actor = actorContext();
  const input = task();
  const actorSnapshot = structuredClone(actor);
  const taskSnapshot = structuredClone(input);
  const h = registryHarness();
  const gate = createWorkerConsentGate({
    resolveConsent: async () => ({
      state: WORKER_CONSENT_STATES.PRE_AUTHORIZED,
      decision_id: 'consent-pre-1',
    }),
    interventions: h.registry,
  });

  const result = await gate.assertAllowed({ actorContext: actor, task: input });
  assert.equal(result.state, 'PRE_AUTHORIZED');
  assert.equal(result.confirmed, false);
  assert.equal(result.decision_id, 'consent-pre-1');
  assert.equal(h.records.length, 0);
  assert.deepEqual(actor, actorSnapshot);
  assert.deepEqual(input, taskSnapshot);
});

test('CONFIRMATION_REQUIRED without confirmation blocks before invocation boundary and records intervention', async () => {
  const h = registryHarness();
  let downstreamCalls = 0;
  const gate = createWorkerConsentGate({
    resolveConsent: async () => ({
      state: WORKER_CONSENT_STATES.CONFIRMATION_REQUIRED,
      decision_id: 'consent-confirm-1',
      reason: 'owner confirmation required',
      required_authority: 'owner',
      confirmed: false,
    }),
    interventions: h.registry,
  });

  await assert.rejects(
    async () => {
      await gate.assertAllowed({ actorContext: actorContext(), task: task() });
      downstreamCalls += 1;
    },
    (error) => error?.code === 'WORKER_CONSENT_CONFIRMATION_REQUIRED',
  );

  assert.equal(downstreamCalls, 0);
  assert.equal(h.records.length, 1);
  assert.equal(h.records[0].blocked_operation, 'repo.status');
  assert.equal(h.records[0].required_authority, 'owner');
});

test('CONFIRMATION_REQUIRED with explicit confirmation passes consent only', async () => {
  const h = registryHarness();
  const input = task();
  const inputSnapshot = structuredClone(input);
  const gate = createWorkerConsentGate({
    resolveConsent: async () => ({
      state: WORKER_CONSENT_STATES.CONFIRMATION_REQUIRED,
      decision_id: 'consent-confirm-2',
      confirmed: true,
    }),
    interventions: h.registry,
  });

  const result = await gate.assertAllowed({ actorContext: actorContext(), task: input });
  assert.equal(result.state, 'CONFIRMATION_REQUIRED');
  assert.equal(result.confirmed, true);
  assert.equal(h.records.length, 0);
  assert.deepEqual(input, inputSnapshot);
  assert.deepEqual(input.required_capabilities, ['shell.powershell.repo.read']);
  assert.deepEqual(input.scope, ['local-runtime']);
});

test('PROHIBITED always blocks even when resolver reports confirmed=true', async () => {
  const h = registryHarness();
  const gate = createWorkerConsentGate({
    resolveConsent: async () => ({
      state: WORKER_CONSENT_STATES.PROHIBITED,
      decision_id: 'consent-prohibited-1',
      confirmed: true,
      reason: 'outside policy',
    }),
    interventions: h.registry,
  });

  await assert.rejects(
    () => gate.assertAllowed({ actorContext: actorContext(), task: task() }),
    (error) => error?.code === 'WORKER_CONSENT_PROHIBITED',
  );
  assert.equal(h.records.length, 1);
});

test('unknown or malformed consent decisions fail closed', async () => {
  const malformed = createWorkerConsentGate({ resolveConsent: async () => null });
  await assert.rejects(
    () => malformed.assertAllowed({ actorContext: actorContext(), task: task() }),
    (error) => error?.code === 'WORKER_CONSENT_DECISION_INVALID',
  );

  const unknown = createWorkerConsentGate({ resolveConsent: async () => ({ state: 'ALLOW' }) });
  await assert.rejects(
    () => unknown.assertAllowed({ actorContext: actorContext(), task: task() }),
    (error) => error?.code === 'WORKER_CONSENT_STATE_INVALID',
  );
});

test('missing intervention registry does not weaken deny behavior', async () => {
  const gate = createWorkerConsentGate({
    resolveConsent: async () => ({ state: WORKER_CONSENT_STATES.PROHIBITED }),
  });
  await assert.rejects(
    () => gate.assertAllowed({ actorContext: actorContext(), task: task() }),
    (error) => error?.code === 'WORKER_CONSENT_PROHIBITED',
  );
});
