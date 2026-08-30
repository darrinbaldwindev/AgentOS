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
  const decisionLoop = { run: async () => ({ status: 'completed', result: { output: 'done' }, observation: { quality: 0.96 } }) };
  const mission = createAgentOSMission({ decisionLoop, missionStore, orchestrator });
  const runner = createAgentOSMissionRunner({ mission, decisionLoop, orchestrator, missionStore });
  const result = await runner.start({ missionId: 'vertical-1', message: 'Complete a test task', task: {} });
  assert.equal(result.mission.state, 'completed');
  assert.equal(result.result.output, 'done');
});

test('full vertical runtime preserves context through human pause and resume', async () => {
  const missionStore = createMissionStore();
  const checkpoints = createMissionCheckpointStore();
  const humanGate = createHumanGate();
  const orchestrator = createMissionOrchestrator({ missions: missionStore, checkpoints, humanGate });
  let blocked = true;
  let resumedInput;
  const decisionLoop = { run: async input => {
    if (blocked) {
      blocked = false;
      return { status: 'blocked', route: { reason: 'needs_human' } };
    }
    resumedInput = input;
    return { status: 'completed', result: { output: 'resumed-ok' }, observation: { quality: 0.95 } };
  } };
  const mission = createAgentOSMission({ decisionLoop, missionStore, orchestrator });
  const runner = createAgentOSMissionRunner({ mission, decisionLoop, orchestrator, missionStore });
  const paused = await runner.start({ missionId: 'vertical-2', message: 'Test human gate', task: { action: 'continue' } });
  assert.equal(paused.mission.state, 'awaiting_human');
  assert.equal(humanGate.get('vertical-2').status, 'pending');
  const checkpoint = checkpoints.load('vertical-2');
  assert.equal(checkpoint.context.message, 'Test human gate');
  assert.deepEqual(checkpoint.context.task, { action: 'continue' });
  const resumed = await runner.resume({ missionId: 'vertical-2', decision: 'approve', note: 'continue' });
  assert.equal(resumed.status, 'completed');
  assert.equal(resumedInput.message, 'Test human gate');
  assert.deepEqual(resumedInput.task, { action: 'continue' });
  assert.equal(missionStore.get('vertical-2').state, 'completed');
});
