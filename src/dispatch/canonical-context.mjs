export function buildCanonicalContext({ current, agents, missions, decisions }) {
  if (!current || current.stateAuthority !== '.agentos/state') {
    throw new Error('canonical state authority is not configured');
  }
  return {
    schemaVersion: current.schemaVersion,
    stateAuthority: current.stateAuthority,
    repositoryAuthority: current.repositoryAuthority,
    defaultOverseer: agents.find(agent => agent.default)?.id ?? null,
    missions: missions.missions ?? [],
    decisions: decisions.decisions ?? [],
  };
}

export function validateTaskContext(task, context) {
  if (!task.mission_id) throw new Error('mission_id is required');
  const mission = context.missions.find(item => item.id === task.mission_id);
  if (!mission) throw new Error(`unknown mission: ${task.mission_id}`);

  if (task.decision_id) {
    const decision = context.decisions.find(item => item.id === task.decision_id);
    if (!decision) throw new Error(`unknown decision: ${task.decision_id}`);
    if (decision.status !== 'accepted') throw new Error(`decision is not accepted: ${task.decision_id}`);
  }
  return true;
}
