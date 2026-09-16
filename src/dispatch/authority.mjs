export function createAuthorityPolicy({ issuers = [], capabilities = [] } = {}) {
  return {
    issuers: new Set(issuers),
    capabilities: new Set(capabilities),
  };
}

export function validateIssuer(task, policy) {
  if (!policy?.issuers?.has(task.issuer)) {
    throw new Error(`untrusted issuer: ${task.issuer}`);
  }
  return true;
}

export function validateCapabilities(task, policy) {
  const granted = task.authority?.granted_capabilities ?? [];
  const required = task.required_capabilities ?? [];
  if (!Array.isArray(granted) || !Array.isArray(required)) {
    throw new TypeError('capability grants and requirements must be arrays');
  }
  for (const capability of granted) {
    if (!policy?.capabilities?.has(capability)) {
      throw new Error(`unauthorised capability: ${capability}`);
    }
  }
  const grantSet = new Set(granted);
  for (const capability of required) {
    if (!grantSet.has(capability)) {
      throw new Error(`capability not granted to task: ${capability}`);
    }
  }
  return true;
}

export function authoriseDispatch(task, policy) {
  validateIssuer(task, policy);
  validateCapabilities(task, policy);
  return true;
}
