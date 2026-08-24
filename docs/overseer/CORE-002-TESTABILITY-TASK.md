# CORE-002 Bounded Testability Task

**Status:** `VERIFIED — OPEN FOR OWNER REVIEW`  
**Executor:** AgentOS Overseer  
**Branch:** `agent/overseer/core-002-testability`

## Objective

Make the current deterministic CORE-002 prototype reliably runnable from one local command, beginning with the only observed baseline failure: `tests/recovery-events.test.mjs` expects ten safe statuses while the current allowlisted recovery schema has eleven, including the `recovered` state required by the provider-handoff vertical slice.

## Permitted scope

Only `package.json` if needed for a local script, `scripts/`, the failing recovery-event test, new direct test-runner coverage, and this task record may change.

## Acceptance criteria

1. A documented local command runs every deterministic `tests/*.test.mjs` file sequentially and returns nonzero when one fails.
2. The recovery-event test checks the actual approved status contract, including `recovered`, without weakening privacy exclusions or validation checks.
3. The complete deterministic suite passes from the new command.
4. No provider call, credential use, affiliate action, GitHub mutation, workspace mutation, deployment, or production behavior is introduced.

## Local test command

Run `node scripts/run-tests.mjs` from the repository root. It discovers and executes every `tests/*.test.mjs` file sequentially and exits nonzero if any test fails.

## Verification result

The command completed successfully against all 18 deterministic test files. The recovery-event test now asserts the full current allowlist, including the `recovered` state consumed by the provider-handoff proof. The runner’s direct test covers sorted discovery, all-success aggregation, failure aggregation, and empty-suite rejection.

## Review handoff

Pull request: [#3 — CORE-002: add deterministic local test runner](https://github.com/darrinbaldwindev/AgentOS/pull/3). It is intentionally open for owner review and has not been merged into `main`.

## Owner gate

Opening a review pull request is permitted. Merging, external connectivity, provider activation, and any broader runtime expansion remain owner-gated.
