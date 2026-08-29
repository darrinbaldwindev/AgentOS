export const MISSION_STATES = Object.freeze(['pending', 'running', 'awaiting_human', 'completed', 'failed', 'cancelled']);

export function createMissionStore() {
  const missions = new Map();
  function create({ id, task, message } = {}) {
    if (!id) throw new Error('mission id is required');
    const mission = { id, task, message, state: 'pending', version: 1, updatedAt: new Date().toISOString() };
    missions.set(id, mission);
    return { ...mission };
  }
  function transition(id, state, patch = {}) {
    if (!MISSION_STATES.includes(state)) throw new Error('invalid mission state');
    const current = missions.get(id);
    if (!current) throw new Error('mission not found');
    const next = { ...current, ...patch, state, version: current.version + 1, updatedAt: new Date().toISOString() };
    missions.set(id, next);
    return { ...next };
  }
  function get(id) { const mission = missions.get(id); return mission ? { ...mission } : null; }
  return Object.freeze({ create, transition, get });
}
