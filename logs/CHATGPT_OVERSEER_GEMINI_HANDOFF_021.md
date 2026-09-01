# CHATGPT Overseer — Gemini Handoff — Mission 021

## Mission
Portfolio / AgentOS / Overseer — P0 GREEN verification and execution boundary.

## Status
RESEARCH/VERIFICATION HANDOFF — implementation evidence required from Project Overseer.

## Current repository reference
Current commit reported by Mission 021: `b9051234f75bd234307114ceeb713372061a48d0` (CORE-006 worker bridge).

## GREEN status
YELLOW — GREEN candidate. Do not claim Tier 2.3 GREEN until deterministic evidence proves all five gates together.

## Five required gates
1. Heartbeat/project scope: fail closed on missing/empty/unknown project_id; no portfolio fallback; idempotent scoped dispatch.
2. Budget governance: mission ceiling plus atomic two-phase pre-flight reservation and post-call reconciliation; exhaustion blocks the next call.
3. Path authority: normalization, allowed-root enforcement, traversal and symlink escape protection, and no shell/tool bypass.
4. Worker capability/consent: capability match, project scope, authorization and consent state enforced before worker invocation.
5. Machine verification/evidence: failed verification cannot produce VERIFIED/COMPLETED; execution and verification are auditable.

## Current reported results
- Gate 1: IMPLEMENTED / UNVERIFIED.
- Gate 2: PARTIAL.
- Gate 3: IMPLEMENTED / UNVERIFIED.
- Gate 4: IMPLEMENTED / UNVERIFIED.
- Gate 5: PARTIAL.
- Modular tests and deterministic GlobalShopCo fixture tests reportedly pass.
- Unified concurrent/adversarial five-gate integration proof is still pending.

## Required action
CHATGPT Overseer should direct the AgentOS Project Overseer to execute the existing P0 deterministic integration suite against the current canonical repository. Reuse existing issues/backlog; do not create duplicate architecture.

## Required evidence package
- exact test commands and full pass/fail results;
- current commit SHA;
- files changed, if any;
- evidence/audit paths;
- proof of budget overspend prevention;
- proof of path/symlink blocking;
- proof of heartbeat fail-closed scope;
- proof of worker capability/consent rejection before invocation;
- proof verification failure cannot mark a mission successful;
- confirmation production scheduler state and credentials were untouched;
- final GREEN/YELLOW decision grounded in repository evidence.

## Existing issue reconciliation
Use existing AgentOS work, especially #20 scheduler, #35 heartbeat, #41 worker safety/consent, #40 Green Agent, #38 PRS, #15/#13 Tier 2.3 architecture and related core verification work. No duplicate issue should be created unless the current repository proves an existing issue is insufficient.

## Portfolio protection
GlobalShopCo and GlobalShopCo-Headless remain protected P0 priorities. AgentOS verification must not alter Shopify/WordPress production, credentials, or live scheduler state.

## Website/Search/AEO
Pre-GREEN website work remains preparation/staging only. Public deployment, indexing and automated AEO publication remain gated until P0 GREEN evidence exists.

## PRS / Green Agent
PRS may provide independent machine-readable assurance. Green Agent remains read/analyse/report/challenge only. Neither substitutes for deterministic AgentOS runtime tests.

## Gemini status
NO NEW GEMINI RESEARCH REQUIRED at this stage. The outstanding question is execution evidence, not architecture research. Trigger another Gemini mission only if deterministic testing reveals a genuinely new unresolved architecture/security/research question.

## Critical rule
Gemini research is intelligence, not implementation evidence. Repository state, committed code, deterministic tests, controlled runtime evidence, Project Overseer verification, and canonical logs are the implementation evidence.

## CHATGPT Overseer action required
Ingest this handoff and direct the AgentOS Project Overseer to complete the existing P0 deterministic verification work. Do not declare GREEN until the evidence package passes.

## Project Overseer destination
AgentOS Project Overseer (`/agentos`).

## Source
Gemini Overseer Mission 021 supplied to ChatGPT. All repository claims require independent current-repository verification.
