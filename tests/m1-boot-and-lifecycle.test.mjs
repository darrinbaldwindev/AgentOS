import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createPersistenceBridge } from '../runtime/persistence-bridge.mjs';
import { bootAgentOS } from '../runtime/agentos-boot.mjs';
import { activateOverseer, bootstrapOverseer, OVERSEER_ID } from '../runtime/overseer-bootstrap.mjs';

function createPersistence() {
  return createPersistenceBridge(createStateStore());
}

test('M1 boot creates, activates, and records one eligible Overseer with fake adapters', async () => {
  const persistence = createPersistence();
  const probeCalls = [];
  const model = { id: 'model:free', providerId: 'provider:fake', available: true, access: 'free', quality: 1, capabilities: { reasoning: true } };
  const boot = await bootAgentOS({
    persistence,
    capabilityProbe: {
      async probe(agentId) {
        probeCalls.push(agentId);
        return { evaluation: { eligible: true } };
      },
    },
    modelRegistry: { async listAvailable() { return [model]; } },
    continuityCheck: async () => ({ ok: true }),
    now: () => '2026-08-25T00:00:00.000Z',
  });

  assert.equal(boot.status, 'online');
  assert.equal(boot.overseer.id, OVERSEER_ID);
  assert.equal(boot.overseer.status, 'online');
  assert.deepEqual(probeCalls, [OVERSEER_ID]);
  assert.equal(boot.models[0], model);
  assert.equal(Object.isFrozen(boot), true);
  const events = await persistence.list('event');
  assert.equal(events.at(-1).eventType, 'agentos.boot.completed');
  assert.equal(events.at(-1).availableModelCount, 1);
});

test('M1 boot fails closed on continuity or eligibility failure without completing boot', async () => {
  const continuityPersistence = createPersistence();
  await assert.rejects(
    () => bootAgentOS({
      persistence: continuityPersistence,
      capabilityProbe: { async probe() { throw new Error('unexpected'); } },
      modelRegistry: { async listAvailable() { return []; } },
      continuityCheck: async () => ({ ok: false }),
    }),
    /CONTINUITY_CHECK_FAILED/
  );
  assert.equal((await continuityPersistence.list('agent')).length, 0);

  const eligibilityPersistence = createPersistence();
  await assert.rejects(
    () => bootAgentOS({
      persistence: eligibilityPersistence,
      capabilityProbe: { async probe() { return { evaluation: { eligible: false } }; } },
      modelRegistry: { async listAvailable() { return []; } },
      continuityCheck: async () => ({ ok: true }),
    }),
    /OVERSEER_NOT_ELIGIBLE/
  );
  assert.equal((await eligibilityPersistence.list('event')).length, 0);
});

test('M1 bootstrap restores one persistent Overseer and activation requires bootstrapping', async () => {
  const persistence = createPersistence();
  await assert.rejects(() => activateOverseer({ persistence }), /OVERSEER_NOT_BOOTSTRAPPED/);

  const created = await bootstrapOverseer({ persistence, now: () => '2026-08-25T01:00:00.000Z' });
  const restored = await bootstrapOverseer({ persistence, now: () => '2026-08-25T02:00:00.000Z' });
  const active = await activateOverseer({ persistence, now: () => '2026-08-25T03:00:00.000Z' });

  assert.equal(created.created, true);
  assert.equal(restored.created, false);
  assert.equal(created.agent.id, OVERSEER_ID);
  assert.equal(restored.agent.id, OVERSEER_ID);
  assert.equal(active.status, 'online');
  assert.equal(active.lastActivatedAt, '2026-08-25T03:00:00.000Z');
  assert.equal(Object.isFrozen(created), true);
  assert.equal(Object.isFrozen(restored), true);
});

console.log('M1 boot and lifecycle contract tests passed');
