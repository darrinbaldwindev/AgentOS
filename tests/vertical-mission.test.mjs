import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentOSMission } from '../runtime/agentos-mission.mjs';
import { createMissionStore } from '../runtime/mission-state.mjs';
import { createMissionCheckpointStore } from '../runtime/mission-checkpoint.mjs';
import { createHumanGate } from '../runtime/overseer-human-gate.mjs';
import { createMissionOrchestrator } from '../runtime/mission-orchestrator.mjs';

test('vertical mission completes through the public facade', async () => {
  const missionStore = createMissionStore();
  const orchestrator = createMissionOrchestrator({ missions: missionStore, checkpoints: createMissionCheckpointStore(), humanGate: createHumanGate() });
  const app = createAgentOSMission({ missionStore, orchestrator, decisionLoop: { run: async input => ({ status: 'completed', task: input.task, result: { output: 'validated' }, observation: { quality: 0.96, confidence: 0.94, cost: 0.02, latencyMs: 500, success: true } }) } });
  const result = await app.start({ missionId: 'vertical-1', message: 'Perform a bounded task', task: { capabilities: ['research'] } });
  assert.equal(result.mission.state, 'completed');
  assert.equal(result.result.output, 'validated');
});

test('vertical mission stops safely when routing is blocked', async () => {
  const missionStore = createMissionStore();
  const checkpoints = createMissionCheckpointStore();
  const humanGate = createHumanGate();
  const orchestrator = createMissionOrchestrator({ missions: missionStore, checkpoints, humanGate });
  const app = createAgentOSMission({ missionStore, orchestrator, decisionLoop: { run: async () => ({ status: 'blocked', route: { reason: 'quality_or_capability_unavailable' } }) } });
  const result = await app.start({ missionId: 'vertical-2', message: 'Bounded task', task: { risk: 'high' } });
  assert.equal(result.mission.state, 'awaiting_human');
  assert.equal(humanGate.get('vertical-2').status, 'pending');
  assert.equal(checkpoints.load('vertical-2').nextAction, 'resume');
});
