// CORE-002: single user-facing Overseer session abstraction.
// The model behind the Overseer may change without changing session identity.

import { OVERSEER_ID } from './overseer-bootstrap.mjs';

export function createOverseerSession({ persistence, router, execute }) {
  if (!persistence || !router || typeof router.select !== 'function' || typeof execute !== 'function') {
    throw new TypeError('persistence, router.select and execute are required');
  }

  async function send({ missionId, message, task }) {
    const overseer = await persistence.get('agent', OVERSEER_ID);
    if (!overseer || overseer.status !== 'online') throw new Error('OVERSEER_OFFLINE');
    const route = await router.select({ task });
    if (!route?.selected) throw new Error('NO_SUITABLE_MODEL');
    const result = await execute({
      agentId: OVERSEER_ID,
      missionId,
      model: route.selected,
      message,
      task,
    });
    await persistence.create('event', {
      missionId,
      agentId: OVERSEER_ID,
      eventType: 'overseer.turn.completed',
      modelId: route.selected.id ?? route.selected.name,
      routeReason: route.reason,
    });
    return Object.freeze({ result, route });
  }

  return Object.freeze({ send });
}
