// CORE-002: bridge the model registry and routing policy.
import { selectModel } from './model-routing.mjs';

export function createOverseerRouter({ modelRegistry }) {
  if (!modelRegistry || typeof modelRegistry.listAvailable !== 'function') throw new TypeError('modelRegistry.listAvailable is required');
  async function select({ task }) {
    const models = await modelRegistry.listAvailable();
    return selectModel({ models, task });
  }
  return Object.freeze({ select });
}
