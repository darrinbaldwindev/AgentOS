# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Cycle:** Frontend vertical cycle 009 — readiness/evidence separation  
**Reconciled date:** 2026-09-15 Australia/Brisbane  
**Canonical main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Frontend contract PR:** #110 OPEN / DRAFT / UNMERGED  
**Frontend implementation PR:** #111 OPEN / DRAFT / UNMERGED  
**Current #111 exact code/test head:** `fbe28323dba468078848963c0bad560ea35f427a`  
**Current #111 exact-head CI:** AgentOS Tests #1169 SUCCESS  
**Runtime dependency PR #104:** `83a58b8bd230550b5781a0fee700cca250819a75`  
**Project integration PR #112 observed this cycle:** `e04bf63171d6b400a1c63d7b65e45b25d03b067e`  
**Batch status:** ACTIVE  
**P0:** truthful readiness, authority, evidence and Level-2/Founding-Beta comprehension.

## Mission

Translate canonical AgentOS runtime facts into one coherent ordinary-user product without creating frontend-owned execution, authority, persistence, Green, PRS, recovery or readiness truth.

> Chat for intent. Palette for speed. Inbox for attention. Jobs for repetition. Jack for authority. Isla for execution. Henry for proof.

Evidence > claims. Unknown, stale, contradictory or absent state fails closed.

## Hard boundaries

No merge, approval, ready transition, rebase, deployment, credential change, production write, unrestricted PowerShell, production autonomy, beta activation, authority bypass, Green/PRS bypass or project-file mutation enablement.

Never create a duplicate scheduler, queue, registry, mission ledger, persistence layer, authority source, worker runtime, Green system or PRS system.

Frontend truth rules:

- runtime determines work state;
- authority determines permission state;
- canonical evidence determines evidence presentation;
- Green determines bounded completion-check disposition;
- PRS/Henry determines independent assurance only from real PRS evidence;
- `Stop requested` != `Execution stopped` != `Permission revoked`;
- `Local` or `DRY_RUN` != physical Windows readiness;
- Windows host capability != physical acceptance;
- physical acceptance != project-file mutation safety;
- CI PASS != product/assurance GREEN.

## Current repository truth

### Main

`main` remains `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`. The richer mainstream frontend and most Level-2 runtime capability remain draft lineages rather than shipped main.

### PR #104 — Level 2 Windows/PowerShell dependency

Still OPEN/DRAFT at `83a58b8bd230550b5781a0fee700cca250819a75`.

Controlling state:

- bounded PowerShell host probe and supervised physical acceptance contracts exist;
- project-file mutation remains AMBER/BLOCKED;
- continuous ownership through publish/recovery/durable receipt/release remains unproven;
- authenticated transport/canonical grant binding remains incomplete;
- no PRS PASS;
- physical acceptance from predecessor/different heads cannot be inherited.

Frontend must not expose broad mutation as ready or safe.

### PR #101 — read-only host observation

`runtime/local-host-status.mjs` is the strongest current read-only host lifecycle projection. It derives idle/working/blocked/recovery-required/offline-or-stale from existing durable evidence, fails closed on host/correlation conflicts, and does not wake, mutate, grant authority, retry, clear locks or promote Green/PRS.

It is a useful future input, not a frontend authority source.

### PR #112 — project integration spine

Observed during Cycle 009 at `e04bf63171d6b400a1c63d7b65e45b25d03b067e` after further project-wide movement. It continues to preserve the explicit non-physical `legacy-dry-run-fixture` boundary. Its additional movement this cycle includes authority dependency/reconciliation docs and local-wake test adjustments; no frontend permission to infer physical/mutation readiness follows from that movement.

### PR #111 — frontend implementation

Cycle 009 first consumed concurrent evidence hardening through `db6ac635f9dc1d269363ffd2450e3802f57c9b00` (AgentOS Tests #1161 SUCCESS). The evidence projection now requires a canonical `dispatch.task` artifact before trusting matching response/Green/event evidence, preventing response/event agreement from laundering stale or wrongly correlated mission identity.

Cycle 009 then added `runtime/basic-chat-readiness-projection.mjs` and `tests/basic-chat-readiness-projection.test.mjs` at `fbe28323dba468078848963c0bad560ea35f427a`.

AgentOS Tests #1169 completed SUCCESS on that exact head.

## Current frontend implementation

### Basic Chat presentation

Primary scope:

`Local Basic Chat · Test actions only · Background work off`

Technical boundary:

`Execution: Local Basic Chat test path · Mode: DRY_RUN · Physical Windows worker readiness: not established · Autonomy: disabled · Completion gate: Green PASS required`

Pause/Resume/Stop controls are reconciled against canonical Basic Chat snapshot state. Stop is a future-send/request boundary and does not prove in-flight cancellation.

### `What happened` evidence projection

Read-only projection consumes exact local-wake task evidence. It now requires:

- canonical `dispatch.task` with matching task identity;
- task mission/wake identity present;
- no conflicting response/event mission or wake identity;
- Green artifact task identity exact when Green exists;
- canonical event types only.

It exposes bounded fields only and excludes prompt/objective/raw worker output/secrets/credentials/arbitrary metadata/PRS/recovery state.

`lastTaskId` remains a correlation key for these exact records, not a generic run ID.

### Readiness projection — Cycle 009

`runtime/basic-chat-readiness-projection.mjs` is pure presentation logic. It performs no persistence access, probing, authority mutation, execution, assurance or enablement.

It keeps four concepts separate:

1. **Basic Chat availability** — supplied canonical chat snapshot only: available / paused / stopped / unknown.
2. **Windows host capability** — supplied Windows host-probe evaluation only: capable / not capable / unknown, with missing requirements retained.
3. **Physical Windows acceptance** — only the existing canonical `agentos.windows-powershell-physical-acceptance.v1` object can produce `passed_for_exact_head`, and only when platform/pass/disposition/exact-head plus bounded safety flags agree.
4. **Project-file mutation** — always `unknown / NO_CANONICAL_MUTATION_READINESS_SOURCE` because no canonical mutation-readiness projection is yet available to Basic Chat.

Negative tests prove that even a capable Windows host plus physical acceptance PASS cannot upgrade mutation readiness.

This adapter is not yet wired to Basic Chat UI because the live Basic Chat snapshot does not currently receive the #101/#104 runtime facts. Do not solve that by inventing a frontend store or cross-branch identifier.

## Authority / Jack boundary

Interactive Jack actions remain blocked. Current runtime evidence is insufficient for truthful user-facing permission lifetime/expiry/revocation/revoke receipt/already-running behavior/reversibility/credential/data disclosure/external communication/cost/next-approval/mutation consequence semantics.

Read-only explanation is allowed when canonical facts are supplied. Synthetic Allow/Revoke/Always Allow is not.

## Recovery boundary

Recovery contracts exist, but Basic Chat still has no proven live canonical recovery producer/read projection. No `Recovered`, rollback-success or retry-success may be synthesized from a click, cleared error, later success, new task or absence of evidence.

## Accessibility / browser boundary

Static accessibility and responsive guards remain implemented/tested. Physical 320/360/390px browser/mobile acceptance remains NOT PROVEN because no trustworthy runnable draft target has been exercised from this context.

## Claim matrix

| Capability | Current treatment |
|---|---|
| Main mainstream frontend | NOT SHIPPED |
| Basic Chat | OPEN/DRAFT bounded local test path |
| Canonical task evidence | IMPLEMENTED + wired + exact-head tested |
| Readiness projection | IMPLEMENTED pure/read-only + exact-head tested; not yet wired to live cross-lineage runtime inputs |
| Windows host capability | Can be shown only from canonical host-probe result |
| Physical Windows acceptance | Can be shown only for exact head from canonical physical-acceptance record |
| Project-file mutation | UNKNOWN/BLOCKED from frontend; no canonical readiness source |
| Green completion | Bounded completion check only |
| Henry/PRS | No Basic Chat PASS inference |
| Durable Revoke | NOT EVIDENCED |
| Recovery UI | CONTRACT ONLY |
| Physical browser/mobile acceptance | NOT PROVEN |

## Replenished P0 queue

1. Fresh-scan main/#101/#104/#110/#111/#112 before every action.
2. Look for a canonical, read-only composition seam that can supply host-status/host-probe/physical-acceptance to Basic Chat without new persistence or duplicated authority.
3. Do not wire readiness UI until correlation/freshness/exact-head semantics are explicit at the runtime boundary.
4. Continue #104 authority-field change detection; interactive Jack remains blocked until canonical mutation semantics exist.
5. Keep project-file mutation unknown in frontend until a runtime-owned readiness/assurance object is evidenced.
6. Keep recovery contract-only until real producer/read evidence appears.
7. Execute physical browser/mobile acceptance immediately when a trustworthy runnable draft target exists.
8. Preserve one truth model across Simple / Essentials / Tech Head; only disclosure density changes.
9. Prepare Founding-Beta readiness only after Level-2 ownership/authority/assurance gates improve; no activation.
10. Re-run exact-head CI for every changed implementation head and consume failures before claims.

## Completion rule

Do not call the frontend coherent for Founding Beta until ordinary-user Chat, fail-closed status, evidence projection, control semantics, authority presentation, readiness semantics, accessibility/browser acceptance and Level-2 runtime/governance gates are all backed by current exact evidence.

## Protected HOLD

No merge/approval/ready/rebase/deployment/credentials/production writes/autonomy/unrestricted PowerShell/mutation enablement/synthetic authority/Green/PRS/recovery state/beta activation/overall GREEN.
