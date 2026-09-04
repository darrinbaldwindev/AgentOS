# AgentOS Runtime Acceptance Gate v0.1

**Status:** OPEN — evidence capture required before launch GREEN
**Date:** 2026-09-05
**Purpose:** Provide a deterministic, operator-executable acceptance record for the remaining clean-machine runtime gate without changing runtime architecture, scheduler state, provider credentials, deployment authority, or billing.

## Gate boundary

This document is an acceptance checklist, not an implementation of a new runtime, scheduler, router, ledger, or assurance system. A completed checklist is evidence only; it does not authorize production launch.

## Preconditions

- [ ] Test is performed on a clean Windows machine or clean Windows environment representative of the supported target.
- [ ] Exact Git commit SHA under test is recorded.
- [ ] Test operator and capture date/time are recorded.
- [ ] No production credentials, billing accounts, or live-provider secrets are required for the baseline gate.
- [ ] Existing AgentOS scheduler remains paused unless separately authorized.

## Acceptance sequence

### 1. Install

- [ ] Obtain the exact build/package associated with the tested commit.
- [ ] Install on the clean Windows environment.
- [ ] Record installer/build identifier and any installer errors.
- [ ] Result: PASS / FAIL / BLOCKED.

### 2. Doctor / health check

- [ ] Run the repository's documented health/doctor command, if present.
- [ ] Capture stdout/stderr and exit status.
- [ ] Record missing dependencies, permissions, or configuration failures.
- [ ] Result: PASS / FAIL / BLOCKED.

### 3. Boot / startup

- [ ] Launch AgentOS from the installed state.
- [ ] Confirm the application reaches its expected usable startup state.
- [ ] Capture startup errors and relevant logs.
- [ ] Result: PASS / FAIL / BLOCKED.

### 4. Wake / core operation

- [ ] Exercise the supported local wake/start path using the repository's documented operator procedure.
- [ ] Confirm the expected service/agent lifecycle response without enabling production providers or credentials.
- [ ] Capture observable result and logs.
- [ ] Result: PASS / FAIL / BLOCKED.

### 5. Restart / persistence

- [ ] Close/restart the application using the normal supported procedure.
- [ ] Confirm required local state persists according to documented expectations.
- [ ] Confirm restart does not silently enable a paused scheduler or production authority.
- [ ] Capture observable result and logs.
- [ ] Result: PASS / FAIL / BLOCKED.

## Evidence record

Record one row per gate step:

| Step | Exact command/action | Commit/build | Result | Evidence location | Operator | Date/time | Notes |
|---|---|---|---|---|---|---|---|
| Install | | | | | | | |
| Doctor | | | | | | | |
| Boot | | | | | | | |
| Wake | | | | | | | |
| Restart/persistence | | | | | | | |

## Disposition rules

- **GREEN for this gate** requires every required step to have reproducible PASS evidence on the same tested build/commit.
- **AMBER** applies when a required step is untested, evidence is incomplete, or the environment differs materially from the supported target.
- **RED** applies when a required step reproducibly fails.
- Do not infer PASS from implementation claims, source inspection, or another operating system.
- Do not convert a blocked clean-machine test into GREEN by substituting a different environment.

## Current state

**AMBER / OPEN.** The GitHub repository connector can inspect and modify repository contents but cannot substitute for a clean Windows operator environment for this acceptance gate. No runtime acceptance claim is made by this document.

## Governance

This gate is subordinate to repository review/merge governance and the AgentOS launch plan. It does not authorize merging PRs, enabling schedules, activating providers, adding credentials, charging users, or deploying production artifacts.
