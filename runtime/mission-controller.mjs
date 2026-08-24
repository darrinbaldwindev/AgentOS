// CORE-001: orchestration boundary for a single AgentOS mission.
// Keeps mission lifecycle separate from provider-specific execution.

export function createMissionController({ store, loop, overseer }) {
  if (!store || !loop || typeof loop.execute !== 'function' || !overseer || typeof overseer.auditRun !== 'function') {
    throw new TypeError('store, loop.execute and overseer.auditRun are required');
  }

  async function executeMission({ workspaceId, agentId, mission, plan }) {
    const missionRecord = store.create('artifact', {
      kind: 'mission',
      status: 'running',
      workspaceId,
      agentId,
      mission,
    });

    try {
      const result = await loop.execute({ workspaceId, agentId, mission, plan });
      const runId = result.runId;
      const audit = overseer.auditRun(runId);
      store.update('artifact', missionRecord.id, { status: 'completed', runId, auditArtifactId: audit.changeLogId });
      return Object.freeze({ missionId: missionRecord.id, runId, result, audit });
    } catch (error) {
      store.update('artifact', missionRecord.id, { status: 'failed', diagnosticCode: error?.code ?? 'MISSION_FAILED' });
      throw error;
    }
  }

  return Object.freeze({ executeMission });
}
