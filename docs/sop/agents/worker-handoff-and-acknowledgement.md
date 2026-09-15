# SOP-AGENT-002 — Worker Handoff, Acknowledgement and Return

**Status:** DRAFT / REVIEW REQUIRED  
**Last verified:** 2026-09-15

## Purpose
Prevent portfolio work from being lost, duplicated, falsely credited or detached from authority/evidence during transfer between Overseers and workers.

## Outbound handoff minimum
Record: canonical mission/task ID; assigning Overseer; worker identity; objective; scope/exclusions; repo/branch/exact head or evidence source; authority/approval boundary; required inputs; required output; evidence/receipt requirements; acceptance criteria; dependencies/blockers; protected actions; return destination.

## Acknowledgement
A durable acknowledgement must demonstrate that the intended worker consumed the handoff. Transport delivery, API acceptance, queue insertion or task ID creation alone is not worker acknowledgement.

Status progression should distinguish `ASSIGNED`, `ACKNOWLEDGED`, `ACTIVE`, `BLOCKED`, `RETURNED`, `VERIFIED` and assurance states. Do not collapse them into `DONE`.

## Return packet
Worker return should include exact task/mission identity, work actually performed, evidence reviewed/created, files/records changed, tests/checks, unresolved UNKNOWNs, deviations from scope, external side effects, exact head/version where relevant and recommended next bounded action.

## Reconciliation
The receiving Overseer verifies correlation and evidence before crediting completion. Stale returns, mismatched IDs/heads, missing evidence or uncertain side effects are reconciliation failures, not success.

## No impersonation
One Overseer must not manufacture another worker's acknowledgement or independent assurance. It may record that acknowledgement is missing and keep communication AMBER.