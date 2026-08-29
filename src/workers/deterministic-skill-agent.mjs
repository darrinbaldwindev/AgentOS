import { executeWorker } from './worker-contract.mjs';

export function createDeterministicSkillAgent({ id = 'skill:echo', capabilities = ['general'], handler = async ({ message }) => message } = {}) {
  const worker = Object.freeze({ id, capabilities, execute: handler });
  return Object.freeze({ worker, execute: input => executeWorker(worker, input) });
}
