export function createHumanGate() {
  const pending = new Map();

  function request({ missionId, reason, context = {} } = {}) {
    if (!missionId) throw new Error('missionId is required');
    const item = Object.freeze({ missionId, reason, context, status: 'pending', createdAt: new Date().toISOString() });
    pending.set(missionId, item);
    return item;
  }

  function resolve({ missionId, decision, note = '' } = {}) {
    const item = pending.get(missionId);
    if (!item) throw new Error('no pending human gate for mission');
    const resolved = Object.freeze({ ...item, status: 'resolved', decision, note, resolvedAt: new Date().toISOString() });
    pending.set(missionId, resolved);
    return resolved;
  }

  function get(missionId) { return pending.get(missionId) ?? null; }
  function listPending() { return [...pending.values()].filter(item => item.status === 'pending'); }

  return Object.freeze({ request, resolve, get, listPending });
}
