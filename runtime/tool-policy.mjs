// CORE-001 security hardening: explicit capability policy for tools.
// A tool is executable only when explicitly allowed for the current run.

const MODES = Object.freeze(['deny', 'allow']);

export function createToolPolicy({ allow = [] } = {}) {
  const allowed = new Set(allow);

  function decision(toolName) {
    const mode = allowed.has(toolName) ? 'allow' : 'deny';
    return Object.freeze({ toolName, mode });
  }

  function assertAllowed(toolName) {
    const result = decision(toolName);
    if (result.mode !== 'allow') {
      const error = new Error(`tool denied by policy: ${toolName}`);
      error.code = 'TOOL_POLICY_DENIED';
      throw error;
    }
    return result;
  }

  return Object.freeze({ decision, assertAllowed, modes: MODES });
}
