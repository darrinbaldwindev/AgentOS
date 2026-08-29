export function createAgentOSMissionRunner({ mission, decisionLoop, orchestrator, missionStore } = {}) {
  if (!mission?.start || !decisionLoop?.run || !orchestrator?.resumeAfterHuman || !missionStore?.get) throw new TypeError('mission, decisionLoop, orchestrator and missionStore are required');

  async function start(input) {
    return mission.start(input);
  }

  async function resume({ missionId, decision, note = '', message, task } = {}) {
    const gate = orchestrator.resumeAfterHuman({ missionId, decision, note });
    const checkpointTask = gate.checkpoint?.context?.task ?? {};
    const checkpointMessage = gate.checkpoint?.context?.message ?? 'Resume mission';
    const outcome = await decisionLoop.run({ missionId, message: message ?? checkpointMessage, task: task ?? checkpointTask });
    if (outcome.status === 'completed' && missionStore.get(missionId)?.state === 'running') {
      missionStore.transition(missionId, 'completed', { result: outcome.result, observation: outcome.observation });
    }
    return { ...outcome, mission: missionStore.get(missionId) };
  }

  return Object.freeze({ start, resume });
}
