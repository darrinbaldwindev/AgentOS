// CORE-001: bounded local tool registry.
// Tools are explicit capabilities. The registry never executes arbitrary source.

const SAFE_NAME = /^[a-z][a-z0-9._-]{1,63}$/;

export function createToolRegistry(initialTools = []) {
  const tools = new Map();

  function register(tool) {
    if (!tool || !SAFE_NAME.test(tool.name) || typeof tool.execute !== 'function') {
      throw new TypeError('tool.name and tool.execute are required');
    }
    if (tools.has(tool.name)) throw new Error(`Duplicate tool: ${tool.name}`);
    tools.set(tool.name, Object.freeze({
      name: tool.name,
      description: tool.description ?? '',
      execute: tool.execute,
    }));
    return tools.get(tool.name);
  }

  function describe() {
    return Object.freeze([...tools.values()].map(({ name, description }) => Object.freeze({ name, description })));
  }

  async function execute(name, input = {}) {
    const tool = tools.get(name);
    if (!tool) {
      const error = new Error(`Unknown tool: ${name}`);
      error.code = 'TOOL_NOT_REGISTERED';
      throw error;
    }
    return tool.execute(Object.freeze({ ...input }));
  }

  for (const tool of initialTools) register(tool);
  return Object.freeze({ register, describe, execute });
}
