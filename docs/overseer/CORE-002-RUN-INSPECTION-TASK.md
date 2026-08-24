# CORE-002 Safe Run Inspection Task

**Status:** `VERIFIED — OPEN FOR OWNER REVIEW`  
**Executor:** AgentOS Overseer  
**Branch:** `agent/overseer/core-002-run-inspection`  
**Dependencies:** PR #3 and PR #4 must merge before this branch is rebased for final review.

## Objective

Add the smallest local inspection contract needed to make the deterministic vertical slice reviewable: a compact read-only run view containing identifiers, lifecycle status, recovery state, event types, and an existing Overseer recommendation summary.

## Boundaries

The inspector reads only the existing in-memory store. It must not invoke tools or providers, modify a run, create an audit, access a real workspace, expose payload content, or contact external services.

## Acceptance criteria

Known runs return a frozen, non-secret summary. Unknown runs fail clearly. Direct tests prove omission of mission/private payload fields and no mutation of store records. The complete local deterministic suite remains green.

## Verification result

The direct inspector test passed, the local deterministic demo continued to render a recovered run, and `node scripts/run-tests.mjs` passed all 20 deterministic test files.

## Review handoff

Pull request: [#5 — CORE-002: add safe local run inspection](https://github.com/darrinbaldwindev/AgentOS/pull/5). It depends on [PR #3](https://github.com/darrinbaldwindev/AgentOS/pull/3) and [PR #4](https://github.com/darrinbaldwindev/AgentOS/pull/4). Merge those in order, rebase this branch onto the updated `main`, then review PR #5. No pull request is automatically merged by this task.
