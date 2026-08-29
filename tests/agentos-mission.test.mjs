import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentOSMission } from '../runtime/agentos-mission.mjs';
import { createMissionStore } from '../runtime/mission-state.mjs';
import { createMissionCheckpointStore } from '../runtime/mission-checkpoint.mjs';
import { createHumanGate } from '../runtime/overseer-human-gate.mjs';
import { createMissionOrchestrator } from '../runtime/mission-orchestrator.mjs';

test('AgentOS mission facade completes a successful mission', async () => {
  const missionStore = createMissionStore();
  const orchestrator = createMissionOrchestrator({ missions: missionStore, checkpoints: createMissionCheckpointStore(), humanGate: createHumanGate() });
  const app = createAgentOSMission({
    missionStore,
    orchestrator,
    decisionLoop: { run: async () => ({ status: 'completed', result: { output: 'done' }, observation: { quality: 0.95 } }) },
  });
  const result = await app.start({ missionId: 'm1', message: 'test', task: {} });
  assert.equal(result.mission.state, 'completed');
  assert.equal(result.mission.result.output, 'done');
});

test('AgentOS mission facade creates a human gate when blocked', async () => {
  const missionStore = createMissionStore();
  const checkpoints = createMissionCheckpointStore();
  const humanGate = createHumanGate();
  const orchestrator = createMissionOrchestrator({ missions: missionStore, checkpoints, humanGate });
  const app = createAgentOSMission({ missionStore, orchestrator, decisionLoop: { run: async () => ({ status: 'blocked', route: { reason: 'budget_exhausted' } }) } });
  const result = await app.start({ missionId: 'm2', message: 'blocked', task: {} });
  assert.equal(result.mission.state, 'awaiting_human');
  assert.equal(humanGate.get('m2').status, 'pending');
});
