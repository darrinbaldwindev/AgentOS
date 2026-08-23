// CORE-001: minimal provider-independent AgentRuntime.
// The runtime accepts an adapter; it does not know provider credentials or APIs.

export const RUNTIME_STATES = Object.freeze(['idle', 'planning', 'executing', 'verifying', 'completed', 'failed', 'paused']);

export function createAgentRuntime({ store, provider }) {
  if (!store || !provider || typeof provider.execute !== 'function') {
    throw new TypeError('store and provider.execute are required');
  }

  async function run({ workspaceId, agentId, mission, tools = [] }) {
    if (!workspaceId || !agentId || !mission) throw new TypeError('workspaceId, agentId and mission are required');

    const run = store.create('run', { workspaceId, agentId, status: 'running', mission });
    store.create('event', { runId: run.id, eventType: 'run.started', state: 'executing' });

    try {
      const result = await provider.execute({
        runId: run.id,
        workspaceId,
        agentId,
        mission,
        tools: Object.freeze([...tools]),
      });

      store.create('event', { runId: run.id, eventType: 'provider.completed', state: 'verifying' });
      const artifact = store.create('artifact', {
        runId: run.id,
        kind: 'run-result',
        status: 'verified',
        result,
      });
      store.update('run', run.id, { status: 'completed' });
      store.create('event', { runId: run.id, eventType: 'run.completed', state: 'completed', artifactId: artifact.id });
      return Object.freeze({ runId: run.id, artifactId: artifact.id, result });
    } catch (error) {
      const diagnostic = error?.code ?? 'RUNTIME_EXECUTION_FAILED';
      store.create('event', { runId: run.id, eventType: 'run.failed', state: 'failed', diagnosticCode: diagnostic });
      store.update('run', run.id, { status: 'failed', diagnosticCode: diagnostic });
      throw error;
    }
  }

  return Object.freeze({ run });
}
