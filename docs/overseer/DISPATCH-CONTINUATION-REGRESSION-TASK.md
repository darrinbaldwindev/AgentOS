# Dispatch Continuation Regression Repair

**Status:** `VERIFIED — OPEN FOR OWNER REVIEW`  
**Executor:** AgentOS Overseer  
**Base:** `9f6fbff39a1a1465f01fb271757a9ce3f986247a` (`main` at final pre-push check)  
**Branch:** `agent/overseer/dispatch-continuation-export-fix`

## Objective

Restore the canonical continuation-runner contract so the deterministic dispatch continuation and poll tests can load and execute.

## Root cause and permitted scope

`src/dispatch/continuation-runner.mjs` imported and called `createContinuation`, but `src/dispatch/continuation.mjs` exports `deriveNextTask(completedTask, nextTask, receiver)`. The stale ESM import prevented both continuation-runner and dispatch-poll test modules from loading.

Only `src/dispatch/continuation-runner.mjs`, `tests/continuation-runner.test.mjs`, and this record may change. The source repair imports `deriveNextTask` and supplies the existing receiver argument. The regression assertion is aligned to the canonical authority-error wording while preserving the fail-closed escalation test.

## Validation

The following commands passed on the isolated branch:

1. `git diff --check`
2. `node --test tests/continuation-runner.test.mjs tests/dispatch-poll.test.mjs` — 3 passing tests.
3. `node scripts/run-tests.mjs` — passed.
4. `npm test` — 59 passing tests, 0 failures.

## Review handoff and boundaries

Pull request: [#14 — fix(dispatch): use canonical continuation derivation](https://github.com/darrinbaldwindev/AgentOS/pull/14). It is open for owner review and has not been merged into `main`.

This repair does **not** activate a dispatch runtime, scheduler, repository transport, durable persistence, worker creation, credentials, provider calls, or any additional authority. The canonical continuation function retains the existing matching-target and parent-capability-subset checks.
