import { executeWorker } from './worker-contract.mjs';

/**
 * Adapter for a self-hosted Overseer.sh instance.
 * The adapter intentionally speaks only to the documented REST chat boundary;
 * authentication and endpoint details remain configurable so AgentOS does not
 * couple itself to a particular deployment.
 */
export function createOverseerShWorker({
  baseUrl,
  apiKey,
  endpoint = '/api/chat',
  id = 'platform:overseer-sh',
  capabilities = ['general', 'tools', 'skills', 'sub-agents'],
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!baseUrl) throw new TypeError('baseUrl is required');
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl is required');

  const worker = Object.freeze({
    id,
    capabilities,
    async execute({ message, conversationId, ...task } = {}) {
      if (!message) throw new Error('message is required');
      const url = new URL(endpoint, baseUrl).toString();
      const headers = { 'content-type': 'application/json' };
      if (apiKey) headers.authorization = `Bearer ${apiKey}`;
      const response = await fetchImpl(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, conversationId, task }),
      });
      if (!response.ok) throw new Error(`Overseer.sh request failed: HTTP ${response.status}`);
      const payload = await response.json();
      return payload?.response ?? payload?.message ?? payload;
    },
  });

  return Object.freeze({ worker, execute: input => executeWorker(worker, input) });
}
