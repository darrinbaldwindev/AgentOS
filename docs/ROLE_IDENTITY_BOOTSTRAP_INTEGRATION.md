# Role Identity Bootstrap Integration

**Status:** IMPLEMENTATION REQUIRED
**Owner:** AgentOS Project Overseer
**Authority:** Gemini Overseer recommendation; Human Owner approved

## Objective
Make role identity mandatory at Overseer startup/session activation. The runtime must never infer an Overseer role from provider/model identity.

## Existing baseline
`runtime/overseer-bootstrap.mjs` currently creates a single persistent `agentos:overseer` with role `overseer`. The new role-identity contract must integrate with this existing bootstrap rather than create a competing Overseer runtime.

## Required contract
- Explicit `role_id` is required.
- Provider/model identity is separate from operational role.
- Parent authority and reporting target must be explicit.
- Unknown or conflicting role identity fails closed.
- A Gemini provider may be assigned `gemini_overseer`; it must never implicitly become `chatgpt_overseer`.
- A worker/provider identity must never gain Overseer authority merely from provider selection.

## Required implementation boundary
1. Extend existing Overseer bootstrap/session activation with role identity validation.
2. Preserve existing persistence, authority, capability, consent, scheduler, PRS and Green Agent contracts.
3. Do not create a second scheduler, runtime, router, state store, or assurance system.
4. Reject activation when identity is missing, malformed, unknown, or conflicts with the persisted role.
5. Persist the resolved role identity as part of the agent/session record where the existing schema permits it.
6. Emit an auditable identity-resolution event using existing audit/PRS pathways where available.

## Required deterministic tests
- valid `gemini_overseer` activation succeeds.
- `gemini_overseer` cannot authenticate as `chatgpt_overseer`.
- missing role identity fails closed.
- unknown role fails closed.
- provider/role mismatch fails closed when the configured policy requires a provider binding.
- persisted role cannot be silently replaced by a conflicting session role.
- repeated activation is idempotent.
- existing Project Overseer and worker dispatch behavior remains compatible.

## Evidence requirement
Implementation is not GREEN until the current commit, changed files, deterministic test output, and audit evidence are available. Documentation alone is not implementation proof.
