# Local scheduler acceptance boundary

The OS scheduler is the clock. Each invocation of `scripts/scheduler-tick.mjs`
admits at most one new governed deterministic DRY_RUN wake. Source installation
defaults remain scheduler disabled, cadence 5 minutes, autonomy disabled.
Windows Task Scheduler registration and runtime configuration are separate:
the tick supports both scheduler configuration values, but never enables the OS
task or edits configuration. Doctor certifies the disabled fresh-install default.

## Process acceptance

`node --test tests/scheduler-tick-acceptance.test.mjs` exercises the real entrypoint
in fresh Node processes and isolated temporary homes. It verifies repeated ticks,
reinstall continuity, exact task/mission/wake identity through persisted task,
response, event, worker output and reconciled SQLite budget, concurrent tick
admission, unsafe configuration rejection and evidence append failure.
These are process tests, not proof of five minutes of elapsed OS scheduling.

Two identity defects in PR #71's previous head are covered: wake admission must
not select an older queued task; response mission identity must use the admitted
task's mission ID rather than substituting the task ID. PR #80 already contains
the same two identity corrections; preserve its separate chat admission guard.

## Lock and recovery contract

An atomic directory creation at `state/scheduler-tick.lock` admits one scheduler
process per canonical home. Contenders return BLOCKED/nonzero without changing
runtime state or appending evidence. A successful wake appends its scheduler
record before releasing the lock. Failed wakes retain the lock. If the evidence
file itself is unavailable, process failure and the retained lock are the signal;
no successful evidence claim can be made.

An old lock is never stolen using age or PID. Process death, malformed ownership,
or a partially written wake require owner reconciliation. Before any manual lock
removal: stop admission, establish that no writer is active, inspect task,
response, event, budget and scheduler evidence, and disposition any incomplete
work. This document does not authorize changing the owner's physical scheduler.

This guard covers scheduler invocations only. Manual wake, Basic Chat, boot and
other writers must not concurrently use the same home. It is not a general
multi-process persistence implementation. Separate sequential invocations create
fresh work; there is no delivery ID or exactly-once retry/deduplication promise.
Stale-lock automatic recovery, OS reboot continuity, hard-kill/power-loss atomicity,
and production/provider execution are not certified.

## CI and physical evidence

Windows Local Acceptance explicitly checks out the PR head SHA and prints it.
Other PR workflows may test a synthetic merge; inspect checkout logs before
attributing evidence to a standalone head. Windows CI never registers or changes
Task Scheduler. Real five-minute cadence needs separately captured OS task
configuration/run metadata and correlated durable records on the physical host.

Historical Issue #63 physical records at the previous #71 head demonstrate the
bridge, but task/wake substring presence alone does not prove mission/budget
identity or restart/overlap recovery. Do not attribute old physical evidence to
this changed implementation. Keep #71 draft/unmerged pending current CI,
governance review, and one-action-at-a-time owner physical verification.
