// Minimal provider registry used by the recovery controller.
export function createProviderRegistry(initialProviders = []) {
  const providers = new Map();
  for (const provider of initialProviders) {
    if (!provider?.id || typeof provider.execute !== 'function') throw new TypeError('provider.id and provider.execute are required');
    if (providers.has(provider.id)) throw new Error(`Duplicate provider: ${provider.id}`);
    providers.set(provider.id, provider);
  }
  return Object.freeze({
    get: (id) => providers.get(id) ?? null,
    list: () => Object.freeze([...providers.keys()]),
  });
}
