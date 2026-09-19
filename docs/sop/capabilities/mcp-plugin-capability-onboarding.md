# SOP-MCP-001 — MCP, Plugin and Capability Onboarding

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
A capability makes an action technically possible; it does not authorise the action. Onboarding a plugin/MCP/tool must reuse canonical AgentOS capability, authority, credential, policy, budget, evidence and revocation systems.

## Intake record
Record: capability ID/name; provider/publisher; provenance; version; transport; permissions/scopes; data read/write; external destinations; credential requirements; network/file/process access; destructive/financial/communication abilities; installation/update mechanism; sandbox/isolation; logging/evidence; cost model; jurisdiction/data-processing implications; owner; review date.

## Procedure
1. Verify source/provenance and current documentation.
2. Classify requested scopes by least privilege.
3. Identify secrets and storage/rotation/revocation path before connection.
4. Identify data leaving AgentOS/local device and required notices/consent.
5. Define allowed operations and protected actions separately from technical scopes.
6. Test in bounded/non-production context where feasible.
7. Define receipt/correlation requirements.
8. Define update/version pinning and supply-chain revalidation.
9. Define disable/revoke/uninstall and residual-data behavior.
10. Admit through canonical capability policy/registry if/when implementation supports it; do not create a side registry.

## Fail closed
UNKNOWN publisher/provenance, excessive unexplained scope, unsupported secret handling, ambiguous write/destructive behavior, unbounded shell, unreviewed auto-update or missing revocation path blocks production-capable admission.

## AI/provider neutrality
MCP-first is not MCP-only. Native APIs, local tools and other adapters may be used when governed by the same authority/evidence boundaries. No provider/model/plugin becomes AgentOS authority merely because it supplies a tool.

## Updates
Material version/scope/provider changes invalidate prior onboarding evidence until revalidated. Capability availability must not silently expand mission authority.