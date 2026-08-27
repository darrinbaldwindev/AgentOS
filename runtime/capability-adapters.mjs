// CORE-003: concrete capability adapter boundary.
// Integrations are injected so the runtime remains provider- and transport-neutral.

export function createCapabilityAdapters({ github, continuity, handoff, workspace }) {
  const probe = (name, target, method) => async () => {
    if (!target || typeof target[method] !== 'function') return false;
    try { return (await target[method]()) === true; } catch { return false; }
  };

  return Object.freeze({
    githubRead: probe('github.read', github, 'probeRead'),
    continuityRead: probe('continuity.read', continuity, 'probeRead'),
    handoff: probe('handoff', handoff, 'probe'),
    workspaceRead: probe('workspace.read', workspace, 'probeRead'),
    workspaceWrite: probe('workspace.write', workspace, 'probeWrite'),
  });
}

export async function probeAgentCapabilities(adapters) {
  const entries = await Promise.all(Object.entries(adapters).map(async ([name, fn]) => [name, await fn()]));
  return Object.freeze(Object.fromEntries(entries));
}
