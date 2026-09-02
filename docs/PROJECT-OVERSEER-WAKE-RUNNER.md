# Project Overseer Wake Runner

## Architecture

GitHub Actions is a **trigger source/clock**, not the AgentOS scheduler or execution authority. Manual and scheduled test invocations enter the same governed `runGitHubWakeCycle()` contract.

```text
manual or scheduled trigger
        ↓
canonical governed wake contract
        ↓
authority → lease → idempotency
        ↓
governed Project Overseer dispatch
        ↓
registered worker
        ↓
verification + durable evidence
```

The scheduler must not grow a second execution path. A different trigger source may call the same wake contract.

## Safety boundary

- The hosted scheduler test is test-only.
- Repository contents remain read-only; issue-write permission is limited to designated test evidence.
- No production credentials or production task writes are used.
- Concurrency prevents overlapping scheduled runs from being cancelled.
- Runtime execution is bounded.
- Actual repository mutations remain behind separately authorised execution paths.

## Evidence boundary

A successful scheduled run proves:

1. the scheduled trigger fired;
2. the canonical governed wake contract executed;
3. authority, lease and idempotency controls were exercised;
4. the registered test worker completed the bounded task;
5. task/wake-trace correlation and worker provenance were verified.

It does **not** prove that an installed local AgentOS process was independently awakened by GitHub Actions, nor that real portfolio tasks were executed.

For installed local AgentOS, the eventual scheduler should run on the installed host (or another explicitly authorised runner) and invoke the same wake contract rather than introducing a second dispatch implementation. No public production endpoint or credential should be introduced merely to make the scheduler test green.

## Current verification state

Fresh repository/CI evidence is available for the governed wake suite: Project Overseer Wake run `33656373008` completed successfully on 2026-09-02. Its `wake` job completed 23 tests with 23 passing and 0 failing. The run executed the deterministic wake verification suite from commit `11cdb207eb3d4659e62c7f6a990ee4d26770d313`.

This is repository/CI verification, not installed-host verification and not proof of an independent scheduled workflow run.

The scheduler workflow has been refactored so a scheduled invocation performs the complete test chain in one invocation rather than depending on multiple cron ticks. The current scheduler workflow itself has not yet produced fresh post-refactor scheduled-run evidence through the available GitHub control surface. That remains an explicit evidence gap rather than a claimed failure.

## Promotion gate

Do not add production write permissions, external-provider execution or production autonomy until deterministic tests, authority, lease/idempotency, audit, rollback and independent assurance controls are present and a separately authorised runtime boundary exists.
