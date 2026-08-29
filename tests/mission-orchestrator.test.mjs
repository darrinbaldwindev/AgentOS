import test from 'node:test';
import assert from 'node:assert/strict';
import { createMissionOrchestrator } from '../runtime/mission-orchestrator.mjs';
import { createMissionStore } from '../runtime/mission-state.mjs';
import { createMissionCheckpointStore } from '../runtime/mission-checkpoint.mjs';
import { createHumanGate } from '../runtime/overseer-human-gate.mjs';

test('pause and resume share one authoritative mission lifecycle', () => {
  const missions = createMissionStore();
  const checkpoints = createMissionCheckpointStore();
  const humanGate = createHumanGate();
  missions.create({ id: 'm1', task: { risk: 'high' }, message: 'mission' });
  const orchestrator = createMissionOrchestrator({ missions, checkpoints, humanGate });

  const paused = orchestrator.pauseForHuman({ missionId: 'm1', reason: 'high_risk_unresolved', context: { attempt: 2 }, nextAction: 'resume-review' });
  assert.equal(paused.mission.state, 'awaiting_human');
  assert.equal(paused.gate.status, 'pending');

  const resumed = orchestrator.resumeAfterHuman({ missionId: 'm1', decision: 'approve', note: 'continue' });
  assert.equal(resumed.mission.state, 'running');
  assert.equal(resumed.mission.humanDecision, 'approve');
  assert.equal(resumed.checkpoint.nextAction, 'resume-review');
  assert.equal(humanGate.listPending().length, 0);
});
