# AgentOS Server — Pre-Admission Deterministic Test Vectors

Status: DRAFT / evidence-controlled
Workstream: S-SRV-02
Server lineage: AgentOS PR #119
Exact runtime dependency scanned: AgentOS PR #104 head `607f2683b7d3b234fc6ffa70e2a7d42e31499c3a`
Canonical admission seam: `runtime/remote-authority-admission.mjs`

## Purpose

Define executable, source-agnostic test vectors for the future thin Server transport/pre-admission adapter without inventing an identity provider, organization store, seat registry, grant source, scheduler, mission ledger, worker registry, Green system, PRS system or completion ledger.

The adapter under test is only responsible for validating trusted transport evidence and forwarding a clean authority-free candidate plus authenticated actor context to canonical AgentOS admission.

## Canonical seam assumptions verified from source

The current canonical producer requires:
- `candidate.admission_state === 'AWAITING_AUTHORITY'`;
- `actorContext.authenticated === true`;
- non-empty actor ID and issuer;
- exact actor/issuer match between candidate and authenticated context;
- trusted issuer membership;
- non-empty requested capabilities within configured policy;
- caller-supplied `authoritySource.resolveGrant(...)`;
- `GRANTED` status plus exact actor/issuer/project provenance;
- complete/in-policy granted capabilities;
- source-backed grant `evidence_id` and `mission_id`;
- persistence-backed request/delivery replay/conflict denial;
- generated canonical task and wake identities.

Server tests MUST therefore prove that transport-level denial happens before this seam when possible, and canonical admission denial is propagated unchanged when it owns the decision.

## Test harness counters

Every test fixture should expose counters for:
- `authentication_reads`;
- `membership_reads`;
- `seat_reads`;
- `grant_reads`;
- `canonical_admission_calls`;
- `scheduler_calls`;
- `local_wake_calls`;
- `worker_calls`;
- `receipt_writes`.

Pre-admission denial requires `canonical_admission_calls === 0` and all execution-side counters `=== 0`.
Canonical-admission denial may have `canonical_admission_calls === 1` but all scheduler/local-wake/worker/receipt counters must remain `0`.

## Baseline positive fixture

Inputs:
- immutable transport request ID;
- trusted authentication result with opaque evidence reference;
- authenticated actor ID `actor-A`;
- trusted issuer `issuer-A`;
- organization membership ACTIVE;
- seat ACTIVE;
- project scope includes `project-A`;
- candidate actor/issuer/project match trusted evidence;
- candidate state `AWAITING_AUTHORITY`;
- requested capability `repo.status`;
- target host ID present;
- canonical grant resolver returns `GRANTED`, same actor/issuer/project, capability includes `repo.status`, plus evidence ID and mission ID.

Expected:
- adapter makes exactly one canonical admission call;
- adapter never creates mission/task/wake IDs itself;
- canonical admission result controls task/correlation identity;
- no direct scheduler/worker call from the adapter;
- authentication evidence reference remains distinct from authority evidence ID.

This fixture proves composition only, not real identity-provider integration or production readiness.

## Pre-admission denial vectors

| ID | Mutation | Expected | Canonical admission |
|---|---|---|---:|
| PA-01 | no authentication result | DENY/BLOCKED | 0 |
| PA-02 | authentication result `authenticated=false` | DENY | 0 |
| PA-03 | blank authenticated actor ID | DENY | 0 |
| PA-04 | blank issuer | DENY | 0 |
| PA-05 | missing authentication evidence reference | DENY | 0 |
| PA-06 | candidate missing/not object | DENY | 0 |
| PA-07 | candidate not `AWAITING_AUTHORITY` | DENY | 0 |
| PA-08 | candidate actor differs from authenticated actor | DENY | 0 |
| PA-09 | candidate issuer differs from authenticated issuer | DENY | 0 |
| PA-10 | target host ID blank | DENY | 0 |
| PA-11 | payload supplies `authority_evidence_id` | DENY | 0 |
| PA-12 | payload supplies `authority_admitted=true` | DENY | 0 |
| PA-13 | payload supplies `mission_id` as authority claim | DENY | 0 |
| PA-14 | payload supplies `granted_capabilities`/grant object | DENY | 0 |
| PA-15 | payload supplies Green/verified/completed state | DENY | 0 |
| PA-16 | payload supplies PRS/assurance state | DENY | 0 |
| PA-17 | malformed request/delivery correlation | DENY | 0 |
| PA-18 | transport replay where transport layer guarantees uniqueness | DUPLICATE/DENY | 0 |

## Organization / seat constraint vectors

These execute only once a canonical entitlement owner exists. Until then they remain test-contract fixtures, not production claims.

| ID | Mutation | Expected | Grant reads | Admission |
|---|---|---|---:|---:|
| ENT-01 | no organization membership evidence | DENY/BLOCKED | 0 | 0 |
| ENT-02 | membership belongs to different org | DENY | 0 | 0 |
| ENT-03 | membership suspended/revoked | DENY | 0 | 0 |
| ENT-04 | seat unassigned | DENY | 0 | 0 |
| ENT-05 | seat belongs to different actor | DENY | 0 | 0 |
| ENT-06 | seat belongs to different org | DENY | 0 | 0 |
| ENT-07 | seat suspended/revoked | DENY | 0 | 0 |
| ENT-08 | requested project outside membership scope | DENY | 0 | 0 |
| ENT-09 | stale entitlement version after known revocation | DENY | 0 | 0 |
| ENT-10 | concurrent seat-count limit exceeded | DENY/CONFLICT | 0 | 0 |

Seat/membership success still does not imply an execution grant.

## Canonical admission-owned denial vectors

These must reach canonical admission exactly once and preserve its failure.

| ID | Mutation | Expected canonical result |
|---|---|---|
| CA-01 | issuer not in trusted issuer policy | `REMOTE_ISSUER_NOT_TRUSTED` |
| CA-02 | no requested capability | `REMOTE_CAPABILITY_REQUIRED` |
| CA-03 | requested capability outside policy | `REMOTE_CAPABILITY_NOT_ALLOWED` |
| CA-04 | grant missing/denied | `REMOTE_AUTHORITY_GRANT_REQUIRED` |
| CA-05 | grant actor mismatch | `REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH` |
| CA-06 | grant issuer mismatch | `REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH` |
| CA-07 | grant project mismatch | `REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH` |
| CA-08 | grant missing evidence ID | deny/type failure from canonical seam |
| CA-09 | grant missing mission ID | deny/type failure from canonical seam |
| CA-10 | requested capability absent from grant | `REMOTE_AUTHORITY_GRANT_INCOMPLETE` |
| CA-11 | grant includes capability outside policy | `REMOTE_AUTHORITY_GRANT_OUTSIDE_POLICY` |
| CA-12 | duplicate/conflicting request/delivery persistence | `REMOTE_ADMISSION_REPLAY_OR_CONFLICT` |

For all CA cases: scheduler/local-wake/worker/receipt counters remain zero.

## Correlation immutability vectors

- authenticated actor ID cannot be rewritten after source resolution;
- issuer cannot be rewritten after source resolution;
- candidate `request_id` and `delivery_id` cannot be mutated between validation and canonical admission;
- canonical returned `task_id`, `mission_id`, `wake_trace_id`, request marker and artifact IDs cannot be replaced by transport/client values;
- authentication evidence reference cannot substitute for `authority_evidence_id`;
- authority evidence ID cannot substitute for Green/security/PRS evidence;
- target host ID is a routing/execution constraint, not actor authentication or grant authority.

Any detected mutation after validation returns CONFLICT/DENY before execution.

## Restart / replay vectors

1. crash after transport authentication but before canonical admission: no task exists; retry must re-resolve current mandatory source evidence rather than trusting volatile success flags;
2. crash while canonical admission persistence is committing: retry depends on canonical request/delivery replay markers and must not create a second task;
3. canonical admission completed, response lost: retry returns duplicate/conflict semantics from canonical persistence; adapter must not synthesize a replacement task;
4. seat or membership revoked between first attempt and retry: current canonical entitlement evidence controls retry;
5. grant generation/revocation changes between attempts: current canonical grant source controls retry.

## Secret / PII vectors

The adapter must reject/redact evidence projections containing raw password, bearer token, session secret, API key, refresh token or other credential material. Audit projection should prefer opaque evidence references and minimal actor/org identifiers required for traceability.

A test should inject secret-shaped values into transport metadata and prove they do not appear in logs/receipts/errors produced by the adapter.

## Implementation gate

These vectors are ready to become deterministic tests only after a fresh scan identifies a non-competing Server adapter module and source interfaces. Stubs may exercise composition behavior, but stub PASS cannot promote authenticated identity, entitlement, grant integration, security GREEN, PRS or production readiness.

Current disposition:
- vector contract: DESIGNED;
- canonical seam behavior: source-inspected at exact #104 head above;
- Server adapter runtime: NOT IMPLEMENTED;
- real authentication source: BLOCKED/UNKNOWN;
- canonical org/seat source: UNKNOWN / NEW-GAP candidate;
- overall Server GREEN: NO.