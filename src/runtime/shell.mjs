const REQUIRED_CAPABILITIES = Object.freeze(['github.read', 'continuity.read', 'handoff']);

function assertProbeResult(result, name) {
  if (!result || typeof result !== 'object') {
    throw new TypeError(`${name} probe must return an object`);
  }
  if (!result.capabilities || typeof result.capabilities !== 'object') {
    throw new TypeError(`${name} probe must include capabilities`);
  }
}

function hasCapability(probe, capability) {
  return probe.capabilities[capability] === true;
}

export function createRuntimeShell({ capabilityProbe, workspaceAdapter = null, githubAdapter = null } = {}) {
  if (typeof capabilityProbe !== 'function') {
    throw new TypeError('capabilityProbe is required');
  }

  async function inspect(agentId) {
    if (!agentId || typeof agentId !== 'string') {
      throw new TypeError('agentId must be a non-empty string');
    }

    const result = await capabilityProbe(agentId);
    assertProbeResult(result, 'capability');

    const missing = REQUIRED_CAPABILITIES.filter((capability) => !hasCapability(result, capability));
    const workspace = workspaceAdapter && typeof workspaceAdapter.probe === 'function'
      ? await workspaceAdapter.probe(agentId)
      : null;
    const github = githubAdapter && typeof githubAdapter.probe === 'function'
      ? await githubAdapter.probe(agentId)
      : null;

    return Object.freeze({
      agentId,
      requiredCapabilities: REQUIRED_CAPABILITIES,
      missingCapabilities: Object.freeze(missing),
      eligible: missing.length === 0,
      workspace: workspace ? Object.freeze({ ...workspace }) : null,
      github: github ? Object.freeze({ ...github }) : null,
      executionMode: missing.length > 0
        ? 'blocked'
        : workspace?.read === true && workspace?.write === true
          ? 'local_preferred'
          : 'github'
    });
  }

  async function authorize(agentId) {
    const inspection = await inspect(agentId);
    if (!inspection.eligible) {
      return Object.freeze({
        ...inspection,
        authorized: false,
        code: 'AGENT_NOT_ELIGIBLE'
      });
    }
    return Object.freeze({
      ...inspection,
      authorized: true,
      code: 'AGENT_ELIGIBLE'
    });
  }

  return Object.freeze({ inspect, authorize, requiredCapabilities: REQUIRED_CAPABILITIES });
}
