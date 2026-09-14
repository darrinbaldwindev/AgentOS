# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Cycle:** Frontend vertical cycle 010 — runtime-owned readiness composition  
**Reconciled date:** 2026-09-15 Australia/Brisbane  
**Canonical main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Frontend contract PR:** #110 OPEN / DRAFT / UNMERGED  
**Frontend implementation PR:** #111 OPEN / DRAFT / UNMERGED  
**Current #111 implementation head:** `429b6d5bc14b2790f1a9bace09b76e699cb88b8c`  
**Runtime Windows dependency #104:** `bbfee5221652c9bf0551ce5b31eb0b1cf6e78af1`  
**Read-only host status #101:** `d91abaecf602d7ef223c4888f10fa9361677302e`  
**Project integration #112:** `d1645450a06d00c49a7a78f176e97b44b9eaa225`  
**Batch status:** ACTIVE  
**P0:** truthful readiness, evidence, authority and Level-2/Founding-Beta comprehension.

## Mission

Translate canonical AgentOS runtime facts into one coherent ordinary-user product without creating frontend-owned execution, authority, persistence, Green, PRS, recovery or readiness truth.

> Chat for intent. Palette for speed. Inbox for attention. Jobs for repetition. Jack for authority. Isla for execution. Henry for proof.

Evidence > claims. Unknown, stale, contradictory or absent state fails closed. Simple must never mean misleading.

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
- `Local Basic Chat` != host lifecycle;
- host lifecycle != Windows host capability;
- Windows host capability != physical Windows acceptance;
- physical Windows acceptance != project-file mutation readiness;
- CI PASS != product/assurance GREEN.

## Current repository truth

### Main

`main` remains `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`. The richer mainstream frontend and most Level-2 runtime capability remain draft lineages rather than shipped main.

### PR #101 — read-only host lifecycle

#101 remains OPEN/DRAFT at `d91abaecf602d7ef223c4888f10fa9361677302e`.

Its `runtime/local-host-status.mjs` contract is the strongest current read-only lifecycle projection. It derives:

- `idle`;
- `working`;
- `blocked`;
- `recovery_required`;
- `offline_or_stale`.

It fails closed on host/correlation conflicts, stale evidence, multiple active tasks and incomplete task identity. It does not wake, mutate, grant authority, retry, clear locks or promote Green/PRS.

### PR #104 — Windows/PowerShell and project-file dependency

#104 is OPEN/DRAFT at live head `bbfee5221652c9bf0551ce5b31eb0b1cf6e78af1`.

Current controlling state:

- bounded Windows/PowerShell host probing and physical-acceptance contracts exist;
- authority-admitted PowerShell execution receipts now preserve source-backed `authority_evidence_id` and fail closed when that evidence disappears before receipt construction;
- exact-head AgentOS Tests #1187 SUCCESS on the final observed head;
- project-file mutation remains AMBER/BLOCKED;
- SG-08 continuous ownership through final verification -> publish/prepared recovery -> durable success receipt -> release remains unresolved;
- authenticated transport and canonical grant lookup remain composition dependencies;
- physical Windows acceptance remains separate from CI;
- no PRS PASS.

Authority provenance improvement does not establish permission lifetime, expiry, durable revoke semantics or interactive Jack readiness.

### PR #112 — project integration spine

#112 is OPEN/DRAFT at `d1645450a06d00c49a7a78f176e97b44b9eaa225`.

AgentOS Tests #1189 SUCCESS and Project Overseer Wake #413 SUCCESS on this exact head. The latest observed movement from the prior integration head is documentation-only.

The integration spine continues to preserve the explicit non-physical `legacy-dry-run-fixture` boundary and canonical capability evaluation. Frontend must not infer physical or mutation readiness from the DRY_RUN compatibility path.

### PR #111 — frontend implementation

#111 remains OPEN/DRAFT/UNMERGED.

Cycle 010 began at `146f1118d34c36fdcb579450987a72a6e656c3d7`. AgentOS Tests #1177 was overall FAILURE due only to the known Ubuntu CLI signal lifecycle assertion (`SIGINT` versus expected `null`). All readiness/evidence/frontend tests passed and the Windows Basic Chat lifecycle job passed.

Cycle 010 implementation now reaches `429b6d5bc14b2790f1a9bace09b76e699cb88b8c`.

Exact-head CI #1199 must be consumed before declaring this current head test-green.

## Frontend truth model

### Basic Chat

Primary scope:

`Local Basic Chat · Test actions only · Background work off`

Technical boundary:

`Execution: Local Basic Chat test path · Mode: DRY_RUN · Physical Windows worker readiness: not established · Autonomy: disabled · Completion gate: Green PASS required`

Pause/Resume/Stop presentation derives from canonical Basic Chat state. Stop remains a request/future-send boundary; the in-flight action may finish.

### Canonical `What happened` evidence

The read-only Basic Chat evidence projection requires canonical dispatch-task identity before trusting response/Green/event evidence.

It fails closed on:

- absent canonical `dispatch.task` when matching derived evidence exists;
- wrong task identity;
- mission/wake correlation conflict;
- Green artifact missing/conflicting task identity;
- non-canonical event types.

It exposes only bounded task/mission/wake/completion/Green fields and excludes prompt/objective/raw output/secrets/credentials/arbitrary metadata/PRS/recovery state.

`lastTaskId` is an exact local-wake correlation key, not a generic run ID.

## Cycle 010 readiness composition

`runtime/basic-chat-readiness-projection.mjs` remains pure presentation logic. It performs no persistence access, probing, authority mutation, execution, assurance or enablement.

It now keeps five concepts separate.

### 1. Basic Chat availability

Derived only from the supplied canonical chat snapshot:

- `available`;
- `paused`;
- `stopped`;
- `unknown`.

### 2. Local host lifecycle

Derived only from a supplied #101-style host status object with:

- `schema_version === 1`;
- non-empty `host_id`;
- recognized lifecycle state;
- bounded evidence freshness.

Recognized lifecycle states:

- `idle`;
- `working`;
- `blocked`;
- `recovery_required`;
- `offline_or_stale`.

Recognized freshness:

- `fresh`;
- `stale`;
- `unknown`;
- `conflicting`.

Conflicting evidence is presented as blocked. Invalid schema or unknown lifecycle fails closed to unknown.

Lifecycle state does not imply capability or readiness.

### 3. Windows host capability

A bare `evaluation.eligible === true` assertion is insufficient for positive presentation.

`capable` requires explicit canonical probe facts:

- `windows === true`;
- PowerShell available;
- Git available;
- npm available;
- workspace readable;
- workspace writable.

If explicit requirements are missing or `eligible:false`, present `not_capable`. If an eligible Boolean is asserted without explicit facts, remain `unknown / WINDOWS_CAPABILITY_CANONICAL_EVIDENCE_REQUIRED`.

This mirrors the fail-closed direction of project integration instead of creating a parallel Boolean trust path.

### 4. Physical Windows acceptance

Only the canonical `agentos.windows-powershell-physical-acceptance.v1` object can produce `passed_for_exact_head` and only when all bounded facts agree:

- `platform === win32`;
- `pass === true`;
- exact head present;
- expected PASS disposition;
- local-wake execution remains disabled;
- scheduler execution remains disabled;
- production autonomy remains disabled;
- owner supervision remains required.

### 5. Project-file mutation readiness

Still always:

`unknown / NO_CANONICAL_MUTATION_READINESS_SOURCE`

because Basic Chat has no canonical runtime-owned mutation-readiness/assurance object.

Regression tests explicitly prove that this remains unknown even when:

- Basic Chat is available;
- local host is idle/fresh;
- explicit Windows host capability facts are complete;
- supervised exact-head physical acceptance is PASS.

## Wiring boundary

The readiness projection is intentionally not wired into live Basic Chat UI yet.

The missing upstream seam is a runtime-owned read-only composition that supplies current/fresh/correlated:

- #101 host lifecycle;
- #104 Windows capability probe facts;
- exact-head physical acceptance.

Do not solve this by adding frontend persistence, manufacturing cross-branch identifiers or treating stale evidence as current.

If/when a canonical runtime composition appears, the frontend may consume it read-only and add the projected facts to the existing Basic Chat snapshot.

## Authority / Jack boundary

Interactive Jack actions remain blocked.

Current receipt provenance has improved, but truthful interactive permission controls still require canonical:

- ordinary-language reason;
- lifetime / one-action / job / session semantics;
- expiry;
- current revocation state;
- durable revoke mutation and receipt;
- already-running behavior after revoke;
- reversibility;
- credential involvement;
- data disclosure consequence;
- external communication/publication consequence;
- cost/capacity consequence;
- next/additional approval boundary;
- mutation consequence.

No synthetic Allow/Revoke/Always Allow.

## Recovery boundary

Recovery remains contract-only for Basic Chat. No live canonical producer/read projection has been evidenced for recovery actions. Never synthesize `Recovered` from retry clicks, later success, cleared errors, new tasks or absence of failure evidence.

## Accessibility / browser boundary

Static accessibility/responsive guards remain implemented and tested. Physical 320/360/390px browser/mobile acceptance remains NOT PROVEN because no trustworthy runnable draft target has been exercised from this execution environment.

## Claim matrix

| Capability | Current treatment |
|---|---|
| Main mainstream frontend | NOT SHIPPED |
| Basic Chat | OPEN/DRAFT bounded local test path |
| Canonical task evidence | IMPLEMENTED + wired + regression-tested |
| Local host lifecycle projection | IMPLEMENTED pure/read-only; not live-wired |
| Windows host capability projection | IMPLEMENTED from explicit probe facts; not live-wired |
| Physical Windows acceptance projection | IMPLEMENTED exact-head fail-closed; not live-wired |
| Project-file mutation | UNKNOWN/BLOCKED from frontend; no canonical readiness source |
| Green completion | Bounded completion check only |
| Henry/PRS | No Basic Chat PASS inference |
| Durable Revoke | NOT EVIDENCED |
| Recovery UI | CONTRACT ONLY |
| Physical browser/mobile acceptance | NOT PROVEN |

## Replenished P0 queue

1. Consume exact-head #111 AgentOS Tests #1199 and classify any failure exactly.
2. Fresh-scan #101/#104/#110/#111/#112 after CI because active branches are moving concurrently.
3. Find or request the smallest runtime-owned read-only readiness composition seam. Do not add frontend persistence.
4. If a canonical composed snapshot appears, wire it read-only into Basic Chat and render capability/lifecycle/physical acceptance with the current projection.
5. Keep mutation readiness unknown until its own runtime-owned assurance/readiness source exists.
6. Continue authority-field change detection; receipt provenance is not interactive permission semantics.
7. Keep recovery contract-only until a live producer/read path exists.
8. Execute physical browser/mobile acceptance immediately when a trustworthy runnable target becomes available.
9. Preserve one truth model across Simple / Essentials / Tech Head; disclosure density only.
10. Prepare Founding-Beta readiness only after Level-2 ownership/authority/assurance gates improve; no activation.
11. Re-run exact-head CI after every implementation change and consume failures before claims.

## Completion rule

Do not call the Founding-Beta frontend coherent until ordinary-user Chat, fail-closed status/evidence/control/readiness semantics, canonical authority presentation, accessibility/browser acceptance and Level-2 runtime/governance gates are all backed by current evidence.

## Protected HOLD

No merge/approval/ready/rebase/deployment/credentials/production writes/autonomy/unrestricted PowerShell/mutation enablement/synthetic authority/Green/PRS/recovery/readiness state/beta activation/overall GREEN.
