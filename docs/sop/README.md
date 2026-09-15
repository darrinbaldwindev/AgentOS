# AgentOS SOP Library

**Owner:** SOP Overseer  
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT  
**Version:** 0.1.0  
**Last verified:** 2026-09-15  
**Canonical portfolio coordination:** `darrinbaldwindev/Overseer#49`

## Purpose

This directory is the navigable operating-procedure layer for AgentOS. It documents verified product behaviour and explicitly separates that behaviour from product direction, recommended policy, legal requirements and unresolved/unknown state.

Documentation describes authority. It does not grant authority.

## Truth classes

Every material capability claim should use one of these evidence classes where ambiguity is possible:

- **PROVEN** — current repository/runtime evidence directly supports the bounded claim.
- **BETA-PROVEN** — evidence supports a bounded beta scope, not broad production readiness.
- **IMPLEMENTATION-ADVANCED** — substantial implementation exists but one or more acceptance/assurance gates remain.
- **NEARLY PROVEN** — implementation and evidence are close, but a named final gate remains.
- **PRODUCT DIRECTION** — owner/product intent, not shipped behaviour.
- **UNKNOWN** — current evidence is insufficient.
- **BLOCKED** — a known blocker prevents the claim or procedure.
- **NOT YET SUPPORTABLE** — current architecture/evidence cannot safely support the procedure.

Fresh repository/runtime evidence outranks this library. If implementation contradicts an SOP, the SOP becomes stale and must be revalidated.

## Current high-risk truth checkpoint

As of this bootstrap scan:

- `main` = `962cb3820b83506f9e6d90f50e003690dd85a8a1`.
- AgentOS Level 2 remains the immediate P0 under Overseer #49; Level 5 remains the strategic end-state.
- PR #104 is OPEN / DRAFT / UNMERGED. Its current GitHub head is `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`.
- Project-file mutation remains **BLOCKED** by unresolved continuous-ownership / SG-08 assurance; authenticated actor/canonical grant binding is also incomplete.
- Physical Windows acceptance is a separate gate.
- Green and PRS remain independent gates; execution or CI success does not manufacture either.
- Founding Beta / production readiness is not established by this documentation.

## Canonical operating principles

1. User interaction enters through the AgentOS Overseer; specialist workers/agents do not silently become competing front doors.
2. Stable agent identity/role must be separated from replaceable persona presentation. Persona customization remains PRODUCT DIRECTION unless implementation proves it.
3. AgentOS is model/provider/tool agnostic and MCP-first, not MCP-only.
4. Do not create a second scheduler, queue, registry, mission ledger, authority system, persistence system, memory system, Green system, PRS system or runtime source of truth.
5. Worker success, evidence, Green verification and PRS assurance are distinct states.
6. Unknown authority, scope, capability or policy fails closed.
7. `Stop requested` is not equivalent to `Execution stopped`.
8. A policy document is not evidence that a technical control is enforced.
9. A legal draft is not legal approval.

## Library map

- `MASTER-REGISTER.md` — SOP, policy, legal and terminology register plus dependency/revalidation map.
- `authority-and-permissions.md` — user/operator explanation of authority, scope and approvals.
- `stop-pause-revoke.md` — truthful stop/pause/revoke semantics and failure handling.
- `evidence-green-prs.md` — execution/evidence/Green/PRS state separation.
- `.overseer/batches/SOP-VERTICAL-EXECUTION-BATCH.md` — active vertical documentation batch and checkpoint.

## Required SOP metadata

Important SOPs should record: document ID, owner, status, version, effective/verified dates, product/version scope, audience, prerequisites, authority requirements, procedure, expected result, failure conditions, escalation, rollback/recovery, evidence produced, related policies/SOPs, implementation/evidence pointers, review cadence, and legal-review status when relevant.

## Revalidation rule

A document becomes a revalidation candidate when any dependency changes, including runtime authority semantics, worker lifecycle, evidence schema, Green/PRS gates, capability identity, commercial source of truth, UI wording, recovery semantics, or relevant legal/regulatory source.
