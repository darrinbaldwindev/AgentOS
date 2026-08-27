import { validateDispatchTask } from './dispatch.mjs';
import { validateTaskContext } from './canonical-context.mjs';

export function validateDispatchEnvelope(task, { issuer, target, canonicalContext }) {
  validateDispatchTask(task, { issuer, target });
  validateTaskContext(task, canonicalContext);
  return true;
}

export function createDispatchEnvelope({ task, missionId, decisionId = null }) {
  if (task.mission_id && task.mission_id !== missionId) {
    throw new Error('mission_id conflict');
  }
  if (decisionId && task.decision_id && task.decision_id !== decisionId) {
    throw new Error('decision_id conflict');
  }
  return {
    ...task,
    mission_id: missionId,
    ...(decisionId ? { decision_id: decisionId } : {}),
  };
}
