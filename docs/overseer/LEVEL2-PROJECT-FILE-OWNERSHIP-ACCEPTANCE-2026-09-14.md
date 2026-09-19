# Level 2 project-file ownership acceptance matrix — 2026-09-14

Scope: evidence-first acceptance criteria derived from the current PR #104 project-file writer and its reported independent Green failure. This document does not alter or enable mutation.

## Current blocker

The writer validates lock ownership before publish, but the current implementation does not prove a kernel-enforced ownership boundary held continuously through publish/recovery/receipt. The known failure class is: validate ownership -> competing actor displaces/replaces ownership -> original writer publishes -> success receipt can be persisted before ownership loss is observed.

Project-file mutation therefore remains HOLD.

## Required repair property

A mutation attempt must hold an ownership primitive that another writer cannot replace, retire, or supersede between final pre-publish validation and the durable mutation/receipt decision. Ownership loss must prevent reportable success, and crash release/recovery must be deterministic.

## Minimum adversarial matrix

| Case | Injection point | Required result |
|---|---|---|
| O1 | competitor starts before first writer acquires ownership | exactly one owner; loser fails closed without target mutation |
| O2 | competitor starts immediately after ownership acquisition | owner remains unique; competitor cannot displace live owner |
| O3 | ownership namespace/path is moved/replaced after validation but before publish | original writer must not publish/report success; recovery-required evidence retained |
| O4 | same race during prepared-write recovery | recovery publish must fail closed unless the same protected ownership boundary remains held |
| O5 | crash after prepared artifact, before publish | restart classifies prepared intent deterministically; no duplicate publish |
| O6 | crash immediately after target publish, before receipt | restart detects exact postimage/prepared identity and emits at most one correlated recovery receipt |
| O7 | crash after receipt persistence, before release | replay returns the existing verified receipt and never re-applies mutation |
| O8 | receipt persistence fails after target mutation | no COMPLETED claim; recovery-required state identifies exact target/postimage/intent |
| O9 | two processes reuse same idempotency key with identical intent | one mutation; replay resolves to same receipt |
| O10 | same idempotency key with conflicting intent | deterministic idempotency conflict; no second mutation |
| O11 | external target mutation after preimage read but before publish | `PROJECT_FILE_EXTERNAL_MUTATION` or equivalent; no overwrite |
| O12 | attacker/sibling replaces temp/prepared file identity | recovery/publish rejected; no receipt based only on expected hash |
| O13 | stale/abandoned owner evidence is ambiguous | fail closed to recovery-required; no automatic destructive takeover |
| O14 | recovery decision is stale by the time publish is attempted | revalidation/ownership primitive prevents publish |
| O15 | target path/symlink changes between canonicalisation and publish | operation stays inside approved canonical root or fails closed |
| O16 | process is killed while ownership primitive is held | OS releases the primitive or restart has a deterministic, independently authorised recovery path |
| O17 | three writers contend with retirement/recovery | no successor displacement; exactly one reportable mutation for an intent |
| O18 | test/verification is interrupted after mutation | completion remains blocked; durable mutation receipt survives and verification can resume without replaying mutation |

## Receipt invariants

A successful mutation receipt must bind at minimum:

- project_id;
- mission_id;
- task_id;
- worker_id;
- canonical target path;
- expected preimage hash;
- observed preimage hash;
- postimage hash;
- idempotency-key hash;
- immutable intent hash;
- prepared artifact identity when used;
- mutation/recovery result;
- recovery evidence ID when recovery was authorised;
- code/build identity where available;
- recorded timestamp.

A receipt is not success evidence if the target does not match its postimage or if its correlation disagrees with the admitted task.

## Verification / assurance gates

The repair is not acceptable until all applicable evidence exists on the exact repair head:

1. focused deterministic race/recovery suite passes;
2. full repository suite passes;
3. Windows-native CI passes on the runtime that exposes the chosen primitive;
4. physical Windows acceptance exercises the exact changed head;
5. independent Green reruns the ownership-through-publish adversarial cases and returns PASS for the bounded slice;
6. PRS independently challenges crash, partial-write, receipt, replay, stale-lock and correlation semantics and returns the required assurance disposition;
7. no final COMPLETED state is emitted from worker/self-verification alone.

## Non-solutions

The following are insufficient on their own:

- another pathname check immediately before `rename`;
- PID-based stale-lock takeover;
- worker-claimed lock ownership;
- a receipt written after an unprotected publish;
- hash verification without protected ownership/correlation;
- CI on a predecessor head;
- Linux-only evidence for a Windows-specific primitive;
- Green/PRS inferred from execution success.

## Next implementation seam

The existing SQLite write transaction mentioned in PR #104 is a candidate coordination primitive, but it is not accepted merely because it exists. Any repair must prove that the chosen primitive protects the critical interval through publish/recovery/receipt and composes with the existing persistence/claim architecture rather than becoming a second mission ledger or scheduler.
