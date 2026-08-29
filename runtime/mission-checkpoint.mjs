export function createMissionCheckpointStore() {
  const checkpoints = new Map();
  function save({ missionId, state, context = {}, nextAction = null } = {}) {
    if (!missionId) throw new Error('missionId is required');
    const checkpoint = Object.freeze({ missionId, state, context, nextAction, savedAt: new Date().toISOString() });
    checkpoints.set(missionId, checkpoint);
    return checkpoint;
  }
  function load(missionId) { return checkpoints.get(missionId) ?? null; }
  function clear(missionId) { checkpoints.delete(missionId); }
  return Object.freeze({ save, load, clear });
}
