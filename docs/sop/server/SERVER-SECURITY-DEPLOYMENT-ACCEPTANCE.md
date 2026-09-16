# AgentOS Server — Security, Deployment and Acceptance Gates

Status: DRAFT / evidence-controlled
Workstreams: S-SRV-09, S-SRV-10, S-SRV-12
Lineage: AgentOS PR #119

## Security principle

Server is deny-by-default. Authentication does not imply authorization. Organization/seat entitlement does not imply execution authority. Worker success does not imply Green. Green does not imply PRS. PRS does not imply deployment authorization.

## Threat / gate matrix

| Surface | Required control | Failure disposition |
|---|---|---|
| Network transport | TLS and approved endpoint configuration | BLOCKED |
| Authentication | trusted provider/source evidence, server-side validation | DENY/BLOCKED |
| Authorization | canonical AgentOS authority/grant checks | DENY |
| Tenant/org isolation | derive scope server-side; deny cross-org references | DENY + audit |
| Seat entitlement | canonical assignment/state evidence | DENY; never self-grant |
| Session | bounded lifetime/revocation/replay handling from canonical source | DENY/UNKNOWN |
| API request | schema bounds, size limits, idempotency/correlation | DENY/CONFLICT |
| Rate/resource limits | bounded admission and resource exhaustion controls | THROTTLE/DENY |
| Worker | canonical identity/build/capability evidence | DENY/BLOCKED |
| Shell/runtime | bounded approved operations only | DENY |
| Secrets | approved injection, least privilege, never logs/repo | BLOCKED on missing secure source |
| Persistence | atomic shared-state semantics and fail-closed errors | BLOCKED |
| Audit | immutable/canonical evidence refs, redacted PII/secrets | BLOCKED for assurance if incomplete |
| Dependencies | pinned/reviewed supply-chain + vulnerability evidence | BLOCKED according to severity/policy |
| Admin/privileged action | explicit authority, strong authentication, audit | DENY |
| Backup | encrypted/protected, access controlled, restore verified | BLOCKED until proven |
| Recovery | canonical state reconciliation, replay protection | UNKNOWN/BLOCKED rather than false success |
| Verification | independent functional Green | NOT GREEN |
| Security assurance | independent security review on exact candidate | NOT SECURITY PASS |
| PRS | independent assurance after prerequisites | NOT ASSURED |
| Deployment | explicit owner/deployment authority | NOT DEPLOYED |

## Tenant isolation invariants

Never trust organization, workspace, project, role, seat or grant scope solely because an authenticated client supplied it. Resolve or validate scope against trusted server-side/canonical evidence. Cross-tenant identifiers must fail closed before canonical execution admission.

Audit/log projections must not leak one organization's PII, mission content, credentials, project names or evidence payloads to another tenant.

## Privileged administration

Administrative capability must be separately authorized and audited. Product administration such as seat assignment, user suspension, organization settings, backup/restore, key rotation or worker enrollment must not implicitly grant mission execution authority.

No unrestricted shell/elevation is introduced by Server administration.

## Deployment modes

Maintain distinct deployment profiles:
1. customer-owned server;
2. private cloud/VPS controlled by customer;
3. on-premises/business LAN;
4. hybrid Server plus governed Windows workers;
5. future AgentOS-operated SaaS — separate product/security boundary, not inferred from customer-hosted Server.

Each profile must document ingress/egress, trust boundaries, persistence location, secret ownership, update authority, backup owner, observability owner and worker connectivity before production eligibility.

## Lifecycle SOP gate

`Install -> configure -> authorize -> connect -> execute -> observe -> verify -> recover -> update -> backup -> restore -> troubleshoot -> audit -> retire`

### Install
Verify package/build identity and supported platform. Installation alone creates no execution authority.

### Configure
Validate bounded config schema. Secret references must use approved injection; no committed credentials.

### Authorize
Bind trusted authentication and canonical AgentOS grant sources. Fail closed if either is unresolved.

### Connect
Establish network/worker/provider connectivity under least privilege. Connectivity is not readiness.

### Execute
Start with read-only/test operations through canonical admission/scheduler/governance.

### Observe
Emit redacted exact correlation and health evidence.

### Verify
Independent Green and security review must bind to exact candidate/runtime evidence where required.

### Recover
Exercise restart/replay/concurrency/result-write/receipt-write failures without false success.

### Update
Verify package identity, migration compatibility, rollback behavior and evidence continuity.

### Backup / restore
Prove authoritative-store backup and restore plus replay/idempotency correctness.

### Troubleshoot
Diagnostic paths remain read-only/bounded unless separately authorized; troubleshooting cannot bypass policy.

### Audit
Reconstruct decisions and durable outcomes from canonical evidence without secrets leakage.

### Retire
Revoke access, stop workers, protect/export/delete data under retention policy, retire secrets/credentials under owner/security authority and preserve required audit evidence.

## First non-production acceptance packet

Prerequisites:
- exact AgentOS candidate head;
- real trusted authentication source/adapter;
- real canonical AgentOS grant resolver/source;
- organization/seat evidence source if commercial multi-user fixture is included;
- existing scheduler/local-wake and governed worker path identified;
- persistence adapter suitable for the tested concurrency scope;
- bounded read/test operation only;
- deterministic replay/recovery fixtures;
- no project-file mutation while SG-08 remains blocked.

Acceptance sequence:
1. authenticated subject submits bounded request;
2. Server derives/validates organization + seat + project constraints from trusted evidence;
3. canonical AgentOS authority admits exact requested operation;
4. existing scheduler/routing/local-wake admits eligible governed worker;
5. worker executes bounded read/test operation;
6. exact request/task/mission/wake/worker/build/actor/authority correlation persists;
7. result and durable receipt survive restart/reload;
8. duplicate delivery invokes no second execution;
9. conflicting replay fails closed;
10. simulated interruption is recovered or classified UNKNOWN/BLOCKED without false success;
11. independent functional verification evaluates immutable evidence;
12. security review evaluates exact candidate;
13. PRS runs only when prerequisites are eligible;
14. no deployment/production authority is inferred.

## Required negative acceptance set

- unauthenticated request;
- spoofed authenticated subject;
- cross-org request;
- unassigned/suspended/revoked seat;
- payload self-grant;
- missing/mismatched canonical grant;
- wrong project/workspace;
- duplicate request/delivery;
- conflicting correlation;
- stale worker health;
- wrong worker/build identity;
- unavailable worker;
- result persistence failure;
- receipt persistence failure;
- restart before/after execution;
- interrupted verification;
- stale ownership;
- concurrent same-key execution;
- provider outage;
- database interruption;
- secret-shaped value in logs/receipts;
- cross-tenant audit leakage.

## Promotion ladder

Use explicit maturity labels only:
`PROPOSED -> DESIGNED -> IMPLEMENTED -> TESTED -> VERIFIED -> PRODUCTION-PROVEN`.

A capability advances only on evidence for that capability. Documentation can establish DESIGNED, code can establish IMPLEMENTED, deterministic tests can establish TESTED, independent exact-candidate evidence is required for VERIFIED, and production-proven requires authorized real deployment evidence over the defined operational period/scope.

## Current disposition

Security/deployment/acceptance contracts: DESIGNED.
Runtime Server: NOT IMPLEMENTED by this document.
Trusted authentication/canonical grant integration: BLOCKED.
Project-file mutation: BLOCKED by controlling Level-2 ownership assurance.
Physical Windows Server/worker acceptance: NOT CLAIMED.
Production deployment: NOT AUTHORIZED.
Overall Server GREEN: NO.