// CORE-002: Overseer is a first-class AgentOS system agent.
// Bootstrap creates/reuses the persistent Overseer before worker agents are selected.

const OVERSEER_ID = 'agentos:overseer';

export async function bootstrapOverseer({ persistence, now = () => new Date().toISOString() }) {
  if (!persistence) throw new TypeError('persistence is required');

  const existing = await persistence.get('agent', OVERSEER_ID);
  if (existing) return Object.freeze({ agent: existing, created: false });

  const agent = await persistence.create('agent', {
    id: OVERSEER_ID,
    role: 'overseer',
    system: true,
    primary: true,
    status: 'initializing',
    identity: 'AgentOS Overseer',
    createdAt: now(),
  });

  return Object.freeze({ agent, created: true });
}

export async function activateOverseer({ persistence, now = () => new Date().toISOString() }) {
  const existing = await persistence.get('agent', OVERSEER_ID);
  if (!existing) throw new Error('OVERSEER_NOT_BOOTSTRAPPED');
  const agent = await persistence.update('agent', OVERSEER_ID, {
    status: 'online',
    lastActivatedAt: now(),
  });
  return Object.freeze(agent);
}

export { OVERSEER_ID };
