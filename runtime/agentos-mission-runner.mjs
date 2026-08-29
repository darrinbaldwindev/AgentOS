export function createAgentOSMissionRunner({ mission, decisionLoop, orchestrator } = {}) {
  if (!mission?.start || !decisionLoop?.run || !orchestrator?.resumeAfterHuman) throw new TypeError('mission, decisionLoop and orchestrator are required');

  async function start(input) {
    return mission.start(input);
  }

  async function resume({ missionId, decision, note = '', message, task = {} } = {}) {
    const gate = orchestrator.resumeAfterHuman({ missionId, decision, note });
    return decisionLoop.run({ missionId, message: message ?? gate.checkpoint?.context?.message ?? 'Resume mission', task: task ?? gate.checkpoint?.context?.task ?? {} });
  }

  return Object.freeze({ start, resume });
}
