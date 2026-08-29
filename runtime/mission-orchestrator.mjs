export function createMissionOrchestrator({ missions, checkpoints, humanGate } = {}) {
  if (!missions || !checkpoints || !humanGate) throw new TypeError('missions, checkpoints and humanGate are required');

  function pauseForHuman({ missionId, reason, context = {}, nextAction = null } = {}) {
    const checkpoint = checkpoints.save({ missionId, state: 'awaiting_human', context, nextAction });
    const mission = missions.transition(missionId, 'awaiting_human', { reason, checkpointAt: checkpoint.savedAt });
    const gate = humanGate.request({ missionId, reason, context: { ...context, checkpoint } });
    return { mission, checkpoint, gate };
  }

  function resumeAfterHuman({ missionId, decision, note = '' } = {}) {
    const gate = humanGate.resolve({ missionId, decision, note });
    const checkpoint = checkpoints.load(missionId);
    if (!checkpoint) throw new Error('mission checkpoint not found');
    const mission = missions.transition(missionId, 'running', { humanDecision: decision, humanNote: note, resumedFrom: checkpoint.savedAt });
    return { mission, checkpoint, gate };
  }

  return Object.freeze({ pauseForHuman, resumeAfterHuman });
}
