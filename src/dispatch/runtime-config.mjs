const REQUIRED = ['AGENTOS_GITHUB_OWNER', 'AGENTOS_GITHUB_REPO'];

export function loadRuntimeConfig(env = process.env) {
  const missing = REQUIRED.filter(key => !env[key]);
  if (missing.length) throw new Error(`missing runtime configuration: ${missing.join(', ')}`);

  return {
    owner: env.AGENTOS_GITHUB_OWNER,
    repo: env.AGENTOS_GITHUB_REPO,
    branch: env.AGENTOS_GITHUB_BRANCH || 'main',
    apiBaseUrl: env.AGENTOS_GITHUB_API_BASE_URL || 'https://api.github.com',
  };
}
