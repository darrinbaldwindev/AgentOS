# Overseer Review Log

## Repository

`darrinbaldwindev/AgentOS`

## Purpose

A local-first, multi-model AI-agent operating-system initiative. The main planning materials describe privacy-aware local operation, a Tauri/Svelte/Rust architecture, deterministic mocks, MCP-oriented tooling, and opt-in referral concepts subject to owner control.

## Last scan

2026-08-23T12:51:18Z

## Scan scope

Initial read-only review of `main` at `86a9287`, the `active-dashboard` branch at `bb3cd59`, the AgentOS handover, coordination charter, autonomous progress log, branch divergence, open GitHub issues and pull requests, and a non-invasive credential-pattern path check. This was not a runtime, security, deployment, provider-integration, privacy-certification, or release-readiness audit.

## Status

**AMBER — ATTENTION REQUIRED**

## Executive summary

AgentOS has strong documented boundaries around credentials, provider activation, affiliate behavior, scheduling, deployment, and owner authority. Its main repository branch is a planning/prototype and governed-local-mock stream, while `active-dashboard` contains a materially different, recently updated full-stack dashboard baseline. The separation is documented but creates a material discoverability and source-of-truth risk for contributors who use only the default branch.

No high-confidence credential-pattern file paths were returned by the scoped initial check. This is a limited observation only and does not constitute a complete security audit.

## Open findings

### OVERSEER-20260823-001

- **Severity:** MEDIUM
- **Area:** architecture
- **Finding:** `main` and `active-dashboard` represent materially different AgentOS baselines. `main` contains planning records, local contract/mocking artifacts, and governance files, while `active-dashboard` contains the current full-stack dashboard source and removes or relocates many planning-stream artifacts.
- **Evidence:** `AGENTOS_HANDOVER.md` describes the handover/planning model and records a specification-first repository. The branch comparison shows `active-dashboard` at `bb3cd59` adds client/server/database application source while deleting or superseding numerous `main` planning artifacts. `agents/AGENTOS_SHARED_RECORDS.md` on `active-dashboard` identifies that branch’s dashboard as the active repository for role work.
- **Why it matters:** A contributor or automation acting from default `main` can study or modify a different baseline from the one described as active, increasing the risk of duplicated effort, missed fixes, or misleading validation claims.
- **Recommendation:** Darrin and the AgentOS coordinator should publish and maintain one concise, versioned branch-role map in both contexts: which branch is canonical for implementation, which is historical/planning evidence, how shared records are located, and what merge or synchronization policy applies. Do not merge histories or relocate archives without an explicit owner-approved plan.
- **Suggested owner:** Darrin / AgentOS Primary Coordinator
- **Status:** NEEDS DECISION
- **Confidence:** HIGH

### OVERSEER-20260823-002

- **Severity:** MEDIUM
- **Area:** operations
- **Finding:** The active-dashboard branch points its autonomous backlog, progress log, and role protocol to external shared-project paths rather than versioned records within the branch.
- **Evidence:** `active-dashboard:agents/AGENTOS_SHARED_RECORDS.md` lists the shared canonical locations and instructs roles not to create a repository-local mirror. The same document says the old isolated worktree is historical reference only.
- **Why it matters:** A clean GitHub clone of the active branch does not by itself provide the mutable coordination context required for governed autonomous work. Recovery, onboarding, and review depend on external project-record availability and a documented access model.
- **Recommendation:** Preserve the current no-mirror rule if it remains owner-approved, but add a repository-safe, non-sensitive recovery pointer that identifies the access preflight, expected unavailable-state behavior, and owner escalation path. Verify it from a fresh clone without exposing project-file content, credentials, or private records.
- **Suggested owner:** AgentOS Primary Coordinator
- **Status:** OPEN
- **Confidence:** HIGH

### OVERSEER-20260823-003

- **Severity:** LOW
- **Area:** documentation
- **Finding:** The root `README.md` on `main` is only a repository title, while the handover and coordination documents carry the actual purpose, architecture, and status information.
- **Evidence:** `README.md` contains only the project title; `AGENTOS_HANDOVER.md` and `PROJECT_COORDINATION_CHARTER.md` provide the substantive project description and governance rules.
- **Why it matters:** New reviewers are more likely to classify the repository incorrectly or miss the branch-role distinction before reaching the authoritative documentation.
- **Recommendation:** After the owner decides the canonical implementation branch, add a short, non-duplicative root README orientation with links to the authoritative handover, branch-role map, and governance charter.
- **Suggested owner:** AgentOS Primary Coordinator
- **Status:** OPEN
- **Confidence:** HIGH

## Cross-repository observations

AgentOS is not evidenced as a runtime dependency of Franchise or GemVerse. Its governance mechanisms—owner-gated external actions, append-only evidence, explicit mock-versus-live boundaries, and prohibition on secret persistence—are reusable process patterns, not evidence for a shared codebase or integration.

The same source-of-truth concern appears in different forms elsewhere in the portfolio: Franchise is awaiting controlled integration of a managed workspace, while AgentOS separates planning and active implementation across branches. A portfolio-level branch-role convention would reduce ambiguity without forcing common implementation technology.

## Decisions required

1. **Darrin:** Confirm the intended canonical role of `main` and `active-dashboard`, including whether `active-dashboard` should remain the active implementation baseline and how it will be kept discoverable.
2. **Darrin / AgentOS Primary Coordinator:** Approve the safe recovery/onboarding contract for actors who have a GitHub clone but do not have access to shared project records.

## Resolved since last scan

None. This is the initial Overseer record.

## Areas reviewed

Repository identity and branches; handover and coordination charter; autonomous progress evidence; main-versus-active branch scope; open issues and pull requests; and a limited credential-pattern path check.

## Repository/commit state reviewed

`main` at `86a92877f35fe47102856713a910a329675c2c4d`; `active-dashboard` at `bb3cd59dac6f7e47635ada09fd4a3fc3cf1a0d79`.

## Handoff acknowledgement

The Overseer handoff specification was read. The read-only boundary is understood: this agent may modify only `docs/overseer/OVERSEER.md` in each authorized repository and may not alter application code, configuration, CI/CD, migrations, continuity records, business rules, production data, or other agent logs.

Accessible repositories for this scan were `darrinbaldwindev/Franchise`, `darrinbaldwindev/repo`, `darrinbaldwindev/manus`, and `darrinbaldwindev/AgentOS`. No repository in that authorized set was inaccessible. Darrin remains the final authority.

## Next review

A lightweight read-only change scan should occur daily, with a deeper cross-repository review weekly and an additional scan after major merges, architecture changes, or explicit owner requests. No background schedule is configured by this record.

> This review log is evidence-based governance documentation. It is not proof of runtime, security, privacy, production, legal, financial, or release readiness.

## Follow-up review-request status — 2026-08-23T13:07:55Z

The initial Overseer-log pull request, [AgentOS PR #1](https://github.com/darrinbaldwindev/AgentOS/pull/1), remains **OPEN**, non-draft, and `CLEAN` for merge at head `49a3f231ead6fe7c390a80c84ce5bcd33ee05590` against base `86a92877f35fe47102856713a910a329675c2c4d`. At the time of this check it had no review decision, reviews, or comments.

The request remains documentation-only and changes only `docs/overseer/OVERSEER.md`. No AgentOS application code, configuration, CI/CD, migrations, task/continuity records, provider behavior, schedule, deployment, data, or external integration was changed by this status check.

## Follow-up testability review — 2026-08-24T06:43:44Z

A new [AgentOS PR #3 — CORE-002: add deterministic local test runner](https://github.com/darrinbaldwindev/AgentOS/pull/3) is open at `468b4e128c4fb00ced0ff0b601639a6e50ce7e8a`, is non-draft and `CLEAN`, and changes five files: a local Node test runner, direct runner coverage, an updated recovery-event status assertion, a bounded task record, and a TODO record. Static inspection shows that the runner discovers `tests/*.test.mjs`, sorts the list, executes each file sequentially with the current Node executable, aggregates nonzero child statuses, and rejects an empty suite. The updated recovery-event assertion names the full allowlist, including `recovered`, rather than retaining a stale fixed count.

No GitHub checks or review records are currently reported for PR #3. The task record claims that all 18 deterministic test files passed, but this Overseer follow-up did not execute untrusted repository code and therefore cannot independently verify that claim. The material decision is whether to authorize a narrow review/merge path based on reproducible local evidence, or require additional independent validation and/or a separately approved CI check. `CLEAN` mergeability is not evidence of the claimed test result, integration coverage, provider safety, deployment readiness, or production behavior.

A draft governance notification template was prepared inside Manus only. No test-runner code, test, branch, pull request, provider, credential, deployment, or external communication was changed by this record.
