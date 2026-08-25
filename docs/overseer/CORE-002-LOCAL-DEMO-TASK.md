# CORE-002 Local Deterministic Demo Task

**Status:** `VERIFIED — OPEN FOR OWNER REVIEW`
**Executor:** AgentOS Overseer
**Branch:** `agent/overseer/core-002-local-demo`
**Dependency:** PR #3, `CORE-002: add deterministic local test runner`, must merge before this branch can be rebased safely onto `main`.

## Objective

Create one local CLI entry point that demonstrates AgentOS’s existing deterministic vertical slice: a bounded task uses an in-memory workspace/agent/run, invokes a safe local checkpoint tool, experiences a mock-provider failure, recovers via its configured mock fallback, and emits an Overseer recommendation.

## Boundaries

The demo must use only existing in-memory contracts and deterministic mock adapters. It must not read a real workspace, use credentials, contact a provider, send a referral, mutate Git/GitHub, activate an affiliate program, or claim product-runtime readiness.

## Acceptance criteria

The command must render only a compact non-secret summary; direct tests must prove result, recovery, event, and recommendation visibility; and the full local deterministic suite must remain green.

## Local command

Run `node scripts/demo-local-mission.mjs` from the repository root. The output is a JSON summary of deterministic test state only; it omits the mission input, prompts, credentials, external destinations, referral data, and workspace contents.

## Verification result

The demo rendered a verified two-step local-mock mission with a deterministic checkpoint, primary-provider failure, fallback recovery, append-only event types, and an Overseer recommendation. `node scripts/run-tests.mjs` then passed all 19 deterministic test files.

## Review handoff

Pull request: [#4 — CORE-002: add local deterministic vertical-slice demo](https://github.com/darrinbaldwindev/AgentOS/pull/4). It depends on [PR #3](https://github.com/darrinbaldwindev/AgentOS/pull/3); merge PR #3 first, rebase this branch onto the updated `main`, then review PR #4. Neither pull request is automatically mergeable by this task.
