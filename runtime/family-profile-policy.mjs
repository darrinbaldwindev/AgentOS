// Family Safety policy contract.
// This module is deliberately non-authoritative: it can only reduce capability
// already granted by canonical AgentOS authority. It never issues authority.

const ROLES = Object.freeze(['PARENT', 'GUARDIAN', 'TEEN', 'CHILD', 'GUEST']);
const VIEWS = Object.freeze(['SIMPLE', 'ESSENTIALS', 'TECH_HEAD']);

function uniqueStrings(values = []) {
  if (!Array.isArray(values)) throw new TypeError('capability collections must be arrays');
  return [...new Set(values.map((value) => {
    if (typeof value !== 'string' || value.trim() === '') throw new TypeError('capabilities must be non-empty strings');
    return value;
  }))];
}

function normalizeProfile(profile = {}) {
  const role = String(profile.role || '').toUpperCase();
  if (!ROLES.includes(role)) {
    const error = new Error(`unsupported family profile role: ${profile.role}`);
    error.code = 'FAMILY_PROFILE_ROLE_INVALID';
    throw error;
  }

  const view = String(profile.view || 'SIMPLE').toUpperCase();
  if (!VIEWS.includes(view)) {
    const error = new Error(`unsupported AgentOS view: ${profile.view}`);
    error.code = 'FAMILY_PROFILE_VIEW_INVALID';
    throw error;
  }

  return Object.freeze({
    profileId: profile.profileId ?? null,
    role,
    view,
    ageBand: profile.ageBand ?? null,
  });
}

function normalizeParentPolicy(parentPolicy) {
  if (!parentPolicy || typeof parentPolicy !== 'object') return null;
  return Object.freeze({
    policyId: parentPolicy.policyId ?? null,
    allowedCapabilities: Object.freeze(uniqueStrings(parentPolicy.allowedCapabilities || [])),
    deniedCapabilities: Object.freeze(uniqueStrings(parentPolicy.deniedCapabilities || [])),
    approvalRequiredCapabilities: Object.freeze(uniqueStrings(parentPolicy.approvalRequiredCapabilities || [])),
    active: parentPolicy.active === true,
    revoked: parentPolicy.revoked === true,
  });
}

export function evaluateFamilyProfilePolicy({
  profile,
  upstreamCapabilities = [],
  requestedCapabilities = [],
  parentPolicy = null,
} = {}) {
  const normalizedProfile = normalizeProfile(profile);
  const upstream = new Set(uniqueStrings(upstreamCapabilities));
  const requested = uniqueStrings(requestedCapabilities);
  const policy = normalizeParentPolicy(parentPolicy);

  const childScoped = normalizedProfile.role === 'CHILD' || normalizedProfile.role === 'TEEN';
  const guestScoped = normalizedProfile.role === 'GUEST';
  const validParentPolicy = Boolean(policy && policy.active && !policy.revoked);

  const allowedByParent = new Set(validParentPolicy ? policy.allowedCapabilities : []);
  const deniedByParent = new Set(validParentPolicy ? policy.deniedCapabilities : []);
  const approvalRequired = new Set(validParentPolicy ? policy.approvalRequiredCapabilities : []);

  const decisions = requested.map((capability) => {
    let mode = 'deny';
    let reason = 'NOT_GRANTED_UPSTREAM';

    if (upstream.has(capability)) {
      if (childScoped && !validParentPolicy) {
        reason = 'PARENT_POLICY_REQUIRED';
      } else if (guestScoped && !validParentPolicy) {
        reason = 'GUEST_POLICY_REQUIRED';
      } else if ((childScoped || guestScoped) && !allowedByParent.has(capability)) {
        reason = 'NOT_ALLOWED_BY_PROFILE_POLICY';
      } else if (deniedByParent.has(capability)) {
        reason = 'DENIED_BY_PROFILE_POLICY';
      } else if (approvalRequired.has(capability)) {
        reason = 'PARENT_APPROVAL_REQUIRED';
      } else {
        mode = 'allow';
        reason = 'ALLOWED_WITHIN_UPSTREAM_AUTHORITY';
      }
    }

    return Object.freeze({ capability, mode, reason });
  });

  return Object.freeze({
    profile: normalizedProfile,
    policyId: validParentPolicy ? policy.policyId : null,
    policyStatus: validParentPolicy ? 'ACTIVE' : 'MISSING_OR_INACTIVE',
    decisions: Object.freeze(decisions),
    allowedCapabilities: Object.freeze(decisions.filter((item) => item.mode === 'allow').map((item) => item.capability)),
    deniedCapabilities: Object.freeze(decisions.filter((item) => item.mode === 'deny').map((item) => item.capability)),
  });
}

export function assertFamilyCapabilityAllowed(input) {
  const result = evaluateFamilyProfilePolicy(input);
  const denied = result.decisions.filter((item) => item.mode !== 'allow');
  if (denied.length > 0) {
    const error = new Error(`family profile policy denied: ${denied.map((item) => item.capability).join(', ')}`);
    error.code = 'FAMILY_PROFILE_POLICY_DENIED';
    error.decisions = denied;
    throw error;
  }
  return result;
}

export const FAMILY_PROFILE_ROLES = ROLES;
export const FAMILY_PROFILE_VIEWS = VIEWS;
