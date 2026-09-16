# SOP-REC-001 — Interrupted, Duplicate and Uncertain Execution

**Owner:** SOP Overseer  
**Status:** REVIEW REQUIRED / IMPLEMENTATION-DEPENDENT  
**Version:** 0.1-draft  
**Last verified:** 2026-09-15

## Principle
Uncertainty is not success. A worker crash, missing result, missing receipt, stale lock, replay, or interrupted verification must never be converted into completion merely to make the mission progress.

## Operator procedure
1. Stop further mutation or external side effects for the affected scope where the canonical runtime permits this safely.
2. Preserve existing mission/task/worker/result IDs and evidence. Do not manufacture replacement history.
3. Determine the last fully verified durable checkpoint from canonical state.
4. Determine whether a side effect may already have occurred.
5. Reconcile durable receipt/result evidence with the actual target state.
6. If ownership/lock state is uncertain, treat it as an assurance blocker until the canonical recovery path establishes safety.
7. For replay/duplicate delivery, require the canonical idempotency/replay path; do not issue a fresh mutation merely because the previous response was lost.
8. Resume only from a verified recoverable state and only with current authority.
9. Record the recovery disposition and remaining uncertainty.
10. Route completion-grade evidence through independent verification/assurance as required.

## Mandatory non-success cases
- write may have happened but receipt is absent;
- receipt exists but target state does not match it;
- partial write/post-image uncertainty;
- crash between mutation and receipt;
- crash between execution and verification;
- stale or ambiguous ownership;
- concurrent writers;
- duplicate/replayed task with uncertain prior side effect;
- conflicting correlation identifiers;
- interrupted tests;
- result-write failure;
- stale evidence;
- approval/authority uncertainty;
- worker self-verification presented as independent verification.

## User-facing language
Prefer precise states such as `Recovery required`, `Execution state uncertain`, `Verification pending`, `Verification failed`, or `Unable to confirm stop`. Do not report `Completed` until the canonical completion requirements are actually satisfied.

## Escalation
Escalate when canonical state cannot establish a safe recovery point, the affected resource has external/irreversible side effects, credentials may be involved, evidence conflicts, or ownership cannot be safely re-established.

## Revalidation
Revalidate against changes to the canonical recovery store, mission ledger, ownership primitive, idempotency/replay logic, receipt persistence, Stop semantics, or assurance gates.