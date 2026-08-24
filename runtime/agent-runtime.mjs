// CORE-002: provider-independent AgentRuntime using the canonical persistence contract.
// The runtime does not know provider credentials or provider APIs.

export const RUNTIME_STATES = Object.freeze(['idle', 'planning', 'executing', 'verifying', 'completed', 'failed', 'paused']);

export function createAgentRuntime({ persistence, provider }) {
  if (!persistence || !provider || typeof provider.execute !== 'function') {
    throw new TypeError('persistence and provider.execute are required');
  }

  async function run({ workspaceId, agentId, mission, tools = [] }) {
    if (!workspaceId || !agentId || !mission) throw new TypeError('workspaceId, agentId and mission are required');

    const run = await persistence.create('run', { workspaceId, agentId, status: 'running', mission });
    await persistence.create('event', { runId: run.id, eventType: 'run.started', state: 'executing' });

    try {
      const result = await provider.execute({
        runId: run.id,
        workspaceId,
        agentId,
        mission,
        tools: Object.freeze([...tools]),
      });

      await persistence.create('event', { runId: run.id, eventType: 'provider.completed', state: 'verifying' });
      const artifact = await persistence.create('artifact', { runId: run.id, kind: 'run-result', status: 'verified', result });
      await persistence.update('run', run.id, { status: 'completed' });
      await persistence.create('event', { runId: run.id, eventType: 'run.completed', state: 'completed', artifactId: artifact.id });
      return Object.freeze({ runId: run.id, artifactId: artifact.id, result });
    } catch (error) {
      const diagnostic = error?.code ?? 'RUNTIME_EXECUTION_FAILED';
      await persistence.create('event', { runId: run.id, eventType: 'run.failed', state: 'failed', diagnosticCode: diagnostic });
      await persistence.update('run', run.id, { status: 'failed', diagnosticCode: diagnostic });
      throw error;
    }
  }

  return Object.freeze({ run });
}
