# Credential and Secret Handling Policy

**Owner:** SOP Overseer  
**Status:** RECOMMENDED POLICY / REVIEW REQUIRED  
**Version:** 0.1-draft  
**Technical enforcement:** NOT ESTABLISHED by this document

## Objective
Minimise credential exposure and ensure credentials never become implicit AgentOS authority.

## Policy
- Credentials are capabilities, not authority grants.
- A worker possessing or being able to invoke a credential does not imply permission to use it for an arbitrary action.
- Secrets must not be placed in prompts, logs, receipts, screenshots, evidence bundles, repository files or user-facing diagnostics unless an explicitly designed protected representation requires it.
- Runtime access should use least privilege, minimum necessary scope, and the shortest practical lifetime.
- Provider/API credentials should be referenced by opaque identifiers where possible rather than copied into mission state.
- Credentials must not be silently forwarded between providers, workers or capabilities.
- Unknown credential scope or provenance fails closed for protected actions.
- Revocation/rotation must not rewrite historical evidence; evidence should retain non-secret provenance references where appropriate.
- BYOK credentials remain subject to the same authority, policy, consent, budget and capability controls as bundled/integrated providers.
- Debug and support workflows must redact secret-shaped values.

## Incident conditions
Treat suspected disclosure, repository commit, log exposure, unintended provider forwarding, unauthorized use, unexplained credential access, or compromised capability as a security incident requiring containment and credential-owner review.

## Engineering dependencies
Before this policy can be described as technically enforced, map and verify secret storage, encryption/protection, process/environment exposure, log redaction, provider adapters, MCP/capability secret access, rotation/revocation, backup handling and deletion behaviour.

## Legal/privacy status
This is an internal recommended policy, not a statement of regulatory compliance. Public privacy/security claims derived from it require implementation evidence and jurisdiction-appropriate review.