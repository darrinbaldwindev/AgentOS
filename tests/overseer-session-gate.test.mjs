import test from 'node:test';
import assert from 'node:assert/strict';
import { createOverseerSession } from '../runtime/overseer-session.mjs';

const persistence = {
  async get(type, id) { return type === 'agent' && id === 'agentos:overseer' ? { id, status: 'online' } : null; },
  async create() {},
};

const connected = {
  github: { probeRead: async () => true },
  continuity: { probeRead: async () => true },
  handoff: { probe: async () => true },
};

test('session blocks execution before routing when required connectivity is unavailable', async () => {
  let routed = false;
  let executed = false;
  const session = createOverseerSession({
    persistence,
    router: { select: async () => { routed = true; return { selected: { id: 'model' } }; } },
    execute: async () => { executed = true; },
    integrations: { ...connected, github: { probeRead: async () => false } },
  });
  await assert.rejects(
    () => session.send({ missionId: 'm1', message: 'test', task: {} }),
    (error) => error?.code === 'AGENT_NOT_ELIGIBLE'
  );
  assert.equal(routed, false);
  assert.equal(executed, false);
});

test('session proceeds to routing after eligibility is verified', async () => {
  let executed = false;
  const session = createOverseerSession({
    persistence,
    router: { select: async () => ({ selected: { id: 'model' }, reason: 'test' }) },
    execute: async () => { executed = true; return { runId: 'r1' }; },
    integrations: connected,
  });
  const result = await session.send({ missionId: 'm1', message: 'test', task: {} });
  assert.equal(executed, true);
  assert.equal(result.eligibility.eligible, true);
});
