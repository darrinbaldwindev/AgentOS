# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Cycle:** Frontend vertical cycle 008 — evidence/runtime-truth reconciliation  
**Fresh-scan context:** 2026-09-14, Australia/Brisbane  
**Reconciled main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Frontend contract PR:** #110 — OPEN / DRAFT / UNMERGED  
**Frontend implementation PR:** #111 — OPEN / DRAFT / UNMERGED  
**Current #111 head:** `93a7244e47c357d589ba08410085fddca9a8a11b`  
**Current #111 exact-head CI:** AgentOS Tests #1131 — SUCCESS; general test/audit SUCCESS; Windows Basic Chat lifecycle SUCCESS  
**Project integration PR:** #112 — OPEN / DRAFT / UNMERGED at `5eb83386af073f9590bb93f2e1be052897559c52`  
**Current #112 exact-head CI:** AgentOS Tests #1125 SUCCESS; Project Overseer Wake #395 SUCCESS  
**Current #104 head:** `83a58b8bd230550b5781a0fee700cca250819a75`  
**Batch status:** ACTIVE  
**P0:** Level 2 / Founding-Beta trust, control, evidence and ordinary-user comprehension.

## 1. Mission

Translate AgentOS's canonical governed execution system into one coherent product for ordinary users without creating a second control plane.

> Chat for intent. Palette for speed. Inbox for attention. Jobs for repetition. Jack for authority. Isla for execution. Henry for proof.

Frontend owns presentation and comprehension. Runtime, scheduler, persistence, authority, execution, Green and PRS remain canonical elsewhere.

Evidence > claims. Unknown, stale or contradictory state fails closed. Simple must never mean misleading.

## 2. Hard boundaries

This batch does not authorize merge, approval, ready transition, rebase, deployment, credential changes, production writes, unrestricted PowerShell, production autonomy, beta activation or bypass of authority/Green/PRS.

Do not create a duplicate scheduler, queue, registry, mission ledger, job database, authority source, persistence layer, worker runtime, Green system or PRS system.

Presentation rules:

- canonical runtime determines work state;
- canonical authority determines permission state;
- canonical evidence determines evidence presentation;
- Green determines bounded completion-check disposition;
- PRS/Henry determines independent assurance only when an actual canonical PRS result exists;
- mocks/specifications are never shipped capability evidence;
- `Stop requested` is not `Execution stopped`;
- `Execution stopped` is not `Permission revoked`;
- token/authentication is not authority;
- DRY_RUN fixture evidence is not physical-worker readiness;
- no generic `VERIFIED` without explicit object and scope.

## 3. Current repository truth

### Main

`main` remains `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1` and still does not contain the richer mainstream AgentOS application shell. Basic Chat and most Level 2 runtime work remain draft-lineage capability.

### Project integration spine — PR #112

PR #112 is the current project-wide reconciliation spine. Exact head `5eb83386af073f9590bb93f2e1be052897559c52` passes AgentOS Tests #1125 and Project Overseer Wake #395.

It centralizes capability evaluation and hardens the legacy local-wake fixture so compatibility requires exact explicit facts:

- `mode: DRY_RUN`;
- `classification: legacy-dry-run-fixture`;
- `physical: false`;
- compatibility evidence cannot imply local preference or physical capability.

Exact-head tests reject a physical=true legacy fixture, near-match fixture names, nested-mode tricks and naked `eligible:true` claims.

Frontend consequence: loopback/local Basic Chat must not be presented as proof of the Level 2 physical Windows worker, general project-file mutation or production-capable local execution.

### Level 2 dependency — PR #104

PR #104 remains OPEN/DRAFT at `83a58b8bd230550b5781a0fee700cca250819a75`.

Current controlling state:

- bounded PowerShell operations exist in the draft lineage;
- exact-head Ubuntu/Windows CI has passed for the existing runtime;
- general project-file mutation remains AMBER/HOLD;
- stale-owner false-success / continuous-ownership-through-publish remains unresolved;
- no PRS PASS;
- authenticated transport + canonical grant source binding remain incomplete;
- current-head physical Windows acceptance remains a separate gate.

Frontend must not expose broad mutation controls or imply mutation readiness.

### Frontend implementation — PR #111

PR #111 remains OPEN/DRAFT/UNMERGED on `frontend-overseer/basic-chat-plain-language` at `93a7244e47c357d589ba08410085fddca9a8a11b`.

Current exact-head AgentOS Tests #1131 is SUCCESS:

- general test suite SUCCESS;
- npm dependency audit SUCCESS;
- Windows Basic Chat lifecycle SUCCESS.

This proves the current draft branch test state only. It does not prove mainline shipping, browser/mobile physical acceptance, Level 2 mutation safety, canonical authority revocation or PRS assurance.

## 4. Implemented frontend truth model

### Ordinary-user status

Current presentation includes:

- Ready
- Working
- Checking the result
- Finished — completion check passed
- Needs attention — work was not marked complete
- Paused — no new actions will start
- Stop requested — no new actions will start; the current action may still finish
- Unable to confirm status

Technical/raw error detail remains separately expandable.

### Canonical `What happened` evidence projection

Basic Chat now has a bounded read-only evidence projection wired into `local-chat`.

`lastTaskId` is used only as a correlation key for exact local-wake task records. The projection consumes existing canonical local persistence and filters task-scoped:

- `project-overseer.response` records;
- `green.disposition` records;
- canonical manual-wake completion/failure events.

It exposes only bounded presentation fields such as task, mission, wake trace, completion status, Green disposition, completion time and blocker count.

It does not expose raw worker output, prompt/objective payloads, credentials, secrets, arbitrary metadata, PRS or recovery state.

Fail-closed rules include:

- wrong task ignored;
- response/event mission mismatch => evidence unavailable;
- response/event wake mismatch => evidence unavailable;
- Green artifact without exact task identity => evidence unavailable;
- non-canonical same-task event => ignored;
- absent matching evidence => unknown/unavailable.

`lastTaskId` is not a generic `runId` and must not be sent to generic run-inspector APIs as one.

### Completion check versus independent assurance

`Completion check` is bounded Green-backed evidence for this local-wake path.

`Independent assurance` remains `Not shown in Basic Chat` because no canonical Henry/PRS result is present in the Basic Chat snapshot.

Never infer Henry/PRS PASS from worker success, Green PASS, a completed response or exact-head CI.

### Pause / Resume / Stop

Control availability is derived from canonical Basic Chat snapshot flags:

- Pause disabled while paused/stopped;
- Resume enabled only while paused;
- Stop disabled after Stop;
- initial unresolved state disables controls;
- Stop stays available during an active send because it is a request/future-send block, not proof of current-action cancellation.

Basic Chat Stop still does not cancel an already-running `wakeLocal()` call.

Allowed: `Stop requested — no new actions will start; the current action may still finish`.

Not allowed without new canonical evidence: `Execution stopped`, `Nothing else can happen`, `Permission revoked`, `No further actions authorised`.

### Physical/local truth correction — Cycle 008

Primary Basic Chat scope line now says:

`Local Basic Chat · Test actions only · Background work off`

Technical details now say:

`Execution: Local Basic Chat test path · Mode: DRY_RUN · Physical Windows worker readiness: not established · Autonomy: disabled · Completion gate: Green PASS required`

Regression coverage requires the `not established` wording and rejects ready/verified/passed physical-readiness wording.

This aligns the frontend with PR #112's tested `legacy-dry-run-fixture` / `physical:false` contract.

## 5. Jack / authority boundary

`docs/FRONTEND-JACK-PERMISSION-CONTRACT.md` remains the frontend authority contract.

Current #104 admission evidence includes authenticated actor context supplied by caller, trusted issuer/project provenance, requested/granted capabilities, authority evidence ID, mission/task/delivery/request IDs, target host, scope, constraints, objective and admission timestamp.

Still missing for truthful interactive Jack actions:

- ordinary-language reason supplied canonically;
- explicit permission lifetime semantics;
- expiry;
- current revocation state;
- canonical durable revoke mutation;
- revoke receipt;
- already-running work semantics after revoke;
- reversibility;
- credential involvement;
- data disclosure consequence;
- external communication/publication consequence;
- cost/capacity consequence;
- next/additional approval boundary;
- mutation consequence.

Until those exist, Jack may explain read-only authority facts but must not offer synthetic Allow/Revoke/Always Allow controls.

## 6. Recovery boundary

`docs/FRONTEND-RECOVERY-PRESENTATION-CONTRACT.md` remains contract-ready, but live Basic Chat recovery state is not evidenced.

Recovery schemas exist, but current evidence still does not prove a live Basic Chat producer/read stream for `recovery_action_recorded` or equivalent recovery state.

Do not infer `Recovered` from:

- a retry click;
- a later successful response;
- a cleared error;
- a new task;
- Green on another task;
- absence of failure evidence.

Original failure must remain visible in any future Evidence Timeline after recovery.

## 7. Accessibility / responsive state

Static/code baseline includes:

- minimum 44px controls;
- visible keyboard focus;
- wrapping controls;
- narrow-layout stacked composer;
- full-width Send on narrow screens;
- reduced-motion handling;
- transcript removed from live region;
- concise polite/atomic status live region;
- alert channel for errors;
- `aria-busy` limited to browser-request sending state.

Physical/browser acceptance remains NOT PROVEN because no trustworthy runnable draft target has been exercised from this context.

Required physical acceptance:

- 320/360/390 CSS px widths;
- no primary horizontal scroll;
- composer/Send reachable;
- Pause/Resume/Stop keyboard reachable;
- focus remains visible;
- evidence/technical disclosures usable without losing composer;
- status/errors do not steal focus;
- transcript does not repeatedly announce.

## 8. Claim matrix

| Capability | Current status | Allowed claim |
|---|---|---|
| Main mainstream app shell | NOT SHIPPED | Do not imply current main has full product UI |
| Basic Chat | OPEN/DRAFT | Governed bounded local test chat |
| Plain-language status/errors | IMPLEMENTED + tested | Draft branch only |
| Canonical task evidence projection | IMPLEMENTED + wired + tested | Bounded local-wake evidence only |
| Green completion display | EVIDENCED on bounded path | `Passed for this job` only with matching canonical evidence |
| Henry/PRS display | NOT CANONICAL in Basic Chat | No PASS inference |
| Pause | BOUNDED | Prevents new work while paused |
| Stop | REQUEST semantics | Current action may still finish |
| Durable authority Revoke | NOT EVIDENCED | No interactive revoke claim |
| Jack permission card | CONTRACT READY | Read-only design only until authority mutation facts exist |
| Recovery state | CONTRACT ONLY | No live recovery claims |
| Local Basic Chat test path | EVIDENCED | Local bounded test path |
| Physical Windows worker readiness | NOT ESTABLISHED by Basic Chat | Explicitly say not established |
| General project-file mutation | AMBER/HOLD | Do not expose as generally available |
| Browser/mobile acceptance | NOT PROVEN | Static implementation only |
| #111 exact-head CI | SUCCESS at `93a7244e...` | Exact draft-head test success, not overall AgentOS GREEN |

## 9. Simple / Essentials / Tech Head

One truth model, three disclosure densities.

### Simple

- large Chat;
- plain language;
- no raw IDs by default;
- `What happened` summary;
- Jack explains permission;
- Isla explains work;
- Henry explains assurance only when canonical assurance exists.

### Essentials

- mainstream target;
- current work, scope, controls and evidence visible;
- technical details on demand;
- Inbox/Jobs as read-only projections over canonical state.

### Tech Head

- same human summary first;
- raw IDs, receipts, traces, capability evidence and policies expandable;
- raw diagnostics never the only explanation.

Facts must not change across modes.

## 10. P0 next queue

### P0-E4 — capability/readiness presentation adapter

If/when runtime exposes canonical capability evidence to the frontend snapshot, build one read-only adapter that distinguishes:

- Basic Chat/local test path available;
- physical Windows worker ready/not ready/unknown;
- project-file mutation available/blocked/unknown;
- scheduler/background capability available/disabled/unknown;
- authority source state known/unknown.

Do not derive these from `mode`, host location, UI origin or fixture classification alone.

### P0-E3 — authority-field change detection

Re-scan #104/#112 on every cycle for lifetime/expiry/revoke/consequence fields. Implement interactive Jack controls only after canonical mutation and durable receipt semantics exist.

### P0-I3 — recovery read-path detection

Continue searching for a real recovery producer/read path. Do not create frontend-owned recovery persistence.

### P0-H2 — physical browser acceptance

Execute immediately when a trustworthy runnable draft target/harness becomes available.

### P0-G1 — Founding-Beta readiness

Prepare only after Level 2 entry gates improve. No beta activation.

Founding Beta must state unavailable capability plainly and use one proven starter task before broad claims.

## 11. P1 queue

### Inbox

Read-only attention projection over canonical permission-required, blocked, verification-failed, recovery-required and completed-attention states. No new inbox database.

### Jobs

Map visible Jobs to canonical mission/task/schedule identity before implementation. No frontend-owned scheduler or Saved Jobs authority.

### Palette

Expose user capabilities/actions, not backend commands. Availability must be evidence-backed.

### Evidence Timeline

Expand beyond `What happened` only when canonical ordered event/receipt reads are proven. Never erase original failures after recovery.

## 12. Founding-Beta comprehension tests

Measure whether testers can:

- give a first real job without coaching;
- understand the current test/physical capability boundary;
- understand Jack's requested authority;
- distinguish Working / Stop requested / confirmed Stopped;
- distinguish Green completion from Henry/PRS assurance;
- identify what happened and what changed;
- recover from interruption without reading raw logs;
- explain why a blocked task was blocked;
- attempt a second real job unprompted.

Primary adoption signal remains spontaneous second real job.

## 13. Runtime dependencies the frontend must expose, not disguise

- Level 2 project-file mutation remains AMBER/HOLD;
- SG-08 continuous ownership remains unresolved;
- authenticated transport/canonical grant binding incomplete;
- Basic Chat Stop does not cancel in-flight wake;
- durable authority revoke not evidenced;
- PRS/Henry not canonical in Basic Chat snapshot;
- recovery schemas are not a live recovery read model;
- Local/Cloud/Mixed product-wide truth not consistently available;
- cost/capacity data not consistently available;
- physical Windows worker readiness is not established by Basic Chat's DRY_RUN fixture;
- physical responsive/browser acceptance remains required.

## 14. Completion rule

Do not call the Founding-Beta frontend coherent until:

- Chat is ordinary-user readable;
- status/evidence adapters fail closed;
- completion display requires canonical matching evidence;
- active work cannot show stale prior success;
- Stop language matches runtime guarantees;
- authority UI is backed by canonical authority facts and mutations;
- Green and Henry/PRS remain separate;
- physical/local capability boundaries are explicit;
- responsive/browser acceptance has real runtime evidence;
- intended release lineage has exact-head CI success;
- Level 2 runtime/governance entry gates independently clear.

## 15. Next `cont`

1. fresh-scan main, #104, #110, #111, #112 and latest Overseer#49;
2. consume any concurrent movement before acting;
3. inspect #104/#112 for canonical capability-readiness or authority-lifetime/revoke fields;
4. if a canonical capability snapshot appears, build the smallest read-only presentation adapter with negative tests;
5. otherwise continue recovery read-path detection and Founding-Beta readiness specification;
6. execute browser acceptance only against a trustworthy runnable target;
7. verify exact changed head and CI;
8. fresh-scan again;
9. replenish this same batch and cycle checkpoint;
10. log substantive evidence to Overseer#49.

## 16. Protected HOLD

No merge, approval, mark-ready, rebase, deployment, credential change, production write, unrestricted PowerShell, production autonomy, synthetic authority/Green/PRS/recovery state, general project-file mutation enablement, beta activation or overall GREEN claim.
