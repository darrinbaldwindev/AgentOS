# Host ownership repair

Base: PR #93 `c50b2e805535aa30b7d46245074ca2c62f63601b`.
Baseline: 303 tests passed. A deterministic publication-window challenge creates
an empty existing lock, as can occur between exclusive open and owner write.
The prior host started successfully and replaced that lock: ownership was stolen.
A stale PID check followed by unlink also has a competing-recoverer race; process
probe errors must not be treated as reliable proof that an owner is dead.

The existing exclusive-file lock now rejects every existing lock without deletion.
Normal close/restart still works. Empty, stale or malformed lock requires explicit
recovery. Failed lock writes close the file descriptor while retaining ownership
uncertainty. No second lock manager, scheduler or persistence system was created.

Tradeoff: automatic stale-lock restart is deliberately withheld until an atomic,
independently reviewed takeover protocol exists. Recovery must first establish a
quiescent host and reconcile interrupted work; do not turn an uncertain completion
into permission to rerun. No automated lock removal command is introduced here.

Updated suite: 304 local tests passed, including retained close/restart and history
checks. Linux fixture only; Windows filesystem and physical acceptance remain
unproven. Bridge #91 and host #93 are separate lineages; this does not integrate
them. Independent review required. No overall GREEN.
