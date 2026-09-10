# Windows lifecycle follow-up: uncertain ownership

Base: PR #98, `84fa347428881e746d5a220acd0caaf5d7181019`.
Execution-produced repair; no independent assurance or release approval.

The latest Windows Ctrl+C repair retains automatic PID-based lock takeover.
A recovery guard serializes recovery contenders but does not protect the initial
owner between exclusive file creation and owner publication. Three deterministic
negative tests reproduced a successful competing chat startup while an existing
lock handle remained open (empty, malformed, and untrusted dead-PID payloads).

This repair applies the conservative ownership rule previously established in
PR #96 to the newer lifecycle implementation: an existing lock is never stolen.
Failed owner publication closes the handle but retains the uncertain path.
Windows close-before-unlink ordering, transient unlink retries, ETX interception,
trace stages and Windows lifecycle workflow remain in place.

Tradeoff: abandoned locks require explicit recovery. This patch does not implement
or authorize that recovery. Normal close/restart remains covered.

Validation on Linux / Node 24.19.0:
- Unmodified base suite: 306 passed, 1 Windows-only skip.
- New ownership challenges before repair: 3 failures reproducing takeover.
- Repaired full suite: 308 passed, 1 Windows-only skip, zero failures.
- Focused lifecycle/publication: 11 passed, 1 Windows-only skip.

Historical PR #98 AgentOS Tests run 34429872984 passed. Its Windows job
102722897996 ran 9 passing tests with 1 skipped on synthetic merge
`1b7ffea372882dcd85b28b0bbe26abbbf4e6ba86`, not standalone head 84fa347.
That evidence does not certify this repair or physical console behavior.
Fresh Windows CI and physical Ctrl+C/restart acceptance remain required.
No merge, approval, ready transition, rebase, deployment or production autonomy.
