# SOP-ADMIN-001 — Team Roles and Permissions

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
A displayed role, workspace membership or paid tier is not authority by itself. AgentOS must resolve action authority from the canonical permission/approval system and preserve least privilege.

## Role record
For each implemented role record stable role ID, purpose, assigner authority, allowed actions, prohibited/protected actions, data/project scope, capability limits, approval powers, spending limits, audit visibility, expiry/review, revocation behavior and evidence source.

## Truth requirements
- role name != permission;
- admin UI visibility != execution authority;
- subscription entitlement != governance authority;
- workspace membership != access to every project/file/connector;
- delegated approval cannot exceed delegator authority;
- role change does not prove already-running work stopped.

## Procedure
1. Identify canonical identity and organization/workspace.
2. Resolve role assignment from authoritative state.
3. Resolve action-specific permission at execution time.
4. Apply target/project/data scope and approval conditions.
5. Record decision and correlation in evidence/receipt.
6. Revalidate on role, target, policy, project or organization change.
7. On removal/revocation, block future admission and separately verify running work/access termination.

## UI
Simple, Essentials and Tech Head may present different detail, but must expose the same effective authority outcome. Never hide a required approval, denial, expiry or revocation behind a mode.

Business/Commercial organization features remain PRODUCT DIRECTION unless current implementation proves them. This SOP does not create organization roles or permissions.