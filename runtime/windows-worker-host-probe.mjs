// AGENTOS-WINDOWS-WORKER-002
// Fail-closed host capability probe for the bounded Windows worker.
// This module reports capability evidence only; it grants no authority and performs no task execution.

const REQUIRED_TOOLS = Object.freeze(['powershell.exe', 'git.exe', 'npm.cmd']);

export function createWindowsWorkerHostProbe({
  platform = process.platform,
  commandProbe,
  workspaceProbe,
} = {}) {
  if (typeof commandProbe !== 'function') throw new TypeError('commandProbe is required');
  if (typeof workspaceProbe !== 'function') throw new TypeError('workspaceProbe is required');

  async function probe(agentId) {
    const toolResults = {};
    for (const tool of REQUIRED_TOOLS) {
      try {
        toolResults[tool] = (await commandProbe(tool)) === true;
      } catch {
        toolResults[tool] = false;
      }
    }

    let workspace = { readable: false, writable: false };
    try {
      const result = await workspaceProbe();
      workspace = {
        readable: result?.readable === true,
        writable: result?.writable === true,
      };
    } catch {
      // Fail closed below.
    }

    const windows = platform === 'win32';
    const missingRequired = [];
    if (!windows) missingRequired.push('platform.win32');
    for (const tool of REQUIRED_TOOLS) {
      if (!toolResults[tool]) missingRequired.push(`tool.${tool}`);
    }
    if (!workspace.readable) missingRequired.push('workspace.read');
    if (!workspace.writable) missingRequired.push('workspace.write');

    return Object.freeze({
      agent_id: agentId ?? null,
      mode: 'DRY_RUN',
      evaluation: Object.freeze({
        eligible: missingRequired.length === 0,
        windows,
        tools: Object.freeze({ ...toolResults }),
        workspace: Object.freeze({ ...workspace }),
        missingRequired: Object.freeze(missingRequired),
      }),
    });
  }

  return Object.freeze({ probe, requiredTools: REQUIRED_TOOLS });
}
