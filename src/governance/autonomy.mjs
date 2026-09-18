export const AUTONOMY_LEVELS = Object.freeze({
  MANUAL: 0,
  ASSISTED: 1,
  GUIDED: 2,
  AUTONOMOUS: 3,
  HIGH_AUTONOMY: 4,
  MISSION_AUTONOMY: 5,
});

export const AUTONOMY_NAMES = Object.freeze([
  'Manual',
  'Assisted',
  'Guided',
  'Autonomous',
  'High Autonomy',
  'Mission Autonomy',
]);

export function validateAutonomyLevel(level) {
  if (!Number.isInteger(level) || level < 0 || level > 5) {
    throw new Error(`invalid autonomy level: ${level}`);
  }
  return true;
}

export function createAutonomyPolicy({ level = 0, expiresAt = null, scope = null } = {}) {
  validateAutonomyLevel(level);
  if (expiresAt !== null && (!Number.isFinite(Date.parse(expiresAt)))) {
    throw new Error(`invalid autonomy expiry: ${expiresAt}`);
  }
  return Object.freeze({ level, expiresAt, scope });
}

export function isAutonomyActive(policy, now = new Date()) {
  if (!policy) return false;
  validateAutonomyLevel(policy.level);
  if (policy.expiresAt === null) return true;
  return Date.parse(policy.expiresAt) > now.getTime();
}

export function evaluateAutonomy({ policy, requiredLevel, now = new Date() } = {}) {
  validateAutonomyLevel(requiredLevel);
  if (!policy || !isAutonomyActive(policy, now)) {
    return { allowed: false, reason: 'autonomy_policy_inactive' };
  }
  if (policy.level < requiredLevel) {
    return { allowed: false, reason: 'autonomy_level_insufficient' };
  }
  return { allowed: true, reason: 'autonomy_level_sufficient' };
}

export function effectiveAuthority({ autonomy, authorised = false, capabilityGranted = false, inScope = false, withinBudget = false, production = false } = {}) {
  if (!isAutonomyActive(autonomy)) return { allowed: false, reason: 'autonomy_policy_inactive' };
  if (!authorised) return { allowed: false, reason: 'authority_not_granted' };
  if (!capabilityGranted) return { allowed: false, reason: 'capability_not_granted' };
  if (!inScope) return { allowed: false, reason: 'scope_denied' };
  if (!withinBudget) return { allowed: false, reason: 'budget_denied' };
  if (production) return { allowed: false, reason: 'production_denied' };
  return { allowed: true, reason: 'effective_authority_granted' };
}
