import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createPersistenceBridge } from '../runtime/persistence-bridge.mjs';
import { bootstrapOverseer, activateOverseer, OVERSEER_ID } from '../runtime/overseer-bootstrap.mjs';
import { createOverseerRouter } from '../runtime/overseer-router.mjs';
import { createOverseerSession } from '../runtime/overseer-session.mjs';
import { createOverseerAuditor } from '../runtime/overseer-auditor.mjs';

 test('Overseer turn routes, persists, and audits through one boundary', async () => {
  const persistence = createPersistenceBridge(createStateStore());
  await bootstrapOverseer({ persistence });
  await activateOverseer({ persistence });
  const mission = await persistence.create('project', { id: 'mission:session-audit', name: 'Session audit' });
  const model = { id: 'model:test', providerId: 'provider:test', available: true, access: 'free', quality: 1, capabilities: { reasoning: true } };
  const router = createOverseerRouter({ modelRegistry: { async listAvailable() { return [model]; } } });
  const auditor = createOverseerAuditor({ persistence });
  const execute = async () => {
    const run = await persistence.create('run', { id: 'run:session-audit', missionId: mission.id, agentId: OVERSEER_ID, status: 'completed' });
    await persistence.create('event', { runId: run.id, missionId: mission.id, eventType: 'run.completed' });
    return { runId: run.id, output: 'ok' };
  };

  const session = createOverseerSession({ persistence, router, execute, auditor });
  const response = await session.send({ missionId: mission.id, message: 'complete task', task: { requirements: { reasoning: true } } });

  assert.equal(response.result.runId, 'run:session-audit');
  assert.equal(response.audit.audit.severity, 'info');
  assert.equal(response.audit.audit.findings[0].code, 'RUN_HEALTHY');
  assert.equal((await persistence.get('agent', OVERSEER_ID)).id, OVERSEER_ID);
  assert.equal((await persistence.list('artifact')).length, 1);
  assert.equal((await persistence.list('event')).some((event) => event.eventType === 'overseer.audit.completed'), true);
});
