// CORE-002: provider adapter contract for the real execution boundary.
// Providers implement this contract; Overseer remains provider-neutral.

export function createProviderAdapter({ id, listAvailable, execute }) {
  if (!id || typeof listAvailable !== 'function' || typeof execute !== 'function') {
    throw new TypeError('id, listAvailable and execute are required');
  }

  return Object.freeze({
    id,
    async listAvailable() {
      const models = await listAvailable();
      return Object.freeze(models.map((model) => Object.freeze({
        ...model,
        providerId: model.providerId ?? id,
      })));
    },
    async execute({ model, input, context }) {
      if (!model) throw new TypeError('model is required');
      return execute({ model, input, context });
    },
  });
}
