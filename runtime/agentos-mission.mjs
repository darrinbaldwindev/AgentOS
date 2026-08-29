export function createAgentOSMission({ decisionLoop, missionStore, orchestrator } = {}) {
  if (!decisionLoop?.run || !missionStore?.create || !orchestrator?.pauseForHuman) throw new TypeError('decisionLoop, missionStore and orchestrator are required');

  async function start({ missionId, message, task = {} } = {}) {
    const mission = missionStore.create({ id: missionId, task, message });
    missionStore.transition(missionId, 'running');
    const outcome = await decisionLoop.run({ missionId, message, task });
    if (outcome.status === 'blocked') {
      orchestrator.pauseForHuman({ missionId, reason: outcome.route?.reason ?? 'blocked', context: { task, route: outcome.route }, nextAction: 'resume' });
      return { ...outcome, mission: missionStore.get(missionId) };
    }
    missionStore.transition(missionId, 'completed', { result: outcome.result, observation: outcome.observation });
    return { ...outcome, mission: missionStore.get(missionId) };
  }

  return Object.freeze({ start });
}
