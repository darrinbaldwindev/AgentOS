# AgentOS Server — Worker, Persistence and Recovery Contract

Status: DRAFT / evidence-controlled
Workstreams: S-SRV-04, S-SRV-05, S-SRV-07, S-SRV-08
Lineage: AgentOS PR #119

## Objective

Define server-specific adapter obligations for worker identity/health, shared persistence, recovery and backup/restore without creating a second worker registry, mission ledger, scheduler, completion ledger, recovery authority or governance plane.

## Worker identity and health projection

A Server-hosted worker is an execution endpoint under existing AgentOS routing/admission. Registration or health MUST NOT grant execution authority.

Evidence projection should reuse canonical fields/types where they exist and may include:
- worker identity;
- host identity;
- build/code identity;
- capability set and capability-source evidence;
- observed health state and observation time/source;
- current claim/ownership identity where canonical execution provides it;
- task/mission/wake correlation;
- runtime class and bounded operation eligibility.

Health answers only whether an endpoint appears available under a defined observation. It does not answer whether the actor is authorized, the operation is allowed, the worker is eligible for a particular mission, execution succeeded, Green passed or PRS passed.

Fail closed for stale heartbeat, ambiguous freshness, conflicting worker/host identity, capability self-assertion without canonical evidence, wrong build identity, cross-scope worker claims, duplicate worker identity and unavailable workers.

## Persistence boundary

Server persistence is an implementation behind canonical AgentOS ownership contracts. It MUST NOT introduce a parallel mission/completion truth source.

A production-eligible shared adapter must eventually prove:
1. atomic conditional claim/acquire semantics;
2. owner-conditional renew/release where the canonical contract requires leases;
3. competing runners observe the same authoritative state;
4. durable idempotent completion and first-write provenance;
5. conflicting correlation cannot replace prior durable truth;
6. crash/restart recovery does not duplicate a completed side effect;
7. persistence failure cannot be converted to success;
8. schema/version migration is explicit and reversible or safely fail-closed;
9. corruption is detected/classified rather than silently repaired into success;
10. backup/restore preserves replay and provenance invariants.

In-memory and local filesystem state can support deterministic/single-process tests but cannot establish distributed production correctness.

## Canonical-state rule

For every replicated/cache/temporary representation document:
- canonical source;
- projection purpose;
- freshness semantics;
- invalidation behavior;
- whether it can authorize execution (normally NO);
- whether loss affects correctness;
- whether recovery can reconstruct it from canonical evidence.

A cache, metrics store, log index, temporary table or convenience database cannot become authority because it is easier to query.

## Recovery state machine constraints

Recovery consumes canonical durable evidence; it does not invent a second recovery authority.

At minimum classify:
- no execution evidence -> safe to admit only through normal canonical admission;
- claimed but execution unknown -> reconcile before any repeat side effect;
- side effect possible/result absent -> UNKNOWN/RECOVERY_REQUIRED until exact evidence resolves;
- result durable/receipt absent -> reconstruct only if canonical contract explicitly permits evidence-preserving receipt recovery;
- receipt durable -> duplicate delivery cannot execute again;
- conflicting durable identities -> CONFLICT/BLOCKED;
- authority generation changed/revoked -> fail closed according to canonical authority semantics;
- ownership displaced -> old owner cannot publish success.

## Required recovery/concurrency matrix

| Failure | Required invariant |
|---|---|
| Restart before execution | no execution without canonical re-admission/recovery eligibility |
| Crash during execution | no false success; reconcile exact side-effect evidence |
| Crash after side effect before result | no silent second side effect |
| Crash after result before receipt | recovery preserves exact provenance; no manufactured authority |
| Crash after receipt | replay is duplicate/no-execute |
| Result persistence failure | no completion claim |
| Receipt persistence failure | no completion claim unless canonical recovery proves durable result and permits reconstruction |
| Interrupted verification | not Green |
| Stale/uncertain ownership | old owner cannot publish success |
| Concurrent same-key workers | at most one canonical owner/side-effect path |
| Successor displacement | predecessor cannot later commit completion |
| Duplicate delivery | deterministic no-second-execution disposition |
| Conflicting request/task/mission/wake | deny/conflict |
| Recovery envelope mismatch | deny/conflict |
| Authority evidence mismatch | deny/block |
| Provider outage | bounded failure/retry under canonical policy; no authority change |
| Database interruption | fail closed; no local shadow success |

## Backup and restore contract

Before Server can claim backup/restore readiness, every authoritative store must have:
- owner and purpose;
- data classification and secret/PII handling;
- consistency/transaction boundary;
- backup method and encryption boundary;
- retention policy;
- restore order/dependencies;
- schema/version compatibility rule;
- corruption detection;
- audit evidence;
- restore verification;
- post-restore replay/idempotency verification.

A restored environment must not cause already-completed external side effects to execute again merely because a backup predates a local projection. If canonical durable completion cannot be established after restore, classify UNKNOWN/BLOCKED and require reconciliation.

RPO/RTO values remain product/operational decisions and are not invented by this contract.

## Disaster/compromise recovery

Design must account for:
- loss of a server node;
- loss/corruption of a state store;
- credential/key compromise;
- unauthorized privileged access;
- compromised worker identity;
- provider outage;
- partial restore;
- rollback to older application code;
- restored database with newer/older application schema.

Credential rotation, key replacement and production recovery actions remain protected owner/security operations. Documentation/tests may prepare them but do not execute them without authority.

## Observability projection

Server logs, metrics and traces should carry redacted correlation sufficient to reconstruct:
`request -> authenticated subject evidence -> org/seat constraint -> authority evidence -> task -> mission -> wake -> worker/host/build -> execution -> result -> verification -> receipt`.

Never log raw credentials/tokens/API keys or unnecessary PII. Observability is evidence projection, not completion authority.

## Current disposition

- Worker/health projection: DESIGNED contract only.
- Shared production persistence: BLOCKED pending real competing-runner/failure-recovery verification and promotion gates.
- Recovery/concurrency matrix: DESIGNED; executable deterministic fixtures should reuse existing canonical recovery/persistence interfaces.
- Backup/restore: DESIGNED baseline; no runtime restore acceptance performed.
- Disaster/compromise recovery: PROPOSED/DESIGNED boundary; no production action.
- Overall Server GREEN: NO.

## Next executable slice

1. inventory exact existing persistence interface/module names on the active Level-2 lineage;
2. inventory worker/host/capability evidence structures and avoid schema duplication;
3. bind deterministic read-only Server fixture design to those exact interfaces;
4. only implement an adapter after ownership reconciliation proves a non-competing seam;
5. route any changed executable lineage through exact-head CI, independent Green/security and PRS as required.