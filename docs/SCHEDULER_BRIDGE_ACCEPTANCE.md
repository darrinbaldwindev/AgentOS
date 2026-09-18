# AgentOS Scheduler Bridge Acceptance

## Purpose

The scheduler is a clock, not the worker. The acceptance target is:

`Windows Task Scheduler -> scheduler-tick.mjs -> governed local-wake -> registered worker -> durable local evidence`

ChatGPT schedules, GitHub Actions, registration success, or a Task Scheduler `Ready` state are not evidence of installed Windows runtime execution.

This packet is **software-side preparation only**. Commands that install/register/enable/run/disable/unregister the task, UAC/elevation, and all execution on an owner device are physical-Windows owner gates. Do not simulate them in CI and do not infer them from repository state.

## Promotion gates

Bind the packet to one immutable candidate. A changed AgentOS head invalidates predecessor functional/security/PRS evidence unless the evidence explicitly covers the successor.

Required order for the unchanged candidate:

1. exact-head Ubuntu + Windows CI;
2. independent Jess functional PASS;
3. independent Michael security PASS;
4. PRS/Henry challenge on the identical head;
5. owner physical-Windows acceptance using this packet where the preceding software gates permit it.

None of these gates may self-promote Green, security, PRS, authority, or overall readiness.

## Safe defaults

- AgentOS must remain `DRY_RUN`.
- `autonomyEnabled` must remain `false`.
- No production credentials or production writes are permitted.
- The Windows registration script registers disabled unless `-Enable` is explicitly supplied.
- The scheduled principal is the current user, `RunLevel Limited`; the task action is not an elevation mechanism.
- Registration itself currently requires an elevated PowerShell session and is therefore an explicit owner/UAC gate.
- The bridge performs one bounded wake per scheduler invocation.
- Task Scheduler is configured with `MultipleInstances IgnoreNew`; overlap denial must still be evidenced on the physical candidate rather than assumed from configuration.
- Project-file mutation remains disabled/blocked until SG-08 continuous ownership is independently satisfied.

## Evidence workspace

Open PowerShell in the exact AgentOS checkout that will be tested. Run one command at a time and retain the output of each command with the acceptance record.

### 1. Bind exact code identity

```powershell
git rev-parse HEAD
```

Record the full SHA as `candidate_head`. Stop if it differs from the head that passed the required unchanged-head gates.

```powershell
(Get-Location).Path
```

Record this as `installation_source_root`.

```powershell
node --version
```

Require Node.js 22+.

### 2. Install local state without enabling scheduling

```powershell
npm run install:local
```

Record the resolved AgentOS home reported by installation. The expected default is `$HOME\.agentos`; do not assume the default if the command reports another root.

```powershell
npm run doctor:local
```

Require the repository's doctor to pass before scheduler registration. A doctor PASS is a prerequisite only; it is not Green/security/PRS or physical scheduler acceptance.

```powershell
Get-Content -Raw "$HOME\.agentos\config.json"
```

Before proceeding on the default install root, independently confirm `mode` is `DRY_RUN` and `autonomyEnabled` is `false`. If a non-default root was installed, substitute that exact recorded root in all remaining commands.

## Disabled-by-default registration

The next command is an **owner/UAC action** and must be run from an elevated PowerShell session on the physical Windows acceptance host. It registers the task but does not enable it.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows-scheduler.ps1 -IntervalMinutes 5
```

Require the returned JSON to report `status: REGISTERED`, `intervalMinutes: 5`, safe config values, the exact intended entrypoint/root, and `enabled: false`.

```powershell
Get-ScheduledTask -TaskName 'AgentOS Local Scheduler' | Select-Object TaskName,State
```

Require `State` to be `Disabled`. If it is not disabled, stop and preserve evidence.

## Pre-enable evidence baseline

```powershell
$Runs = "$HOME\.agentos\state\scheduler-runs.jsonl"; if (Test-Path $Runs) { Get-Content $Runs | Select-Object -Last 5 } else { 'NO_SCHEDULER_RUNS_YET' }
```

Record the last existing record (if any) so new physical ticks cannot be confused with stale evidence.

```powershell
Get-ScheduledTaskInfo -TaskName 'AgentOS Local Scheduler' | Select-Object LastRunTime,LastTaskResult,NextRunTime
```

Record this baseline too.

## Explicit first enablement

Do not perform this step until the unchanged candidate has reached the applicable independent gates listed above. Re-running the installer with `-Enable` is an explicit owner/UAC action.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-windows-scheduler.ps1 -IntervalMinutes 5 -Enable
```

Confirm the returned JSON still reports `DRY_RUN`, `autonomyEnabled: false`, interval 5, exact root/entrypoint, and `enabled: true`.

## Two-consecutive-tick acceptance

Do not manufacture records or invoke `scheduler-tick.mjs` manually as a substitute for Task Scheduler evidence. Allow the physical task to produce at least two new scheduler invocations at the configured cadence.

After each expected tick, run:

```powershell
Get-Content "$HOME\.agentos\state\scheduler-runs.jsonl" | Select-Object -Last 2
```

For an admitted task, each accepted `COMPLETED` record must contain and preserve exact correlation for the available canonical fields:

- `delivery_id` when remote-bridge delivery supplied the task;
- unique `task_id`;
- `mission_id`;
- unique `wake_trace_id`;
- `source_agent` / `worker_id`;
- `started_at` and `completed_at`;
- durable `evidence` entries.

A `NO_REMOTE_TASK` record proves only that a scheduler process reached the no-work path; it is not an admitted-task round-trip PASS. A `FAILED` record is failure evidence, not acceptance.

Then independently reconcile each accepted record against persistent AgentOS task/mission/worker/receipt artifacts. Missing, stale, contradictory, or cross-spliced correlation is fail-closed/UNKNOWN and cannot be called success.

## Overlap / duplicate denial

The registered task uses `MultipleInstances IgnoreNew`. During physical acceptance, preserve evidence that two scheduler invocations do not create two successful executions for the same canonical task/delivery identity. Do not alter runtime timing or introduce a synthetic success to force overlap.

Inspect scheduler history/state:

```powershell
Get-ScheduledTaskInfo -TaskName 'AgentOS Local Scheduler' | Select-Object LastRunTime,LastTaskResult,NextRunTime
```

Then inspect the newest durable records:

```powershell
Get-Content "$HOME\.agentos\state\scheduler-runs.jsonl" | Select-Object -Last 5
```

Any duplicate successful task/delivery identity, conflicting correlation, or success without a matching durable receipt fails acceptance.

## Restart continuity

A reboot/restart is an owner physical action. Before restart, capture:

```powershell
Get-ScheduledTask -TaskName 'AgentOS Local Scheduler' | Select-Object TaskName,State
```

```powershell
Get-ScheduledTaskInfo -TaskName 'AgentOS Local Scheduler' | Select-Object LastRunTime,LastTaskResult,NextRunTime
```

After the owner restarts Windows, repeat those two commands and then inspect new durable scheduler evidence:

```powershell
Get-Content "$HOME\.agentos\state\scheduler-runs.jsonl" | Select-Object -Last 5
```

Acceptance requires continuity without replaying a completed canonical task/delivery, without treating stale/interrupted state as success, and without losing exact task/mission/wake/worker/receipt correlation.

## Interrupted / stale-state handling

If the task, host, or AgentOS process is interrupted, preserve the exact scheduler record and AgentOS state before repair. `FAILED`, `BLOCKED`, `RECOVERY_REQUIRED`, missing receipt, missing provenance, or unverifiable durability must remain non-success. Do not delete state merely to obtain a clean rerun.

Project-file mutation acceptance is a separate later gate. Until SG-08 is satisfied, no scheduler evidence authorizes controlled file mutation.

## Diagnostics

If the scheduled task fires but `scheduler-runs.jsonl` is unchanged, the scheduler-to-process boundary failed. Capture:

```powershell
Get-ScheduledTask -TaskName 'AgentOS Local Scheduler' | Format-List *
```

```powershell
Get-ScheduledTaskInfo -TaskName 'AgentOS Local Scheduler' | Format-List *
```

```powershell
npm run doctor:local
```

If a record exists with `status: FAILED`, preserve its exact error and repair only the smallest evidenced boundary. If a record says `COMPLETED` but task/trace/mission/worker/receipt provenance cannot be reconciled in persistent AgentOS state, the result is not accepted.

## Stop / rollback

Disable first; do not delete evidence as part of rollback.

```powershell
Disable-ScheduledTask -TaskName 'AgentOS Local Scheduler'
```

Verify it is disabled:

```powershell
Get-ScheduledTask -TaskName 'AgentOS Local Scheduler' | Select-Object TaskName,State
```

Preserve the acceptance evidence and installed AgentOS state before unregistering the scheduler.

## Scheduler uninstall

Unregistering is an owner/UAC action and removes only the scheduled task; it is not proof that all AgentOS installation artifacts have been removed.

```powershell
Unregister-ScheduledTask -TaskName 'AgentOS Local Scheduler' -Confirm:$false
```

Verify task absence:

```powershell
Get-ScheduledTask -TaskName 'AgentOS Local Scheduler' -ErrorAction SilentlyContinue
```

Require no task result. Also check for an unexpected running scheduler process or orphaned task/service using normal Windows inspection before declaring scheduler cleanup complete. Do not delete `$HOME\.agentos` automatically: it contains evidence/state that may be required for recovery or assurance.

A complete product installer/update/rollback/uninstall mechanism is a later packaging deliverable. This scheduler cleanup procedure must not be described as full AgentOS uninstall.

## Acceptance disposition

Physical acceptance for this packet is PASS only when all applicable unchanged-head gates are satisfied and the owner-produced evidence demonstrates:

- exact candidate head and installation root;
- safe/default-disabled registration;
- explicit owner enablement;
- two consecutive real scheduler ticks for an admitted bounded task where such a fixture is authorized;
- exact task -> mission -> wake -> worker -> durable receipt correlation;
- restart continuity;
- duplicate/overlap denial;
- interrupted/stale state remains fail-closed;
- bounded PowerShell operation remains within the governed operation catalogue;
- rollback/disable and scheduler unregister are clean and evidence-preserving.

Anything missing remains BLOCKED/UNKNOWN. Do not advance to production autonomy based on repository code, scheduler acknowledgement, hosted CI, or partial physical evidence.
