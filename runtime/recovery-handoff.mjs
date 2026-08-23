// CORE-001: provider/model handoff and recovery state.
// Mission state stays in AgentOS; providers remain replaceable execution adapters.

export function createRecoveryController({ store, providers }) {
  if (!store || !providers || typeof providers.get !== 'function') {
    throw new TypeError('store and providers.get are required');
  }

  async function executeWithRecovery({ workspaceId, agentId, mission, providerIds }) {
    if (!Array.isArray(providerIds) || providerIds.length === 0) {
      throw new TypeError('providerIds must contain at least one provider');
    }

    const run = store.create('run', {
      workspaceId,
      agentId,
      status: 'running',
      mission,
      providerId: providerIds[0],
      attempts: 0,
    });

    for (let index = 0; index < providerIds.length; index += 1) {
      const providerId = providerIds[index];
      const provider = providers.get(providerId);
      if (!provider) continue;

      store.update('run', run.id, { providerId, attempts: index + 1 });
      store.create('event', {
        runId: run.id,
        eventType: index === 0 ? 'provider.selected' : 'provider.handoff',
        providerId,
        attempt: index + 1,
      });

      try {
        const result = await provider.execute({ runId: run.id, workspaceId, agentId, mission });
        const artifact = store.create('artifact', {
          runId: run.id,
          kind: 'recovery-result',
          status: 'verified',
          providerId,
          result,
        });
        store.update('run', run.id, { status: 'completed', recovered: index > 0 });
        store.create('event', {
          runId: run.id,
          eventType: index === 0 ? 'run.completed' : 'run.recovered',
          providerId,
          artifactId: artifact.id,
        });
        return Object.freeze({ runId: run.id, providerId, recovered: index > 0, artifactId: artifact.id, result });
      } catch (error) {
        store.create('event', {
          runId: run.id,
          eventType: 'provider.failed',
          providerId,
          diagnosticCode: error?.code ?? 'PROVIDER_EXECUTION_FAILED',
        });
      }
    }

    store.update('run', run.id, { status: 'failed', diagnosticCode: 'ALL_PROVIDERS_FAILED' });
    store.create('event', { runId: run.id, eventType: 'run.failed', diagnosticCode: 'ALL_PROVIDERS_FAILED' });
    const error = new Error('all configured providers failed');
    error.code = 'ALL_PROVIDERS_FAILED';
    throw error;
  }

  return Object.freeze({ executeWithRecovery });
}
