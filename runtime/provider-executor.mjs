// CORE-002: executes a routed task through the selected provider adapter.

export function createProviderExecutor({ providers }) {
  if (!providers || typeof providers.get !== 'function') throw new TypeError('providers.get is required');

  async function execute({ model, message, task, context }) {
    if (!model?.providerId) throw new Error('MODEL_PROVIDER_MISSING');
    const provider = providers.get(model.providerId);
    if (!provider) throw new Error(`PROVIDER_UNAVAILABLE:${model.providerId}`);
    return provider.execute({
      model,
      input: { message, task },
      context,
    });
  }

  return Object.freeze({ execute });
}
