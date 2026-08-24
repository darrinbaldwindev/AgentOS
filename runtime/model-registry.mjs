// CORE-002: provider/model registry contract.
// Registry describes currently usable models; routing decides which one to use.

export function createModelRegistry({ providers = [] } = {}) {
  async function listAvailable() {
    const groups = await Promise.all(providers.map(async (provider) => {
      if (typeof provider.listAvailable !== 'function') return [];
      return provider.listAvailable();
    }));
    return Object.freeze(groups.flat().filter((model) => model?.available === true));
  }

  return Object.freeze({ listAvailable });
}
