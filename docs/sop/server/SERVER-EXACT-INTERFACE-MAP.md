# AgentOS Server — Exact Interface Map and Implementation Gate

Status: DRAFT / evidence-controlled
Server lineage: AgentOS PR #119
Dependency lineage scanned: AgentOS PR #104 `agent/overseer/windows-worker-bridge` at `bae44534d6d11b967fdac09bd734f8c073f23f2f`

## Purpose

Replace generic Server architecture assumptions with exact current AgentOS interfaces. This map is an integration guide, not authority to modify #104-owned runtime seams.

## Exact primitive inventory

### Canonical dispatch task — REUSE
`src/dispatch/dispatch.mjs`

Current task validation requires `task_id`, `issuer`, `target`, `objective`, `priority`, `scope`, `constraints`, `acceptance_criteria`, `authority`, `status`, and `mission_id`. Authority contains `granted_capabilities`. Completion is a state transition from verification and requires evidence.

Server implication: do not invent a Server task/mission schema. A Server adapter must ultimately produce/hand off into this canonical task model or its active successor.

### Mission/decision context — REUSE
`src/dispatch/canonical-context.mjs`

`buildCanonicalContext` requires `.agentos/state` as state authority and projects repository authority, default Overseer, missions and decisions. `validateTaskContext` requires a known mission and, when present, an accepted known decision.

Server implication: organization/workspace presentation cannot replace canonical mission/decision context.

### Dispatch envelope — REUSE / EXTEND only if separately authorized
`src/dispatch/envelope.mjs`

`validateDispatchEnvelope` composes dispatch-task validation with canonical task context. `createDispatchEnvelope` rejects mission/decision conflicts.

Server implication: preserve this correlation boundary. Do not add a parallel Server envelope that bypasses canonical validation.

### Authority policy — REUSE, but source binding BLOCKED
`src/dispatch/authority.mjs`

Current policy trusts configured issuer and capability sets; `authoriseDispatch` validates task issuer and verifies required capabilities are included in granted capabilities and allowed by policy.

Critical limitation: this module validates already-present task authority. It does not authenticate a human/server subject, resolve organization membership, assign a commercial seat, or retrieve a canonical external grant. Therefore it MUST NOT be treated as the missing authenticated identity/grant source.

### Operational role identity — REUSE, not user authentication
`src/governance/role-identity.mjs`

GOV-ROLE-001 defines operational roles and requires provider + session identity, with explicit role actions. Provider/model identity is deliberately separate from operational role identity.

Critical limitation: `createRoleIdentity` validates construction of an operational role object; it is not evidence that an external user authenticated. Server MUST NOT call it with client-provided values and then claim authentication.

### Worker contract — REUSE / ADAPT
`src/workers/worker-contract.mjs`

A worker requires `id`, `capabilities`, and `execute(task)`. `executeWorker` returns worker ID, output/error, latency and success.

Critical limitation: worker success is execution evidence only. The base worker contract does not establish host/build identity, tenant membership, execution authority, Green or PRS. Server worker health/build evidence should be an adapter/projection around existing worker/routing contracts, not a second registry.

### Worker claim/authority seam — REUSE
`src/dispatch/worker.mjs`

`claimNextTask` selects queued tasks for the receiver, validates the dispatch task, runs canonical `authoriseDispatch`, then claims it. Persistence is caller-supplied.

Server implication: a Server request must not reach worker execution by bypassing this authority/claim lineage or its active successor.

### Local execution cycle — REUSE dependency, not Server completion truth
`src/dispatch/local-cycle.mjs`

The local cycle selects queued work, creates/preserves a wake trace, claims under authority policy, advances task state, performs inspect/act, records evidence, verifies and completes/blocks/escalates, then validates the response.

Server implication: this is evidence that scheduling/worker lifecycle already exists. Do not implement a second Server lifecycle engine. Note that current local-cycle response sets `mission_id` from `started.task_id`; Server must not infer richer mission semantics from that convenience response without the active Level-2 contract.

### Persistence interface — REUSE / ADAPT
`src/dispatch/persistence.mjs`

Production adapter methods are exactly:
- `acquireLease`
- `renewLease`
- `releaseLease`
- `getCompletion`
- `putCompletion`

Implementations are explicitly required to provide atomic conditional semantics in their backing store.

### Wake-cycle production persistence adapter — REUSE / ADAPT
`src/dispatch/production-persistence.mjs`

`createProductionPersistenceStores(adapter)` adapts the production contract into acquire/renew/release plus idempotent begin/complete semantics. `begin` rejects already-completed task IDs; `complete` delegates first-write behavior to `putCompletion` and classifies already-completed/conflict.

Server implication: a future shared Server database adapter belongs behind this interface. Do not create a Server completion ledger.

### Existing dispatch persistence candidates — REUSE evidence / production promotion still gated
The #104 dispatch tree contains existing `shared-reference-persistence.mjs`, `github-contents-persistence.mjs`, lease, idempotency, recovery, scheduler, runtime health/status/supervisor and related primitives. Their presence disproves a generic claim that Server needs a new persistence/scheduler/recovery plane.

## Missing source findings

Fresh exact-lineage inspection did NOT establish:
- an authenticated end-user identity provider/source;
- a canonical organization membership store;
- a canonical commercial seat assignment store;
- an external/canonical grant resolver that turns trusted authenticated identity into the already-present task authority evidence.

These remain `BLOCKED` or `NEW-GAP candidate` until current repository/owner evidence assigns a canonical source. Absence in this inspection is not permission to invent one.

## Smallest legitimate Server implementation seam

The first executable Server runtime adapter should be a **pre-admission evidence adapter**, but only after source ownership is resolved. It should:
1. accept an already-verified authentication result from an approved provider adapter;
2. resolve/validate organization + seat constraints from a canonical Server entitlement source;
3. obtain canonical AgentOS grant evidence from the approved grant resolver;
4. construct only the bounded fields required by existing AgentOS admission/task creation;
5. call the existing dispatch/admission path;
6. never execute a worker directly;
7. never create mission/task/completion truth outside canonical AgentOS;
8. emit redacted correlation/audit projection.

Until steps 1-3 have real sources, runtime implementation stays blocked. Documentation/test vectors may continue.

## Proposed test seam once sources exist

Use dependency injection for source readers, not a fake authority implementation:
- `readAuthenticatedSubject(evidenceRef)`
- `readMembership(subjectRef, organizationRef)`
- `readSeatAssignment(subjectRef, organizationRef)`
- `resolveCanonicalGrant(subjectRef, projectRef, requestedCapability)`
- `submitCanonicalAdmission(...)`

Tests may stub these functions to verify fail-closed composition, but production readiness cannot be claimed from stubs. The adapter itself must not persist grants or membership unless that storage is separately established as canonical product ownership.

## Required composition negatives

Zero canonical admission calls for: missing auth evidence; subject mismatch; missing/cross-org membership; unassigned/suspended/revoked seat; payload self-grant; missing/mismatched canonical grant; project mismatch; forbidden capability; malformed request/delivery correlation.

Zero worker execution calls for all admission denials. Duplicate durable completion must not execute again. Conflicting durable completion/correlation must fail closed.

## Implementation decision

**Do not write Server runtime code on PR #119 yet.** #119 is documentation/SOP lineage and #104 owns the active Level-2 runtime seam. The exact scan materially narrowed the blocker but did not prove a non-competing authenticated source implementation target.

Next safe movement:
1. search current portfolio coordination for an assigned identity/entitlement source owner;
2. reconcile whether commercial entitlement architecture already defines canonical storage ownership;
3. prepare source-agnostic adapter test vectors on the Server docs lineage;
4. request/record an implementation handoff into the active runtime lineage only when ownership is explicit;
5. keep project-file mutation out of first Server acceptance.

## Maturity

Exact interface inventory: VERIFIED against cited #104 head at inspection time.
Server composition design: DESIGNED.
Authenticated source binding: BLOCKED.
Organization/seat persistence ownership: UNKNOWN / NEW-GAP candidate.
Server runtime adapter: NOT IMPLEMENTED.
Overall Server GREEN: NO.