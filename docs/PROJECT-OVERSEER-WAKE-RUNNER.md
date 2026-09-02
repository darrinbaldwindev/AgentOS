# Project Overseer Wake Runner

The scheduled workflow is a trigger source for the Project Overseer wake path. The scheduler supplies the clock; it is not a second execution architecture.

## Canonical trigger model

Manual and scheduled test invocations enter the same governed GitHub wake contract (`runGitHubWakeCycle`). The scheduled workflow checks out AgentOS and invokes `scripts/scheduled-wake-test.mjs`, which creates a test task and executes the canonical wake contract. This keeps scheduler timing separate from dispatch correctness.

```text
manual or scheduled trigger
          ↓
   canonical wake contract
          ↓
 authority + lease + idempotency
          ↓
      governed dispatch
          ↓
     registered worker
          ↓
 verification + durable response
```

## Safety boundary

- The workflow is read-only for repository contents (`contents: read`) and has only the issue-write permission required for test evidence.
- The test worker is deterministic and test-only.
- No production credentials or production task writes are used.
- A concurrency group prevents overlapping scheduled runs from being cancelled.
- The runtime timeout bounds execution.
- Actual repository mutations remain behind separately authorised execution paths.

## Evidence boundary

A successful scheduled run proves that GitHub's scheduler can trigger the canonical governed GitHub wake contract in the hosted test environment. It does **not** prove that an installed local AgentOS process was independently awakened by GitHub, nor that real portfolio tasks were executed.

For installed local AgentOS, the eventual scheduler should run on the installed host (or another explicitly authorised runner) and invoke the same wake contract rather than introducing a second dispatch implementation.

## Promotion gate

Do not add production write permissions or external-provider execution until the deterministic suite is green and the required authority, lease/idempotency, audit, rollback and independent assurance controls are present.
