# SOP-REC-004 — Ownership, Replay and Receipt-Target Recovery

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Safety invariant
For mutation-capable work, a success receipt cannot prove safe commit if exclusive ownership was lost during the commit/recovery/verification/receipt/release interval. Valid postimage plus durable success receipt is insufficient when continuous ownership is independently falsified.

## Cases
STALE_OWNER; SUCCESSOR_DISPLACEMENT; CONCURRENT_WRITER; DUPLICATE_TASK; REPLAYED_TASK; RECEIPT_TARGET_MISMATCH; PREPARED_WRITE_RECOVERY; PARTIAL_MUTATION; UNKNOWN_PRIOR_SIDE_EFFECT.

## Procedure
1. Bind mission/task/worker/target/preimage/code identity before mutation.
2. Use only the canonical ownership/fencing primitive; do not create a documentation-side lock scheme.
3. Preserve the fence continuously for the interval required by the runtime contract.
4. On ownership uncertainty, do not publish/verify/persist success as though ownership were continuous.
5. On duplicate/replay, resolve canonical idempotency/receipt state before invoking work.
6. On receipt-target mismatch, reject the receipt; never relabel it to the requested target.
7. On partial/prepared state, inspect canonical recovery metadata and exact target state before deciding resume/rollback/manual recovery.
8. Preserve competing evidence and choose the safer disposition when evidence conflicts.

## Current independent negative evidence
PRS #17 reports exact-head bounded reproduction where normal publish and prepared-write recovery can mutate/persist success before release detects successor displacement. Therefore project-file continuous ownership remains fail-closed for production promotion until a repaired exact AgentOS head is independently challenged and passes the required gates.

## Prohibited shortcuts
PID/liveness guesses are not ownership proof; receipt existence is not ownership proof; CI is not physical acceptance; worker verification is not independent assurance; a new lock/ledger/scheduler is not an acceptable documentation workaround.