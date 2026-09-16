# SOP-MISSION-001 — Creating and Authorising a Mission

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Purpose
Create bounded missions without inventing a second scheduler, authority source, ledger or worker registry.

## Core rule
A mission describes authorised work. A schedule determines when an already-authorised mission may be considered for execution; it does not create authority. Assignment is not acknowledgement, execution, completion, Green or PRS.

## Required mission envelope
Record: mission ID; owner/assigning Overseer; objective; scope and exclusions; project/repository/branch/exact head where relevant; task graph/dependencies; intended worker/capability; authority evidence; approval requirements; budget/cost envelope; inputs; expected outputs; acceptance criteria; evidence/receipt requirements; recovery/idempotency rules; stop/pause/revoke behavior; Green gate; PRS gate where required; reporting destination; expiry/revalidation trigger.

Material UNKNOWN authority, target, approval or acceptance criteria fails closed.

## Procedure
1. Reconcile the current project and canonical control systems.
2. Confirm the work is not already owned by another active mission/worker lineage.
3. Define objective and explicit non-goals.
4. Bind target identity and exact code/data version where material.
5. Resolve authority from the canonical authority source; never from model confidence, credentials or task text.
6. Attach required approvals and expiry/conditions.
7. Define bounded capability/tool access and budget.
8. Define evidence, receipts, verification and independent assurance gates.
9. Define replay/idempotency and interrupted-work behavior before mutation-capable work.
10. Persist the mission through the existing canonical mission system.
11. Hand off using SOP-AGENT-002 and require durable ACK before treating the worker as having consumed it.
12. Revalidate if target/head/authority/risk/approval materially changes.

## Status semantics
PROPOSED -> AUTHORISED -> ASSIGNED -> ACKNOWLEDGED -> ACTIVE -> BLOCKED/RETURNED -> VERIFIED FOR DEFINED SCOPE -> independently assured where required.

Do not collapse these states to DONE.

## Protected actions
A mission cannot silently authorise merge, deploy, credentials, production writes, spending, external communications, legal approval, Green or PRS unless the owner/canonical authority explicitly grants that exact action.

This SOP documents mission governance; it grants no runtime permission.