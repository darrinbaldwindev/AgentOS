import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentOSMission } from '../runtime/agentos-mission.mjs';
import { createMissionStore } from '../runtime/mission-state.mjs';
import { createMissionCheckpointStore } from '../runtime/mission-checkpoint.mjs';
import { createHumanGate } from '../runtime/overseer-human-gate.mjs';
import { createMissionOrchestrator } from '../runtime/mission-orchestrator.mjs';
import { createAgentOSMissionRunner } from '../runtime/agentos-mission-runner.mjs';

test('full vertical runtime completes a mission', async () => {
  const missionStore = createMissionStore();
  const checkpoints = createMissionCheckpointStore();
  const humanGate = createHumanGate();
  const orchestrator = createMissionOrchestrator({ missions: missionStore, checkpoints, humanGate });
  let executions = 0;
  const decisionLoop = { run: async () => ({ status: 'completed', result: { output: ++executions === 1 ? 'done' : 'resumed' }, observation: { quality: 0.96 } }) };
  const mission = createAgentOSMission({ decisionLoop, missionStore, orchestrator });
  const runner = createAgentOSMissionRunner({ mission, decisionLoop, orchestrator });
  const result = await runner.start({ missionId: 'vertical-1', message: 'Complete a test task', task: {} });
  assert.equal(result.mission.state, 'completed');
  assert.equal(result.result.output, 'done');
});

test('full vertical runtime can pause, receive a human decision, and resume', async () => {
  const missionStore = createMissionStore();
  const checkpoints = createMissionCheckpointStore();
  const humanGate = createHumanGate();
  const orchestrator = createMissionOrchestrator({ missions: missionStore, checkpoints, humanGate });
  let blocked = true;
  const decisionLoop = { run: async () => blocked ? (blocked = false, { status: 'blocked', route: { reason: 'needs_human' } }) : ({ status: 'completed', result: { output: 'resumed-ok' }, observation: { quality: 0.95 } }) };
  const mission = createAgentOSMission({ decisionLoop, missionStore, orchestrator });
  const runner = createAgentOSMissionRunner({ mission, decisionLoop, orchestrator });
  const paused = await runner.start({ missionId: 'vertical-2', message: 'Test human gate', task: {} });
  assert.equal(paused.mission.state, 'awaiting_human');
  assert.equal(humanGate.get('vertical-2').status, 'pending');
  const resumed = await runner.resume({ missionId: 'vertical-2', decision: 'approve', note: 'continue' });
  assert.equal(resumed.status, 'completed');
  assert.equal(missionStore.get('vertical-2').state, 'running');
});
