import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createPersistenceBridge } from '../runtime/persistence-bridge.mjs';
import { activateOverseer, bootstrapOverseer, OVERSEER_ID } from '../runtime/overseer-bootstrap.mjs';
import { createOverseerSession } from '../runtime/overseer-session.mjs';
import { createTaskPipeline } from '../runtime/task-pipeline.mjs';
import { createModelRegistry } from '../runtime/model-registry.mjs';
import { createOverseerRouter } from '../runtime/overseer-router.mjs';
import { createProviderAdapter } from '../runtime/provider-adapter.mjs';
import { createProviderExecutor } from '../runtime/provider-executor.mjs';

function createPersistence() {
  return createPersistenceBridge(createStateStore());
}

test('M1 session rejects offline and unroutable turns, then records one routed fake execution', async () => {
  const persistence = createPersistence();
  const selected = { id: 'model:free', providerId: 'provider:fake', available: true, access: 'free', quality: 1, capabilities: { reasoning: true } };
  const executeCalls = [];
  const router = { async select() { return { selected, reason: 'suitable-free-model' }; } };
  const session = createOverseerSession({
    persistence,
    router,
    async execute(input) {
      executeCalls.push(input);
      return { runId: 'run:m1-session', output: 'local-only' };
    },
  });

  await assert.rejects(() => session.send({ missionId: 'mission:1', message: 'safe', task: {} }), /OVERSEER_OFFLINE/);
  await bootstrapOverseer({ persistence });
  await activateOverseer({ persistence });

  const noRoute = createOverseerSession({ persistence, router: { async select() { return { selected: null, reason: 'no-eligible-model' }; } }, execute: async () => ({}) });
  await assert.rejects(() => noRoute.send({ missionId: 'mission:1', message: 'safe', task: {} }), /NO_SUITABLE_MODEL/);

  const result = await session.send({ missionId: 'mission:1', message: 'safe', task: { requirements: { reasoning: true } } });
  assert.equal(result.result.runId, 'run:m1-session');
  assert.equal(executeCalls.length, 1);
  assert.deepEqual(executeCalls[0], {
    agentId: OVERSEER_ID,
    missionId: 'mission:1',
    model: selected,
    message: 'safe',
    task: { requirements: { reasoning: true } },
  });
  const events = await persistence.list('event');
  assert.equal(events.at(-1).eventType, 'overseer.turn.completed');
  assert.equal(events.at(-1).modelId, 'model:free');
});

test('M1 task pipeline validates input and delegates a stable free-preferred envelope', async () => {
  const calls = [];
  const pipeline = createTaskPipeline({ session: { async send(input) { calls.push(input); return { ok: true }; } } });
  await assert.rejects(() => pipeline.handle({ missionId: '', message: 'safe' }), /missionId and message are required/);
  const result = await pipeline.handle({ missionId: 'mission:pipeline', message: 'safe', requirements: { reasoning: true } });
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(calls, [{
    missionId: 'mission:pipeline',
    message: 'safe',
    task: { requirements: { reasoning: true }, freePreferred: true, source: 'overseer-user-chat' },
  }]);
});

test('M1 model registry/router uses available fake models and fails closed when none are eligible', async () => {
  const free = { id: 'model:free', available: true, access: 'free', quality: 1, capabilities: { reasoning: true } };
  const hidden = { id: 'model:hidden', available: false, access: 'free', quality: 99, capabilities: { reasoning: true } };
  const registry = createModelRegistry({ providers: [{ async listAvailable() { return [free, hidden]; } }, {}] });
  const models = await registry.listAvailable();
  assert.deepEqual(models, [free]);
  assert.equal(Object.isFrozen(models), true);

  const router = createOverseerRouter({ modelRegistry: registry });
  const route = await router.select({ task: { requirements: { reasoning: true }, freePreferred: true } });
  assert.equal(route.selected, free);
  assert.equal(route.reason, 'suitable-free-model');

  const noModelRoute = await createOverseerRouter({ modelRegistry: { async listAvailable() { return []; } } }).select({ task: { requirements: {} } });
  assert.equal(noModelRoute.selected, null);
  assert.equal(noModelRoute.reason, 'no-eligible-model');
});

test('M1 provider adapters normalize only fake metadata and executor forwards a bounded payload', async () => {
  const executeCalls = [];
  const adapter = createProviderAdapter({
    id: 'provider:fake',
    async listAvailable() { return [{ id: 'model:fake', available: true, access: 'free', quality: 1 }]; },
    async execute(input) { executeCalls.push(input); return { output: 'fake-only' }; },
  });
  const models = await adapter.listAvailable();
  assert.equal(models[0].providerId, 'provider:fake');
  assert.equal(Object.isFrozen(models), true);
  assert.equal(Object.isFrozen(models[0]), true);

  const executor = createProviderExecutor({ providers: { get(id) { return id === 'provider:fake' ? adapter : null; } } });
  const model = models[0];
  const response = await executor.execute({ model, message: 'safe', task: { source: 'test' }, context: { localOnly: true } });
  assert.deepEqual(response, { output: 'fake-only' });
  assert.deepEqual(executeCalls[0], { model, input: { message: 'safe', task: { source: 'test' } }, context: { localOnly: true } });
  await assert.rejects(() => executor.execute({ model: { id: 'missing-provider' }, message: 'safe', task: {} }), /MODEL_PROVIDER_MISSING/);
  await assert.rejects(() => executor.execute({ model: { id: 'missing', providerId: 'provider:missing' }, message: 'safe', task: {} }), /PROVIDER_UNAVAILABLE:provider:missing/);
});

console.log('M1 session, routing, and provider contract tests passed');
