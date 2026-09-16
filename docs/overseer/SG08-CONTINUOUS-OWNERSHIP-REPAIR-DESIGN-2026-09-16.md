# SG-08 Continuous Ownership Repair Design — 2026-09-16

Status: **BLOCKED / design checkpoint only**

Scope owner: existing PR #104 project-file writer lineage only.

## Reproduced defect

Exact test head `235c73a4c450607abab5e09cdf740f4ab6e04724` proves a POSIX writer can lose the pathname lock after post-write verification but immediately before success-receipt persistence. The current writer then persists `MUTATED_VERIFIED` with `recovery_required:false`; release detects the successor only afterwards and execution rejects with `PROJECT_FILE_LOCK_RECOVERY_REQUIRED`.

This is a false-success ordering defect. A final pathname `assertOwnLock()` would only move the race and is not an acceptable repair.

## Required invariant

A reportable success receipt MUST NOT become durable unless the same ownership primitive that protects publish/recovery still excludes a successor for the entire interval:

`final target verification -> publish/recovery -> post-write verification -> durable success receipt -> ownership release`

Crash release must not depend on PID age or destructive pathname takeover.

## Existing primitives and limits

### Windows

The existing writer uses a temporary open file handle. The handle remains open across mutation and receipt persistence and is closed in `retireLock`. This is materially closer to the required lifetime, but physical Windows acceptance and independent assurance remain required. No claim is made that CI alone proves SG-08.

### POSIX

The current directory lock is only a pathname convention. `assertOwnLock()` proves owner metadata and inode identity at an instant, not continuously. `namespace-guard` serialises cooperating AgentOS acquire/retire operations, but it is acquired only around those operations and therefore does not fence publish + receipt persistence. An external actor can rename/replace the directory while the writer continues.

## Smallest acceptable repair shape

Do **not** add another lock, scheduler, ledger, authority source or persistence plane.

The repair must strengthen the existing ownership primitive so that its kernel-held lifetime covers the complete success-critical section. Candidate implementations may reuse an already-existing repository dependency/runtime primitive only if it provides all of:

1. exclusive acquisition without pathname check-then-act;
2. kernel/process crash release;
3. no destructive stale-PID takeover;
4. the same held token remains valid across publish/recovery and receipt persistence;
5. successor acquisition cannot succeed before the current writer releases that token;
6. recovery can distinguish a crashed writer from a live owner without trusting worker self-report;
7. no second mission ledger, scheduler, authority source or durable receipt system.

If no existing cross-platform primitive in the repository satisfies this, implementation remains HOLD rather than inventing an unreviewed lock subsystem.

## Acceptance tests

The repair is not accepted until exact-head evidence shows:

- the pre-receipt ownership-loss regression cannot persist false `MUTATED_VERIFIED` success;
- existing after-publish and retirement false-success baselines no longer permit a durable success receipt after ownership loss;
- O1–O18 ownership/recovery matrix remains satisfied;
- same-key replay and conflicting-intent idempotency remain deterministic;
- receipt persistence failure remains recovery-required and never COMPLETED;
- prepared recovery uses the same ownership fence as ordinary publish;
- full Ubuntu and Windows CI pass on the exact repair head;
- physical Windows acceptance passes on that exact head;
- independent Green passes on the unchanged head, followed by independent PRS challenge.

## Non-solutions

- another `assertOwnLock()` immediately before receipt persistence;
- keeping `namespace-guard` only for acquire/retire;
- PID-based stale lock deletion;
- worker-claimed ownership or worker self-verification;
- deleting/replacing an ambiguous extant lock;
- treating SQLite transaction ownership as filesystem ownership unless one existing transaction can demonstrably fence both filesystem publish and durable receipt persistence;
- predecessor CI, Linux-only evidence, or inferred Green/PRS.

## Next implementation decision

Before production code changes, scan existing dependencies and runtime modules for a kernel-backed cross-platform ownership primitive that can replace/strengthen the current POSIX directory ownership while preserving the Windows handle semantics. If none exists, record the gap and keep SG-08 BLOCKED rather than creating a competing subsystem.
