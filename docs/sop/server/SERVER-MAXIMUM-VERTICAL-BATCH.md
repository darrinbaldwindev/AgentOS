# AgentOS Server — Maximum Vertical Execution Batch

Status: ACTIVE / evidence-controlled / DRAFT lineage
Owner workstream: AgentOS Server Overseer
Canonical portfolio mission: `darrinbaldwindev/Overseer#49`
Canonical server lineage: AgentOS PR #119 / `docs/sop-server-overseer`

## Invocation rule

Every owner instruction `continue autonomously`, `continue`, or `cont` means execute the full cycle:

`FRESH SCAN -> RECONCILE -> PRIORITISE -> CLAIM NON-COMPETING WORK -> EXECUTE DEEPLY -> TEST/VERIFY -> RECORD -> RESCAN -> REPLENISH -> HANDOFF`

Do not merely report. Maximise VERIFIED USEFUL MOVEMENT PER INVOCATION. Repository/runtime/CI evidence outranks this batch. If a dependency is unchanged and `BLOCKED_STABLE`, fall through to the next executable Server item.

## Hard boundaries

NO MODEL DECIDES ITS OWN AUTHORITY. Do not create a second AgentOS. No duplicate scheduler/queue, mission ledger, authority/permission registry, worker registry, memory authority, governance/policy engine, persistence authority, Green system, PRS system, recovery authority or completion truth source.

Without explicit owner authority: no merge, approve, ready transition, rebase, deploy, credential/security-policy change, production write, production autonomy, unrestricted shell/elevation, physical-host action, purchase/spend, external contact or publication of provisional commercial claims.

## Fresh-scan checkpoint — 2026-09-16

- AgentOS default `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1` (`docs: add commercial self-hosted seat tier`).
- AgentOS Server PR #119: DRAFT / UNMERGED, branch `docs/sop-server-overseer`, exact API head observed before this batch: `0158e26fee428702165a106653ff0ba17384585b`.
- AgentOS PR #104 remains the governed Windows/PowerShell + remote-bridge Level-2 lineage; current exact API head observed in this cycle: `bae44534d6d11b967fdac09bd734f8c073f23f2f`; fresh AgentOS Tests run #1415 / `35036492751` SUCCESS was previously bound to that head.
- AgentOS PR #112 owns runtime-shell eligibility consolidation; do not compete.
- AgentOS PR #113 owns canonical SOP library; Server documentation is a delegated server-specific lane through #119.
- Portfolio owner batch `.overseer/batches/OWNER-START-WORK-BATCH-2026-09-15.md` keeps Level 2 P0 and explicitly requires current-head reconciliation before edits.
- Overseer #49 keeps Level 2 immediate P0 and Level 5 strategic end-state.
- #104 A-AG-01 continuous project-file ownership remains BLOCKED; A-AG-02 authenticated actor + canonical grant binding remains BLOCKED. Server work must not manufacture either closure.

## Priority ladder

### S-SRV-01 — capability / primitive inventory
State: VERIFYING / documentation-level movement available.

Objective: continuously map Server needs to existing AgentOS primitives using `REUSE`, `ADAPT`, `EXTEND`, `NEW-GAP`, `BLOCKED`.

Acceptance:
- exact current owners/heads recorded;
- no duplicate control plane;
- every NEW-GAP backed by repository evidence;
- stale prose separated from exact Git/API head evidence.

### S-SRV-02 — authenticated Server Admission Adapter contract
State: EXECUTABLE AS CONTRACT; runtime wiring BLOCKED on canonical identity/grant source.

Objective: define a transport-neutral, fail-closed request envelope that carries trusted authentication evidence into existing AgentOS admission without becoming authority.

Required envelope/correlation candidates, only where canonical sources support them:
- request/delivery ID;
- organization ID;
- user/actor identity reference;
- session identity;
- project/workspace scope;
- requested operation/capability;
- canonical grant evidence reference/version;
- mission/task/wake correlation after canonical creation/admission;
- replay/idempotency identity;
- source/issuer/version/freshness evidence.

Negative matrix:
- missing authentication;
- malformed actor identity;
- spoofed actor in payload;
- payload self-grant;
- missing grant evidence;
- stale/revoked/malformed grant;
- grant issuer/source mismatch;
- cross-organization grant;
- cross-project grant;
- disabled/unassigned seat;
- seat belongs to different organization/user;
- replayed request;
- duplicate delivery;
- conflicting request/delivery identity;
- correlation mutation after admission;
- restart between admission and execution;
- result-write failure;
- receipt replay/conflict.

Acceptance: all authority remains canonical AgentOS authority; transport can only carry evidence and constraints. No fake provider/grant registry is promoted as real authority.

### S-SRV-03 — organization / user / five-seat entitlement boundary
State: PROPOSED / contract work executable.

Objective: define organization membership and seat entitlement as admission constraints, never execution authority.

Must distinguish:
`authenticated identity` != `organization membership` != `seat entitlement` != `project scope` != `execution grant` != `Green` != `PRS`.

Required lifecycle: assign, activate, suspend, reassign, revoke, audit attribution, session invalidation, concurrent-session policy, seat-count enforcement, organization deletion/retirement. Every mutation requires a canonical owner and audit evidence; Server must not invent authority to perform it.

### S-SRV-04 — worker identity / health projection
State: ADAPT / discovery executable.

Objective: map server-hosted worker/host/build/capability/health evidence into existing registry/routing concepts. Health is observational and cannot grant authority or readiness.

Negative matrix: stale heartbeat, wrong build, conflicting worker identity, cross-org worker claim, capability self-assertion, duplicate worker identity, unavailable worker, clock/freshness ambiguity.

### S-SRV-05 — durable persistence adapter readiness
State: ADAPT / production verification BLOCKED.

Objective: inventory canonical persistence contracts and document the exact adapter requirements for server/shared execution.

Must prove before promotion: atomic conditional ownership, competing runners share state, durable idempotent completion, first-write provenance, CAS/conflict semantics, crash recovery, backup/restore, schema migration, corruption handling, retention/privacy/audit. No shadow mission/completion authority in caches or convenience tables.

### S-SRV-06 — receipt + observability projection
State: ADAPT / contract work executable.

Objective: preserve exact request -> auth -> task -> mission -> scheduler -> worker -> execution -> result -> verification -> receipt correlation. Logs/metrics/traces are evidence projections, not completion truth.

Security: redact secrets/tokens; minimise PII; preserve audit attribution and evidence IDs.

### S-SRV-07 — recovery/concurrency assurance
State: DESIGN/TEST-MATRIX executable; mutation execution depends on #104 gates.

Required cases: restart during execution; crash after side effect; crash before receipt; crash after receipt; interrupted verification; stale/uncertain lock; duplicate/replay; concurrent workers; lost worker; provider outage; DB interruption; result persistence failure; recovery-envelope mismatch; authority-generation mismatch; successor ownership displacement.

Disposition must be fail-safe: `UNKNOWN` / `BLOCKED` / recovery-required rather than unsupported success.

### S-SRV-08 — backup / restore / disaster recovery
State: NEW-GAP candidate pending deeper inventory.

Define authoritative stores, backup scope, encryption, restore ordering, RPO/RTO targets as provisional until product authority validates, restore verification, lost-key/compromise handling, and evidence that restored state cannot duplicate completed side effects.

### S-SRV-09 — deployment / lifecycle SOP
State: CONTRACT executable; production deployment BLOCKED.

Lifecycle: Install -> configure -> authorize -> connect -> execute -> observe -> verify -> recover -> update -> backup -> restore -> troubleshoot -> audit -> retire.

Deployment modes to preserve distinctly: customer-owned server, private cloud/VPS, on-prem/business LAN, hybrid server + governed Windows workers. Do not conflate with future AgentOS-operated SaaS.

### S-SRV-10 — security threat / gate matrix
State: CONTRACT executable; credential/live testing BLOCKED.

Cover authentication, authorization, tenant isolation, secrets, TLS/network boundary, rate limiting, dependency/supply-chain risk, privileged/admin access, backup protection, compromise recovery, audit integrity and denial-of-service/resource exhaustion. Functional PASS cannot imply security GREEN.

### S-SRV-11 — commercial entitlement truth
State: PROVISIONAL / documentation-only.

Treat customer-hosted commercial Server, approximate five-seat concept and any price as provisional unless current commercial authority explicitly locks them. Runtime capability and commercial entitlement remain separate dimensions. Do not publish claims from research assumptions.

### S-SRV-12 — non-production end-to-end Server acceptance
State: BLOCKED until prerequisite authority source and Level-2 gates permit.

First target:
`authorized user -> bounded request -> canonical governance -> existing scheduler/execution -> governed worker -> bounded read/test execution -> exact correlation -> durable result/receipt -> independent verification -> recovery classification -> replay cannot silently duplicate side effects`.

Start read-only/test. Project-file mutation stays disabled until SG-08 and independent assurance close.

## Fall-through execution order

1. Reconcile exact heads, current owner batch, #49, #104/#112/#113/#119 and PRS evidence.
2. Execute S-SRV-01 inventory delta.
3. Execute S-SRV-02 transport/admission contract and denial matrix without fake authority.
4. Execute S-SRV-03 organization/seat contract.
5. Execute S-SRV-04 worker/health contract.
6. Execute S-SRV-05 persistence readiness inventory.
7. Execute S-SRV-06 observability/evidence contract.
8. Execute S-SRV-07 recovery matrix.
9. Execute S-SRV-08 backup/restore design.
10. Execute S-SRV-09 lifecycle/deployment SOP.
11. Execute S-SRV-10 security matrix.
12. Reconcile S-SRV-11 only against current commercial authority.
13. Prepare S-SRV-12 acceptance harness only when dependencies are real and non-competing.
14. Rescan and replenish with the next 3-8 executable vertical items.

## Verification rules

- Bind tests/CI to exact commit heads.
- Historical PASS does not transfer to changed code.
- Documentation/contract verification is not runtime verification.
- CI is not physical Windows acceptance.
- Worker success is not Green; Green is not PRS; PRS is not deployment authorization.
- A missing canonical source remains UNKNOWN/BLOCKED; never replace it with a convenient fixture and claim production readiness.

## Mandatory durable handoff

Every cycle records:

### CURRENT STATE
### EXACT EVIDENCE
### WHAT CHANGED
### WHAT VERIFIED
### WHAT UNKNOWN
### BLOCKERS
### NEXT VERTICAL SLICE
### GOVERNANCE / SECURITY NOTES

Also record exact repo/branch/head/PR, files/artifacts changed, exact-head tests/CI where applicable, owner action genuinely required, and next 3-8 executable items.

## Replenishment rule

Never allow the queue to end at a stable blocker. When one lane is `BLOCKED_STABLE`, advance another non-conflicting Server contract/test/evidence lane. Only stop when all safe work is exhausted or the next action crosses an owner/security/production boundary.