# SOP-EVID-001 — Execution, Evidence, Green and PRS

**Owner:** SOP Overseer  
**Status:** DRAFT  
**Version:** 0.1.0  
**Last verified:** 2026-09-15  
**Audience:** users, operators, developers, reviewers

## Purpose

Keep four trust states separate:

`something ran -> evidence exists -> Green verified -> PRS assured`

Later states must not be inferred from earlier ones.

## State model

### 1. Execution
A worker/tool reports or records that it attempted/completed work. This is not independent verification.

### 2. Evidence
Durable records describe the action, identities, outputs, tests, receipts or side effects. Evidence can be missing, stale, malformed, incomplete or incorrectly correlated.

### 3. Green
Green independently evaluates the relevant acceptance criteria and evidence. Worker self-report cannot award Green. A bounded Green PASS applies only to the exact scope/head/evidence it reviewed unless explicitly revalidated.

### 4. PRS
PRS independently assures relevant execution/verification semantics, especially false-GREEN risks. PRS does not execute the project work it assures. PRS PASS must not be synthesized from Green PASS or CI success.

## User-facing presentation

Simple mode may summarize these states in plain language, but must preserve their distinction. Essentials should expose the meaningful status/evidence boundary. Tech Head may expose exact task/mission/worker/result IDs, receipt identity, head/commit and assurance details where available.

A user should be able to answer:

- What did AgentOS attempt?
- What evidence proves what happened?
- Has Green independently verified it?
- Has PRS independently assured it where required?
- What remains unknown or blocked?

## Fail-closed rules

Do not present completion-grade trust when:

- task/mission/worker/result correlation conflicts;
- a required receipt is missing;
- evidence belongs to another commit/head or stale run;
- verification was interrupted or failed;
- a worker verified its own success where independent review is required;
- Green is absent/failed for a gated completion;
- PRS is required but absent/failed;
- recovery state is unresolved.

## Current Level 2 boundary

PR #104 remains draft/unmerged and project-file mutation remains blocked. Cross-platform CI success for a branch is useful evidence but does not close continuous ownership, physical Windows acceptance, authenticated authority binding, Green or PRS gates. Documentation must preserve those blockers.

## Evidence dependencies

- `docs/AGENTOS_GOVERNANCE_LAYER.md`
- mission ledger / completion gate lineages (#74, #76, #82, #84, #87, #91, #94, #101, #104)
- current Green findings
- current PRS findings
- Overseer #49 completion rule
