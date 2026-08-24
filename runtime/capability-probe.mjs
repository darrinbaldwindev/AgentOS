// Reference capability probe contract. Real adapters must perform actual access checks.

import { evaluateAgentCapability } from './agent-capability.mjs';

export function createCapabilityProbe({ github, workspace, continuity, handoff }) {
  if (!github || !workspace || !continuity || !handoff) throw new TypeError('all probe adapters are required');

  async function probe(agentId) {
    const [githubRead, githubWrite, workspaceRead, workspaceWrite, continuityRead, continuityWrite, handoffReady] = await Promise.all([
      github.canRead(agentId), github.canWrite(agentId), workspace.canRead(agentId), workspace.canWrite(agentId),
      continuity.canRead(agentId), continuity.canWrite(agentId), handoff.canHandoff(agentId),
    ]);
    const evaluation = evaluateAgentCapability({
      'github.read': githubRead, 'github.write': githubWrite,
      'workspace.read': workspaceRead, 'workspace.write': workspaceWrite,
      'continuity.read': continuityRead, 'continuity.write': continuityWrite,
      handoff: handoffReady,
    });
    return Object.freeze({ agentId, evaluation });
  }

  return Object.freeze({ probe });
}
