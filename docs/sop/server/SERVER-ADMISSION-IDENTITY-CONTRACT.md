# AgentOS Server — Admission, Identity and Seat Constraint Contract

Status: DRAFT / evidence-controlled
Workstreams: S-SRV-02 + S-SRV-03
Authority: contract only; no authenticated provider or canonical grant source is created by this document.

## Purpose

Define the smallest Server boundary that can receive an authenticated request and pass source-backed evidence into canonical AgentOS admission without allowing transport, organization membership, seat entitlement or client payloads to become execution authority.

## Non-negotiable separation

`authentication != organization membership != seat entitlement != project/workspace scope != canonical execution grant != execution result != independent Green != PRS assurance`

Each state must be independently evidenced. A downstream state cannot be inferred merely because an upstream state passed.

## Trust boundary

The Server Admission Adapter MAY:
- validate syntax and required transport fields;
- consume authentication results from an approved external/canonical authentication source;
- resolve or consume source-backed organization/seat evidence from its canonical owner once one exists;
- carry canonical AgentOS grant evidence/reference into existing admission;
- bind immutable request/delivery correlation;
- reject stale, conflicting, missing or replayed evidence;
- emit audit/evidence projections.

It MUST NOT:
- accept a client assertion such as `authenticated=true` as authentication;
- accept payload roles/scopes/grants as authority;
- create a second grant/permission registry;
- turn a paid/assigned seat into execution permission;
- let a worker or model mint its own authority;
- rewrite canonical mission/task/wake/result/receipt identity after creation;
- synthesize Green or PRS;
- treat logs/metrics as completion truth.

## Transport-neutral input envelope

Field names below are contract candidates, not authorization to extend canonical schemas. Reuse existing names/types where repository evidence provides them.

### Transport evidence
- `request_id`: immutable request correlation generated/accepted according to canonical request rules.
- `delivery_id`: idempotency/delivery identity where existing admission requires it.
- `authentication_evidence_ref`: opaque source-backed reference, never a raw credential/token.
- `authentication_issuer`: trusted source identity where canonical evidence provides it.
- `authentication_version`: source/version or generation where available.
- `authenticated_subject_ref`: opaque subject reference derived from trusted authentication, not copied from an untrusted payload.
- `session_id`: authenticated session correlation where supported.
- `issued_at` / `expires_at`: only when supplied by a canonical source; absence cannot be silently replaced with local freshness claims.

### Organization / seat constraints
- `organization_ref`: server-resolved organization identity.
- `membership_evidence_ref`: source-backed organization membership evidence.
- `seat_assignment_ref`: source-backed entitlement assignment.
- `seat_state`: canonical state such as active/suspended/revoked only when supplied by its owner.
- `entitlement_version`: version/generation for replay and revocation checks where supported.

### Requested scope
- `project_ref` / `workspace_ref`: requested bounded scope, validated against canonical membership/grant evidence.
- `requested_capability`: normalized through existing AgentOS capability semantics.
- `operation`: bounded requested operation; never shell text authority.

### Canonical governance evidence
- `authority_evidence_id`: existing source-backed AgentOS authority evidence reference where admission supports it.
- `grant_source` / `grant_version`: only when canonical grant evidence actually supplies them.

### Post-admission correlation
Mission/task/wake/worker/result/receipt IDs are canonical outputs/evidence and must not be client-authoritative inputs merely to make correlation pass.

## Fail-closed decision order

1. Parse bounded request envelope.
2. Reject unknown/forbidden authority-bearing client fields.
3. Resolve/validate trusted authentication evidence.
4. Derive authenticated subject from trusted evidence.
5. Resolve organization membership from canonical source.
6. Resolve seat entitlement as a commercial/admission constraint.
7. Validate requested project/workspace belongs to allowed organization/member scope.
8. Resolve canonical AgentOS grant/authority evidence.
9. Normalize requested capability through existing AgentOS capability semantics.
10. Bind request/delivery replay identity.
11. Submit evidence to existing canonical AgentOS admission/governance path.
12. Preserve returned task/mission/wake/etc. identities without rewriting.
13. Emit redacted audit evidence.

Any unresolved mandatory step returns a bounded denial/UNKNOWN/BLOCKED disposition before execution.

## Forbidden client authority fields

A transport implementation must reject or ignore-and-deny any untrusted attempt to set authority-bearing state such as:
- `authenticated=true`;
- `authorized=true`;
- `authority_admitted=true`;
- arbitrary `roles`, `permissions`, `grants`, `approval`, `green`, `prs`, `verified`, `completed`;
- worker-selected organization/project scope that conflicts with trusted evidence;
- client-selected canonical receipt/completion identity intended to replace existing durable identity.

Exact field handling must align with existing admission schemas; this list expresses the invariant, not a competing schema.

## Organization and five-seat invariant

A commercial Server may enforce a bounded seat count, but seat status is only an entitlement constraint.

Example logical predicate:

`admission_candidate = authenticated_subject && active_membership && active_seat && project_scope_allowed && canonical_execution_grant`

The first four terms do not imply the fifth.

Seat lifecycle states should be explicit and auditable. At minimum the product design must account for unassigned, active, suspended and revoked/reassigned states. Reassignment/revocation must invalidate future admission according to canonical session/grant semantics; this contract does not invent those semantics when absent.

## Deterministic negative-test matrix

| Case | Expected disposition | Execution calls |
|---|---|---:|
| Missing authentication evidence | DENY/BLOCKED | 0 |
| Client asserts authenticated=true without source evidence | DENY | 0 |
| Auth subject differs from payload actor | DENY | 0 |
| Missing organization membership evidence | DENY/BLOCKED | 0 |
| Cross-organization membership | DENY | 0 |
| Seat unassigned | DENY | 0 |
| Seat suspended/revoked | DENY | 0 |
| Seat belongs to another subject/org | DENY | 0 |
| Client self-grant/role/permission | DENY | 0 |
| Missing canonical grant | DENY/BLOCKED | 0 |
| Grant source/version mismatch | DENY | 0 |
| Grant project/workspace mismatch | DENY | 0 |
| Stale/revoked grant when canonical source proves it | DENY | 0 |
| Replayed request/delivery already durably completed | DUPLICATE/NO-EXECUTE | 0 |
| Same delivery with conflicting correlation | DENY/CONFLICT | 0 |
| Correlation changes after admission | DENY/CONFLICT | 0 |
| Restart with admitted but not executed request | RECOVER/CLASSIFY using canonical state | <=1 side effect |
| Crash after side effect before result/receipt | RECOVERY_REQUIRED/UNKNOWN until canonical reconciliation | no silent second side effect |
| Result persistence failure | BLOCKED/RECOVERY_REQUIRED | no false success |
| Receipt replay attempts different provenance | DENY/CONFLICT | 0 |
| Worker reports success without independent verification | NOT COMPLETE | bounded prior execution only |
| Green absent/fails | NOT COMPLETE | no completed claim |
| PRS absent where required | NOT ASSURED | no assured claim |

## Positive acceptance fixture

The first non-production positive fixture must remain read-only/test-only and use real existing evidence seams:

`trusted auth evidence -> organization/member/seat constraints -> canonical AgentOS grant -> existing admission -> existing scheduler/local-wake/routing -> governed bounded worker -> result -> durable receipt -> independent verification`

Project-file mutation is excluded until the controlling SG-08 ownership gate and required independent assurance close.

## Audit projection

Record only non-secret evidence needed to reconstruct the decision: request/delivery correlation, trusted issuer/source/version references, organization/subject/seat evidence references, requested/canonical scope, authority evidence ID, disposition/reason, canonical task/mission/wake/worker/result/receipt IDs when created, timestamps from authoritative sources, and code/build identity where available.

Never log raw credentials, bearer tokens, API keys, authentication secrets or unnecessary PII.

## Current implementation disposition

- Contract: DESIGNED.
- Trusted authentication provider/source binding: BLOCKED / not evidenced here.
- Canonical organization membership source: NEW-GAP candidate / must be proven before implementation.
- Seat assignment persistence/administration: PROPOSED; not execution authority.
- Canonical AgentOS grant lookup binding: BLOCKED on current Level-2 evidence.
- Runtime Server admission: NOT IMPLEMENTED by this document.
- End-to-end Server acceptance: NOT VERIFIED.
- Overall Server GREEN: NO.

## Next implementation gate

Before runtime code is written, fresh repository evidence must identify:
1. the canonical authenticated identity source or approved adapter target;
2. the canonical AgentOS grant resolver/source to call rather than clone;
3. whether organization membership/seat state already has a canonical owner;
4. the exact existing admission function/interface owned by the active Level-2 lineage;
5. a non-competing branch/owner boundary for adapter implementation.

If any of these are missing, preserve BLOCKED/NEW-GAP and continue with other Server evidence/contracts rather than fabricating authority.