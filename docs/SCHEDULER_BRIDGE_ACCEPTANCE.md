# AgentOS Scheduler Bridge Acceptance

## Purpose

The scheduler is a clock, not the worker. The acceptance target is:

`Windows Task Scheduler -> scheduler-tick.mjs -> governed local-wake -> registered worker -> durable local evidence`

ChatGPT schedules and GitHub Actions are not evidence of installed Windows runtime execution.

## Safe defaults

- AgentOS must remain `DRY_RUN`.
- `autonomyEnabled` must remain `false`.
- No production credentials or production writes are permitted.
- The Windows registration script is disabled by default and does not start the task.
- The bridge performs one bounded wake per scheduler invocation.

## Installation sequence

1. Install Node.js 22+.
2. Clone the AgentOS repository.
3. Run `npm run install:local`.
4. Run `npm run doctor:local` and require `GREEN`.
5. Register the Windows scheduler in disabled mode:
   `powershell -ExecutionPolicy Bypass -File .\scripts\install-windows-scheduler.ps1`
6. Inspect the returned task state and confirm it is disabled.
7. For the first runtime acceptance test only, enable the Windows task explicitly with:
   `powershell -ExecutionPolicy Bypass -File .\scripts\install-windows-scheduler.ps1 -Enable`
8. After the task has had an opportunity to fire, inspect:
   `%USERPROFILE%\.agentos\state\scheduler-runs.jsonl`

## Acceptance evidence

A scheduler round trip passes only when a fresh record contains all of:

- `status: COMPLETED`
- unique `task_id`
- unique `wake_trace_id`
- `mission_id`
- `source_agent` / `worker_id`
- completed timestamp
- durable evidence entries

Then independently verify that the corresponding AgentOS state contains the task/response artifacts and that the correlation is exact.

## Failure handling

If the scheduled task fires but `scheduler-runs.jsonl` is unchanged, the scheduler-to-process boundary failed.

If the record exists but status is `FAILED`, preserve the exact error and repair the smallest failing boundary.

If the record says `COMPLETED` but task/trace provenance cannot be reconciled in persistent AgentOS state, the result is not accepted.

Do not advance to production autonomy based on repository code, a scheduler acknowledgement, or a hosted CI run.

## Pause / stop

To stop the Windows scheduler without changing AgentOS safety configuration:

`Disable-ScheduledTask -TaskName 'AgentOS Local Scheduler'`

To remove it after testing:

`Unregister-ScheduledTask -TaskName 'AgentOS Local Scheduler' -Confirm:$false`
