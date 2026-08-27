export const TERMINAL_STATES = new Set([
  'completed',
  'blocked',
  'escalated',
  'cancelled',
  'superseded',
]);

export const VALID_TRANSITIONS = new Map([
  ['queued', new Set(['claimed'])],
  ['claimed', new Set(['working', 'blocked', 'escalated', 'cancelled'])],
  ['working', new Set(['verification', 'blocked', 'escalated', 'cancelled'])],
  ['verification', new Set(['completed', 'blocked', 'escalated', 'superseded'])],
]);

export function validateDispatchTask(task, { issuer, target }) {
  if (!task || typeof task !== 'object') throw new Error('task must be an object');
  for (const field of ['task_id', 'issuer', 'target', 'objective', 'priority', 'scope', 'constraints', 'acceptance_criteria', 'authority', 'status', 'mission_id']) {
    if (!(field in task)) throw new Error(`missing required field: ${field}`);
  }
  if (task.issuer !== issuer) throw new Error('issuer mismatch');
  if (task.target !== target) throw new Error('target mismatch');
  if (!VALID_TRANSITIONS.has(task.status) && !TERMINAL_STATES.has(task.status)) {
    throw new Error(`invalid status: ${task.status}`);
  }
  if (!Array.isArray(task.scope) || !Array.isArray(task.acceptance_criteria)) {
    throw new Error('scope and acceptance_criteria must be arrays');
  }
  if (!task.authority || !Array.isArray(task.authority.granted_capabilities)) {
    throw new Error('authority.granted_capabilities must be an array');
  }
  if (typeof task.mission_id !== 'string' || !task.mission_id) {
    throw new Error('mission_id must be a non-empty string');
  }
  if ('decision_id' in task && task.decision_id !== null && typeof task.decision_id !== 'string') {
    throw new Error('decision_id must be a string or null');
  }
  return true;
}

export function transitionTask(task, nextStatus, evidence = null) {
  const allowed = VALID_TRANSITIONS.get(task.status);
  if (!allowed?.has(nextStatus)) {
    throw new Error(`invalid transition: ${task.status} -> ${nextStatus}`);
  }
  if (nextStatus === 'completed' && !evidence) {
    throw new Error('completion requires evidence');
  }
  return {
    ...task,
    status: nextStatus,
    ...(evidence ? { evidence } : {}),
  };
}

export function claimTask(task, receiver) {
  validateDispatchTask(task, { issuer: task.issuer, target: receiver });
  return transitionTask(task, 'claimed');
}
