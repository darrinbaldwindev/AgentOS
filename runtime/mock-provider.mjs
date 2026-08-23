// CORE-001: deterministic local provider adapter. No network, credentials, or environment access.

export function createMockProvider({ response = 'MOCK_PROVIDER_COMPLETED', fail = false } = {}) {
  return Object.freeze({
    id: 'mock.local',
    async execute(input) {
      if (!input?.runId || !input?.workspaceId || !input?.agentId || !input?.mission) {
        const error = new TypeError('mock provider requires run, workspace, agent and mission');
        error.code = 'MOCK_INVALID_INPUT';
        throw error;
      }
      if (fail) {
        const error = new Error('deterministic mock provider failure');
        error.code = 'MOCK_PROVIDER_FAILURE';
        throw error;
      }
      return Object.freeze({
        providerId: 'mock.local',
        response,
        mission: input.mission,
        toolCount: input.tools?.length ?? 0,
      });
    },
  });
}
