# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Cycle:** Frontend vertical cycle 005 — live-region and accessibility reconciliation  
**Fresh-scan context:** 2026-09-14, Australia/Brisbane  
**Reconciled main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Frontend contract PR:** #110 — OPEN / DRAFT / UNMERGED  
**Frontend implementation PR:** #111 — OPEN / DRAFT / UNMERGED  
**Current #111 head:** `72693c68eedbf4fff7c6a1f4ed573780eed0161c`  
**Predecessor exact-head CI:** #111 head `a639753edfbb1e9e52bea4da38597f0800279921`, AgentOS Tests #1019 and #1020 — SUCCESS  
**Current #111 exact-head CI:** AgentOS Tests #1041 — IN PROGRESS at batch refresh  
**Current #104 API head:** `9f53df16ae37ee6a86e66d2a808ca7f62f203d76`  
**Batch status:** ACTIVE  
**P0:** Level 2 / Founding-Beta trust, control and ordinary-user comprehension.

## 1. Mission

Translate AgentOS's canonical governed execution system into one coherent product for ordinary users without creating a second control plane.

> Chat for intent. Palette for speed. Inbox for attention. Jobs for repetition. Jack for authority. Isla for execution. Henry for proof.

The frontend owns comprehension, interaction quality, progressive disclosure, accessibility, responsive behavior and evidence presentation. Runtime, authority, persistence, mission state, scheduler, Green, PRS and execution remain canonical elsewhere.

Evidence > claims. Unknown state fails closed. Simple must not mean misleading.

## 2. Hard governance boundaries

This batch does not authorize merge, approval, ready transition, rebase, deployment, credential changes, production writes, unrestricted PowerShell, production autonomy, bypass of authority/Green/PRS, or beta activation.

Never create a duplicate scheduler, queue, registry, mission ledger, job database, authority layer, persistence layer, Green system, PRS system or frontend-owned execution truth.

Presentation rules:

- canonical runtime determines work state;
- canonical authority determines permission state;
- canonical evidence determines evidence presentation;
- Green determines completion-check disposition;
- PRS determines independent assurance / Henry disposition;
- stale or contradictory evidence is explicitly labelled;
- mockup/specification is never represented as shipped capability;
- no generic `VERIFIED` unless the verified object and scope are obvious;
- no `Stopped` unless canonical evidence confirms execution termination;
- no `Authority revoked` unless canonical durable revocation exists.

## 3. Current repository reality

### Main

`main` remains `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`.

Main still does not contain a complete mainstream AgentOS application shell. Richer Basic Chat remains draft-lineage work and must not be described as shipped current-main capability.

### Basic Chat / frontend implementation

PR #111 remains OPEN / DRAFT / UNMERGED on `frontend-overseer/basic-chat-plain-language`.

Current changed frontend/test surface:

- `ui/basic-chat.html`
- `ui/basic-chat.js`
- `ui/basic-chat.css`
- `tests/basic-chat-v1.test.mjs`
- `tests/basic-chat-accessibility-static.test.mjs`

This slice does not modify runtime authority, scheduler, persistence, Green, PRS, recovery, execution or production behavior.

### Level 2 runtime dependency

PR #104 remains OPEN / DRAFT / UNMERGED at API-reported head `9f53df16ae37ee6a86e66d2a808ca7f62f203d76`.

Its current body still reports:

- project-file mutation AMBER;
- unresolved continuous ownership race through publish/recovery/receipt;
- predecessor independent Green FAIL still controlling;
- no PRS PASS;
- authenticated transport + canonical grant lookup not yet wired;
- physical Windows acceptance not current-head-complete.

Therefore the frontend must continue withholding broad project-file mutation controls and claims.

## 4. Verified frontend work carried forward

### Plain-language status and errors

Implemented and exact-head tested on prior #111 heads:

- Ready
- Working
- Checking the result
- Finished — completion check passed
- Needs attention — work was not marked complete
- Paused — no new actions will start
- Stop requested — no new actions will start; the current action may still finish
- Unable to confirm status

Known runtime errors receive ordinary-user next-action copy while raw technical details remain expandable.

### `What happened` evidence summary

Implemented as a bounded presentation over current Basic Chat snapshot state and `lastTaskId` only.

It does not treat `lastTaskId` as a generic `runId`, does not fabricate a full Evidence Timeline and does not infer PRS/Henry from Green or worker success.

### Green versus Henry/PRS separation

Current UI separates:

- `Completion check` — Green-backed completion gate on this bounded local path;
- `Independent assurance` — Henry/PRS, currently shown as not available/not shown rather than inherited success.

### Stop semantics

Basic Chat Stop blocks future sends but does not cancel an already-running `wakeLocal()` call. The main runtime's `kill` primitive is terminal for a runtime instance, but Basic Chat Stop is not equivalent to canonical durable authority revocation.

Frontend wording therefore remains `Stop requested`, not `Execution stopped` or `Authority revoked`.

### Responsive/accessibility baseline

Predecessor exact head `a639753e...` has two successful AgentOS Tests runs (#1019 and #1020). The implementation includes:

- 44px minimum touch controls;
- visible `:focus-visible` treatment;
- wrapping controls;
- narrow-layout stacked composer;
- full-width Send on narrow screens;
- reduced-motion rules;
- flexible viewport-height behavior.

This is code/static-test evidence, not physical browser acceptance.

## 5. Cycle 005 execution — live-region correction

### Finding

Conversation history was marked `aria-live="polite"` while `render()` clears and rebuilds the full history each time. That creates a credible screen-reader noise/re-announcement risk.

### Implemented correction

Current #111 head `72693c68...`:

- removes `aria-live` from the rebuilt conversation transcript;
- makes the concise status field the polite atomic live region;
- keeps errors on `role="alert"`;
- associates Job controls with the truthful Pause/Stop caveat through `aria-describedby`;
- adds `aria-busy` to composer/form and updates it from the existing local `sending` presentation state;
- adds static regressions preventing transcript live-region reintroduction and checking busy-state wiring.

No backend state was invented. `aria-busy` represents browser request activity only.

### Verification state

At batch refresh, exact-head AgentOS Tests #1041 was IN PROGRESS. Do not call Cycle 005 PASS until exact-head CI concludes successfully.

## 6. Current claim matrix

| Capability / UX | Evidence class | Allowed treatment |
|---|---|---|
| Main fallback manager | PROVEN on main | Only at explicit local-fixture scope |
| Basic Chat | BETA/RC draft | Draft governed local chat, not shipped main |
| Plain-language status/errors | PROVEN on predecessor exact heads | Draft implementation claim with lineage scope |
| Evidence summary | BOUNDED draft evidence | `What happened`, not full timeline |
| Pause | Bounded capability | Prevents new work; do not imply active cancellation |
| Stop | Bounded request semantics | `Stop requested`; active action may finish |
| Green completion check | Runtime-backed on Basic Chat lineage | Completion check only |
| Henry/PRS in Basic Chat | NOT EVIDENCED as canonical field | No PASS display |
| Durable authority revoke | NOT EVIDENCED in Basic Chat | No revoke control or revoked claim |
| Jack permission card | BLOCKED on missing canonical user-facing authority fields | Design contract only |
| Controlled Windows mutation | AMBER / blocked by runtime assurance | Do not expose as generally available |
| Accessibility static baseline | PROVEN on predecessor #111 head | Static/code claim only |
| Live-region correction | CURRENT CI PENDING | No PASS until exact-head CI |
| Physical responsive/browser acceptance | NOT YET PROVEN | No production-ready claim |

## 7. Shared Simple / Essentials / Tech Head architecture

All modes share one canonical presentation model. Density changes; facts do not.

### Shared

- dominant Chat;
- current work state;
- attention entry point;
- truthful Pause/Stop controls when supported;
- authority summary;
- completion check;
- independent assurance when available;
- evidence summary;
- execution location when canonical;
- cost/capacity when canonical.

### Simple

- plain language;
- large controls;
- no raw IDs by default;
- `What happened` rather than logs;
- Jack explains authority;
- Isla explains execution;
- Henry explains independent assurance.

### Essentials

- mainstream target;
- current scope/state/evidence visible;
- technical detail on demand;
- Inbox/Jobs projections over canonical state.

### Tech Head

- same human summary first;
- raw IDs, policies, traces, receipts and diagnostics expandable;
- raw data never the sole explanation.

## 8. P0 execution queue

### P0-H1 — exact-head live-region CI

1. consume AgentOS Tests #1041;
2. if failure is frontend-regression-related, repair and rerun;
3. if unrelated runtime flake, classify precisely and do not borrow predecessor PASS;
4. record final exact-head evidence.

### P0-H2 — physical/browser narrow-layout acceptance

Need evidence beyond static CSS:

- desktop at normal width;
- narrow/mobile width around 320–390 CSS px;
- no horizontal scrolling for primary controls;
- composer remains visible/reachable;
- focus remains visible;
- Pause/Resume/Stop remain keyboard reachable;
- evidence disclosure usable without losing composer;
- status updates do not steal focus;
- transcript is not repeatedly announced by live-region semantics.

If no trustworthy browser/runtime harness is available, record this as blocked rather than claiming acceptance.

### P0-E2 — Jack permission presentation contract

Current authority admission evidence includes useful provenance/capability/scope fields but still lacks a complete user-facing contract for:

- reason in ordinary language;
- duration/expiry;
- one-shot/job/temporary semantics;
- reversibility;
- credential consequence;
- external communication/publication consequence;
- explicit cost/capacity consequence where applicable;
- canonical durable approval/revoke endpoint.

Do not implement clickable Allow/Revoke until canonical mutations exist.

### P0-I1 — recovery comprehension

Inspect canonical recovery states/events and define a presentation projection for:

- interrupted work;
- recovery required;
- recovery in progress;
- recovered but prior failure preserved;
- unable to confirm recovery.

No frontend recovery state machine.

### P0-G1 — Founding-Beta readiness screen

Only after trust/control/evidence semantics stabilize:

- plain local/test scope;
- one proven starter task;
- unavailable capabilities stated clearly;
- no pricing distraction;
- no unsupported autonomous computer-control claim.

## 9. P1 queue

### Inbox

Projection over canonical permission-required, blocked, verification-failed, recovery-required and completed-attention states. No new queue/database.

### Jobs

Map user-facing Job to canonical mission/task/schedule relationships before implementation. No frontend-owned Saved Jobs persistence.

### Palette

Expose user capabilities/actions, not backend commands. Availability must be evidence-backed.

### Evidence Timeline

Expand beyond `What happened` only when canonical per-job event/action/receipt read paths are proven. Preserve failures after recovery and show correlation gaps instead of synthesizing continuity.

## 10. Accessibility acceptance

Wave 0 requires:

- full keyboard operation;
- visible focus;
- concise live status without transcript spam;
- errors associated with operation;
- no color-only status;
- minimum touch target baseline;
- ordered textual evidence;
- no mascot required for comprehension;
- truthful screen-reader wording for Pause/Stop/verification;
- busy state scoped to UI request activity, not confused with runtime completion.

## 11. Responsive acceptance

Desktop:

- Chat dominant;
- trust/evidence details expandable;
- composer remains available.

Narrow/mobile:

- Chat first;
- controls wrap/stack;
- no primary horizontal scroll;
- permissions do not rely on hover;
- technical data collapsed by default;
- composer and Send remain reachable.

Static CSS alone does not satisfy physical/browser acceptance.

## 12. Founding-Beta questions

Measure whether testers can:

- give a first real job without coaching;
- understand Jack's requested authority;
- distinguish Working, Stop requested and confirmed Stopped;
- distinguish Green completion check from Henry/PRS assurance;
- identify what happened and what changed;
- recover from interruption without reading raw logs;
- understand why work was blocked;
- attempt a second real job unprompted.

Primary adoption signal: spontaneous second real job.

## 13. Runtime dependencies frontend must expose, not disguise

- Level 2 project-file mutation remains AMBER;
- current ownership race prevents safe mainstream mutation claims;
- authenticated transport/grant composition incomplete;
- Basic Chat Stop does not cancel in-flight wake execution;
- durable authority revocation not evidenced in Basic Chat;
- PRS/Henry not canonical in Basic Chat snapshot;
- broad Evidence Timeline read model not yet proven;
- Local/Cloud/Mixed not reliable across full product;
- mainstream cost/capacity data not yet consistently available.

## 14. Completion rule

Do not call the Founding-Beta frontend coherent until:

- Chat is ordinary-user readable;
- status adapter is fail-closed and exact-head tested;
- active work cannot show stale prior status;
- Stop wording matches runtime guarantees;
- error/recovery paths provide safe next actions;
- authority UI is backed by canonical authority mutations;
- evidence UI is backed by canonical evidence;
- Green and Henry/PRS remain visibly separate;
- live-region behavior is exact-head tested;
- responsive/browser acceptance has runtime evidence;
- Level 2 runtime/governance entry gates independently clear.

## 15. Protected HOLD

No merge/approval/ready/rebase/deployment/credentials/production writes/autonomy/unrestricted Windows mutation/synthetic authority/Green/PRS state/beta activation.

## 16. Next `cont` execution order

1. fresh-scan main, #104, #110, #111, current CI and Overseer#49;
2. consume exact-head #111 live-region CI;
3. repair any frontend failure, otherwise classify unrelated failure exactly;
4. attempt browser/narrow-layout acceptance using an available trustworthy harness; if unavailable, record blocker;
5. execute Jack permission-contract gap reconciliation;
6. inspect canonical recovery events for presentation-only recovery adapter;
7. fresh-scan again;
8. replenish this batch from live evidence;
9. record durable checkpoint to Overseer#49;
10. continue vertically into the highest-value safe unblocked item.

**Core principle:** make AgentOS feel like one trustworthy AI system, not a pile of AI infrastructure.
