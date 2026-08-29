export const SKILL_AGENT_TIERS = Object.freeze({
  '2.1': 1,
  '2.2': 2,
  '2.3': 3,
  '3': 8,
  '4': Infinity,
});

export function createSkillAgentRegistry({ tier = 'free' } = {}) {
  const agents = new Map();
  const limit = SKILL_AGENT_TIERS[tier] ?? 0;

  function canCreate() {
    return agents.size < limit;
  }

  function register(agent) {
    if (!agent?.id || !agent?.name || !agent?.capabilities?.length) throw new Error('skill agent requires id, name and capabilities');
    if (agents.has(agent.id)) return agents.get(agent.id);
    if (!canCreate()) throw new Error(`skill agent limit reached for tier ${tier}`);
    const record = { ...agent, managed_by: agent.managed_by ?? 'agentos', created_at: agent.created_at ?? new Date().toISOString() };
    agents.set(record.id, record);
    return record;
  }

  function list() { return [...agents.values()]; }

  function findByCapability(capability) {
    return list().filter(agent => agent.capabilities.includes(capability));
  }

  return { canCreate, register, list, findByCapability, limit };
}
