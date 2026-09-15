# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Cycle:** Frontend vertical cycle 012 — executable identity readiness hardening  
**Reconciled:** 2026-09-15 Australia/Brisbane  
**Canonical main:** `962cb3820b83506f9e6d90f50e003690dd85a8a1`  
**Frontend contract PR:** #110 OPEN / DRAFT / UNMERGED  
**Frontend implementation PR:** #111 OPEN / DRAFT / UNMERGED  
**Current #111 exact head:** `2bd30bc456fdd1f564d0c938b21ed17de001888e`  
**Current #111 exact-head CI:** AgentOS Tests #1282 (`34915285418`) SUCCESS  
**Runtime Windows dependency #104:** `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`  
**Read-only host status #101:** `d91abaecf602d7ef223c4888f10fa9361677302e`  
**Project integration #112:** `d1645450a06d00c49a7a78f176e97b44b9eaa225`  
**Batch status:** ACTIVE  
**P0:** Level-2 truthful readiness/evidence/authority and Founding-Beta comprehension.

## Mission

Translate canonical AgentOS runtime facts into one coherent ordinary-user product without creating frontend-owned execution, authority, persistence, Green, PRS, recovery or readiness truth.

> Chat for intent. Palette for speed. Inbox for attention. Jobs for repetition. Jack for authority. Isla for execution. Henry for proof.

Evidence > claims. Unknown, stale, mismatched, contradictory or absent state fails closed.

## Hard boundaries

No merge, approval, ready transition, rebase, deployment, credential changes, production writes, unrestricted PowerShell, production autonomy, beta activation, authority bypass, Green/PRS bypass or project-file mutation enablement.

Never create a duplicate scheduler, queue, registry, mission ledger, persistence layer, authority source, worker runtime, Green system, PRS system or frontend-owned readiness source.

Truth rules:

- runtime determines work state;
- authority determines permission state;
- canonical evidence determines evidence presentation;
- Green determines bounded completion-check disposition;
- PRS/Henry determines independent assurance only from real PRS evidence;
- `Stop requested` != `Execution stopped` != `Permission revoked`;
- Local Basic Chat != local-host lifecycle;
- host lifecycle != Windows capability;
- Windows capability != physical Windows acceptance;
- physical acceptance != project-file mutation readiness;
- a persisted success receipt != safe mutation completion when ownership/recovery evidence contradicts it;
- Boolean tool availability != executable identity evidence;
- CI PASS != product/assurance GREEN.

## Fresh repository truth

### Main / commercial direction

`main` remains `962cb3820b83506f9e6d90f50e003690dd85a8a1`.

Current canonical commercial model: Free $0/year; Standard $49/year; Advanced/Pro $99/year; AI Plus $22/month as a separate intelligence resource; Commercial/Business pricing TBD for customer-hosted/private-server multi-seat deployment. Older $29 assumptions are historical. Purchase/entitlement/server-seat implementation is not proven.

### #101 — read-only host lifecycle

OPEN/DRAFT at `d91abaecf602d7ef223c4888f10fa9361677302e`. It remains the strongest current read-only lifecycle source. It does not wake, mutate, grant authority, retry, clear locks or promote Green/PRS.

### #104 — Level-2 Windows / mutation dependency

OPEN/DRAFT at `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`; AgentOS Tests #1268 SUCCESS.

SG-08 remains unresolved. Current negative fixtures reproduce a durable `MUTATED_VERIFIED` success receipt with `recovery_required:false` before later ownership-loss detection. Frontend project-file mutation therefore remains UNKNOWN/BLOCKED regardless of CI, Windows capability or physical acceptance.

Current Windows host probing now provides stronger canonical evidence:

- fixed `where.exe` discovery for required tools;
- canonical executable path via realpath;
- fixed version query where available;
- `evaluation.tool_evidence` preserves `{available,path,version}`;
- execution adapter independently resolves executable identity and can compare it against expected probe evidence.

This evidence exists to prevent probe/execution identity drift. Frontend must not collapse it back to Boolean-only readiness.

### #112 — project integration

OPEN/DRAFT at `d1645450a06d00c49a7a78f176e97b44b9eaa225`. It remains the project integration spine and preserves fail-closed capability evaluation/non-physical DRY_RUN compatibility boundaries.

### #111 — frontend implementation

OPEN/DRAFT/UNMERGED at exact head `2bd30bc456fdd1f564d0c938b21ed17de001888e`.

AgentOS Tests #1282 (`34915285418`) completed SUCCESS on this exact head: general test job, full suite, npm audit and Windows Basic Chat lifecycle all passed.

## Current frontend truth model

### Basic Chat

Primary scope: `Local Basic Chat · Test actions only · Background work off`.

Stop remains a future-send/request boundary; it does not prove the in-flight action terminated or authority was revoked.

### What happened

Canonical evidence projection is wired read-only through existing local persistence. It requires canonical dispatch-task identity and exact task/mission/wake correlation. Raw prompt/objective/worker output/secrets/credentials/arbitrary metadata/PRS/recovery state are excluded. `lastTaskId` is a local-wake task correlation key, not a generic run ID.

### Readiness projection

`runtime/basic-chat-readiness-projection.mjs` is pure presentation logic. It performs no probing, persistence, execution, authority mutation, assurance or enablement.

It keeps five concepts separate:

1. Basic Chat availability — supplied canonical chat snapshot only.
2. Local-host lifecycle — supplied #101-style status only, expected-host and freshness guarded.
3. Windows capability — explicit platform/tool/workspace facts plus resolved executable identity evidence.
4. Physical Windows acceptance — canonical schema + supervised safety flags + exact expected-head match only.
5. Project-file mutation — always `unknown / NO_CANONICAL_MUTATION_READINESS_SOURCE`.

Cycle 012 strengthens Windows capability:

- PowerShell/Git/npm Boolean availability remains necessary but insufficient;
- every required tool must also have canonical `tool_evidence` with `available:true` and non-empty resolved path;
- Boolean-positive capability without executable identity fails closed to `unknown / WINDOWS_EXECUTABLE_IDENTITY_EVIDENCE_REQUIRED`;
- raw executable paths are not emitted by the frontend projection;
- missing one required executable path prevents positive capability;
- project-file mutation remains unknown even with chat available + fresh host + path-backed Windows capability + physical exact-head PASS.

## Missing runtime composition seam

The readiness adapter remains intentionally not live-wired because canonical upstream facts live on separate draft lineages.

Required runtime/project-integration owned read-only composition must provide:

- current host identity;
- current host-status evidence and freshness;
- Windows capability probe facts including `tool_evidence` executable identity;
- expected runtime/code exact head;
- physical acceptance record if one exists;
- no synthetic mutation readiness.

Do not solve this by importing cross-lineage draft modules into frontend, creating frontend persistence, inventing cross-branch IDs or treating stale evidence as current.

## Jack / authority

Interactive Allow/Revoke remains blocked. Receipt provenance is not enough. Required canonical semantics still include reason, scope, lifetime, expiry, revocation state, durable revoke mutation/receipt, already-running behavior, reversibility and user-facing consequences. No `Always allow`.

## Recovery

Basic Chat recovery remains contract-only. No live canonical recovery producer/read projection has been evidenced. Never synthesize `Recovered` from retry clicks, later success, cleared errors, new tasks or absence of failure evidence.

## Accessibility / browser

Static accessibility/responsive guards remain implemented/tested. Physical 320/360/390px browser/mobile acceptance remains NOT PROVEN without a trustworthy runnable draft target.

## Claim matrix

| Capability | Current treatment |
|---|---|
| Main mainstream frontend | NOT SHIPPED |
| Basic Chat | OPEN/DRAFT bounded local test path |
| Canonical task evidence | IMPLEMENTED + wired + tested |
| Local host lifecycle projection | IMPLEMENTED pure/read-only; not live-wired |
| Windows capability projection | IMPLEMENTED path-backed identity evidence required; not live-wired |
| Physical Windows acceptance projection | IMPLEMENTED exact-head fail-closed; not live-wired |
| Project-file mutation | UNKNOWN/BLOCKED; SG-08 false-success evidence controls |
| Green completion | Bounded completion check only |
| Henry/PRS | No Basic Chat PASS inference |
| Durable Revoke | NOT EVIDENCED |
| Recovery UI | CONTRACT ONLY |
| Physical browser/mobile acceptance | NOT PROVEN |
| Commercial pricing | Canonical direction known; purchase/entitlement implementation NOT PROVEN |

## Replenished P0 queue

1. Fresh-scan main/#101/#104/#110/#111/#112 before every action.
2. Track #104 SG-08 repair on the existing writer lineage; false-success fixtures remain hard blocker.
3. Require the runtime-owned composed readiness snapshot to preserve `tool_evidence`, not Boolean-only tool availability.
4. Wire readiness into Basic Chat only after that canonical composition exists; add no frontend persistence.
5. Keep project-file mutation unknown until a runtime-owned, independently assured readiness source exists.
6. Continue authority lifetime/expiry/revoke/consequence field detection; no synthetic Allow/Revoke/Always Allow.
7. Keep recovery contract-only until a live producer/read path exists.
8. Execute physical browser/mobile acceptance immediately when a trustworthy runnable target becomes available.
9. Preserve one truth model across Simple / Essentials / Tech Head; disclosure density only.
10. Reconcile future pricing/upgrade surfaces to $0/$49/$99 + $22 AI Plus + Commercial/Business TBD without speculative checkout claims.
11. Prepare Founding-Beta readiness only after Level-2 ownership/authority/assurance and frontend trust/control/evidence/browser gates independently clear.
12. Re-run exact-head CI after every implementation change and consume failures before claims.

## Protected HOLD

No merge/approval/ready/rebase/deployment/credentials/production writes/autonomy/unrestricted PowerShell/mutation enablement/synthetic authority/Green/PRS/recovery/readiness state/beta activation/overall GREEN.
