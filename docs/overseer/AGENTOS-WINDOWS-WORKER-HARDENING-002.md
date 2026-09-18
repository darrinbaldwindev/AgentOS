# AGENTOS-WINDOWS-WORKER-HARDENING-002

## Mission

Close the bounded Windows worker path-containment hardening gates on PR #104 without wiring `runtime/local-wake.mjs`, enabling scheduler pickup, broadening the PowerShell surface, or changing governance authority.

## Evidence chain

- PR: #104 `feat(local): stage governed PowerShell Windows worker on remote-bridge lineage`
- Branch: `agent/overseer/windows-worker-bridge`
- Base lineage SHA: `5cc27c96d48e18419cc678fd03b37c9e1c7ccd70`
- 002B start head: `8f1d1bd4f8a2031adcdbf44b2d1140ab1b5d8fea`
- 002B code commit: `397769d338e21a2749da18a7c8426d53f157d6b9`
- 002B test commit / exact tested head: `313805a76e8b02159ceef734d2ff3afc9e8d5136`

## Files changed in 002B

- `runtime/windows-powershell-adapter.mjs`
- `tests/windows-powershell-adapter.test.mjs`

No `runtime/local-wake.mjs` change was made in this slice.

## Canonical path containment

The adapter continues to canonicalize filesystem paths through the existing injected `pathResolver`, whose production default is `realpathSync.native`.

002B adds two hardening properties:

1. Every configured allowed root must canonicalize successfully. Any configured root canonicalization failure now fails the adapter closed with `POWERSHELL_ALLOWED_ROOT_CANONICALIZATION_FAILED`; an invalid security root is not silently ignored.
2. Path semantics are injectable through `pathModule`. Production defaults to the host Node `path` module; deterministic tests use `path.win32` so Windows drive, case, prefix-collision, and cross-drive behavior can be exercised on non-Windows CI.

Containment remains based on canonical target/root paths plus `relative`/`isAbsolute`, not lexical input strings alone.

## Deterministic Win32 regression coverage

Added tests prove:

- exact approved root is accepted;
- case-insensitive child path is accepted under `path.win32` semantics;
- `C:\\AgentOS2` is not treated as contained by `C:\\AgentOS`;
- a `D:\\outside` target is rejected for a `C:\\AgentOS` root;
- a lexical `C:\\AgentOS\\linked` path whose canonical resolver returns `D:\\outside` is rejected before executor invocation;
- an unresolvable configured allowed root fails closed before executor invocation even when another configured root would otherwise contain the target.

The Win32 resolver fixture performs case-insensitive lookup so the case-folding test measures path semantics rather than mock-map string casing.

## Governance boundary

No governance subsystem was added to the PowerShell adapter.

The adapter remains a bounded capability/execution adapter downstream of the existing governed execution boundary. It does not grant authority, consent, policy, risk, budget, approval, Green, PRS, or completion status.

The fixed operation catalogue remains unchanged:

- `repo.status`
- `repo.diff`
- `test.run`
- `audit.run`
- `process.list`
- `service.list`

## CI evidence

Exact-head GitHub Actions evidence for `313805a76e8b02159ceef734d2ff3afc9e8d5136`:

- Workflow: `AgentOS Tests`
- Run ID: `34566073414`
- Run number: `648`
- Conclusion: `success`

No separate host-shell `npm audit --audit-level=high --omit=dev` receipt was produced by this execution environment for 002B, so no audit success is claimed here.

## Physical Windows boundary

Physical Windows execution is **NOT PROVEN** by this mission slice.

`path.win32` and injected canonicalization tests are deterministic cross-platform assurance only. Actual Windows junction/reparse behavior, physical executable discovery, filesystem write behavior, process execution, and laptop acceptance remain separate hardware/runtime evidence gates.

## Remaining blockers before runtime pickup

- independent assurance review of exact-head 002B evidence;
- real host capability probe backing / physical Windows evidence;
- replacement of synthetic local-wake capability eligibility using canonical capability evidence;
- bounded DRY_RUN pickup wiring only after the preceding gates pass;
- duplicate/crash/result-write/Green-failure adversarial challenge;
- physical Windows laptop acceptance.

## Classification

`WINDOWS-WORKER-HARDENING-PASS-CANDIDATE`

This is an implementation candidate classification only. It is not independent assurance PASS and is not overall AgentOS GREEN.

No merge, ready transition, rebase, deployment, credential change, production write, unrestricted shell, or production autonomy was performed or authorized by this mission.
