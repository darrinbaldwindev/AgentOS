# SOP-PORT-001 — Repository Intake and Reconciliation

**Status:** DRAFT  
**Last verified:** 2026-09-15

## Purpose
Establish what a repository actually contains before planning, documenting or assigning work.

## Procedure
1. Confirm canonical repository and default branch.
2. Record current head/revision.
3. Inventory top-level structure, docs, tests, tools, workflows and Overseer/control files.
4. Read README, current decisions, architecture, handoff/checkpoint and active mission material.
5. Inspect relevant open PRs/issues and exact heads.
6. Identify sources of truth and competing/stale documents.
7. Search before creating new architecture, control or documentation artifacts.
8. Classify important claims as proven, implementation-advanced, product direction, unknown or blocked.
9. Record dependencies on other repositories/systems.
10. Identify protected actions and production boundaries.
11. Produce a bounded next-action list.
12. Post-scan after substantive work and update the durable checkpoint.

## Rules
Repository name, old README text, branch name, issue assignment or worker report is not sufficient proof of current behavior. Fresh code/runtime/test/evidence outranks dated prose. Contradictions must be surfaced, not silently harmonised.