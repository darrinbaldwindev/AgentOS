// CORE-001 security hardening: policy-gated tool execution.

export function createSecureToolExecutor({ registry, policy }) {
  if (!registry || typeof registry.execute !== 'function') throw new TypeError('registry.execute is required');
  if (!policy || typeof policy.assertAllowed !== 'function') throw new TypeError('policy.assertAllowed is required');

  async function execute(name, input = {}) {
    policy.assertAllowed(name);
    return registry.execute(name, input);
  }

  return Object.freeze({ execute });
}
