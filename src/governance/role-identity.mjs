// GOV-ROLE-001: Fail-closed runtime role identity contract.
// Provider/model identity is intentionally separate from operational role identity.

const ROLES = Object.freeze({
  chatgpt_overseer: Object.freeze({
    role_id: 'chatgpt_overseer',
    role_name: 'ChatGPT Overseer',
    parent_authority: 'human_owner',
    reporting_target: 'human_owner',
    authority: 'strategic_coordination',
  }),
  gemini_overseer: Object.freeze({
    role_id: 'gemini_overseer',
    role_name: 'Gemini Overseer',
    parent_authority: 'chatgpt_overseer',
    reporting_target: 'chatgpt_overseer',
    authority: 'independent_assurance',
  }),
  project_overseer: Object.freeze({
    role_id: 'project_overseer',
    role_name: 'Project Overseer',
    parent_authority: 'chatgpt_overseer',
    reporting_target: 'chatgpt_overseer',
    authority: 'project_execution_coordination',
  }),
  worker: Object.freeze({
    role_id: 'worker',
    role_name: 'Worker',
    parent_authority: 'project_overseer',
    reporting_target: 'project_overseer',
    authority: 'delegated_execution',
  }),
});

function fail(message) {
  throw new Error(`ROLE_IDENTITY_INVALID: ${message}`);
}

export function getRoleDefinition(roleId) {
  return ROLES[roleId] ?? null;
}

export function createRoleIdentity({ roleId, provider, sessionId, projectScope = null } = {}) {
  if (typeof roleId !== 'string' || !roleId.trim()) fail('role_id is required');
  const definition = getRoleDefinition(roleId);
  if (!definition) fail(`unknown role_id '${roleId}'`);
  if (typeof provider !== 'string' || !provider.trim()) fail('provider is required');
  if (typeof sessionId !== 'string' || !sessionId.trim()) fail('session_id is required');

  return Object.freeze({
    ...definition,
    provider,
    session_id: sessionId,
    project_scope: projectScope,
    contract_version: '1.0',
  });
}

export function assertRoleIdentity(identity, expectedRoleId) {
  if (!identity || typeof identity !== 'object') fail('identity is required');
  if (typeof expectedRoleId !== 'string' || !expectedRoleId.trim()) fail('expected role_id is required');
  const definition = getRoleDefinition(expectedRoleId);
  if (!definition) fail(`unknown expected role_id '${expectedRoleId}'`);
  if (identity.role_id !== expectedRoleId) {
    fail(`expected '${expectedRoleId}', received '${identity.role_id ?? 'unset'}'`);
  }
  if (identity.role_name !== definition.role_name) fail('role_name does not match role_id');
  if (typeof identity.provider !== 'string' || !identity.provider.trim()) fail('provider is required');
  if (typeof identity.session_id !== 'string' || !identity.session_id.trim()) fail('session_id is required');
  return true;
}

export function assertRoleAuthority(identity, action) {
  assertRoleIdentity(identity, identity?.role_id);
  const allowed = new Set({
    chatgpt_overseer: ['coordinate', 'authorize', 'review', 'escalate'],
    gemini_overseer: ['review', 'challenge', 'verify', 'escalate'],
    project_overseer: ['coordinate', 'delegate', 'verify', 'escalate'],
    worker: ['execute', 'report'],
  }[identity.role_id] ?? []);
  if (!allowed.has(action)) fail(`role '${identity.role_id}' cannot perform '${action}'`);
  return true;
}

export { ROLES };
