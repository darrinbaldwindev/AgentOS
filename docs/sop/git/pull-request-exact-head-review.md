# SOP-GIT-001 — Pull Request and Exact-Head Review

Status: DRAFT
Owner: SOP Overseer

## Core rule
Review, tests, Green and PRS evidence belong to the exact candidate they evaluated. A moved head invalidates claims that require exact-head identity until revalidated.

## Before changing a PR lineage
Fresh-fetch repository main/base, PR head, open competing PRs, relevant issues/handoffs and current CI. Do not use a remembered SHA as mutation authority.

## Change packet
Record: repository; PR; base/head branches; exact head SHA; changed paths; objective; non-goals; authority boundary; tests; CI; known failures/UNKNOWNs; recovery implications; security implications; Green status; PRS status; protected actions.

## Review rules
- worker self-review is not independent Green;
- Green is not PRS;
- CI success proves only the executed workflow scope;
- documentation-only CI does not certify runtime behavior;
- hosted Windows CI is not physical owner-Windows evidence;
- a receipt is not proof of a side effect unless the side effect is independently bound/verified;
- stale review comments/approvals cannot be silently applied to a changed head;
- contradictory evidence must remain visible and the safer interpretation controls promotion.

## Stacked/divergent PRs
State the base lineage explicitly. Never treat a stacked PR as merged main. Reconcile overlapping control-plane changes before integration; do not create duplicate scheduler/authority/ledger/persistence/assurance systems to avoid conflicts.

## Completion/promotion gate
Before any completion-grade claim fresh-fetch the exact head and required checks again. If the head changed after review, mark prior exact-head evidence SUPERSEDED/STALE for promotion purposes.

## Protected actions
Creating/updating a draft PR is not merge authority. Merge, approval, ready transition, rebase, deployment and production promotion require their own explicit authority.