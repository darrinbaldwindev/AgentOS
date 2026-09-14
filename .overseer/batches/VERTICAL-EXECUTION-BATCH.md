# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Cycle:** Frontend vertical cycle 006 — authority/control reconciliation  
**Fresh-scan context:** 2026-09-14, Australia/Brisbane  
**Reconciled main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Frontend contract PR:** #110 — OPEN / DRAFT / UNMERGED  
**Frontend implementation PR:** #111 — OPEN / DRAFT / UNMERGED  
**Current #111 head:** `5dc1551ea0dcbdb3f1c155b04b719215d69a19ef`  
**Current #111 exact-head CI:** AgentOS Tests #1071 — overall FAILURE; frontend assertions PASS; Windows lifecycle job PASS; sole Ubuntu failure is existing CLI SIGINT/null lifecycle assertion  
**Current #104 API head:** `83a58b8bd230550b5781a0fee700cca250819a75`  
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
- `tests/basic-chat-control-presentation-static.test.mjs`

This slice does not modify runtime authority, scheduler, persistence, Green, PRS, recovery, execution or production behavior.

### Level 2 runtime dependency

PR #104 remains OPEN / DRAFT / UNMERGED at current API head `83a58b8bd230550b5781a0fee700cca250819a75`.

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

Exact head `72693c68eedbf4fff7c6a1f4ed573780eed0161c` passed AgentOS Tests #1041, including the Windows Basic Chat lifecycle job. The implementation includes:

- 44px minimum touch controls;
- visible `:focus-visible` treatment;
- wrapping controls;
- narrow-layout stacked composer;
- full-width Send on narrow screens;
- reduced-motion rules;
- flexible viewport-height behavior;
- transcript removed from `aria-live`;
- concise polite atomic status live region;
- form/composer `aria-busy` scoped to local browser request state.

This remains code/static-test evidence, not physical browser acceptance.

## 5. Cycle 006 execution

### P0-H2 — browser/narrow acceptance boundary

No trustworthy running browser target for the unmerged draft lineage is available in this execution context. Physical responsive/browser acceptance remains explicitly BLOCKED rather than inferred from static CSS.

Required evidence remains:

- 320–390 CSS px narrow viewport;
- no primary horizontal overflow;
- composer and Send reachable;
- visible keyboard focus;
- Pause/Resume/Stop keyboard reachability;
- evidence disclosure usable without losing composer;
- status changes do not steal focus;
- transcript does not repeatedly announce due to live-region semantics.

### P0-E2 — Jack permission presentation contract

Created `docs/FRONTEND-JACK-PERMISSION-CONTRACT.md` on PR #110.

Current remote authority admission proves authenticated actor, trusted issuer, project provenance, requested/granted capabilities, authority evidence ID, mission/task/delivery/request IDs, target host, scope, constraints, objective and admission timestamp.

It still lacks enough canonical user-facing facts for a truthful interactive permission card, including:

- reason in ordinary language;
- permission lifetime / one-shot / job / session semantics;
- expiry;
- current revocation state;
- durable revoke operation and receipt;
- reversibility;
- credential consequence;
- external communication/publication consequence;
- data disclosure consequence;
- cost/capacity consequence;
- next approval boundary;
- mutation consequence.

The contract defines fail-closed rendering and explicitly separates:

- `Stop requested` = execution/control request;
- `Execution stopped` = canonical termination evidence;
- `Permission revoked` = canonical authority revocation evidence;
- `No further actions authorised` = only after canonical authority state proves no applicable grant remains.

No synthetic Allow/Revoke control was added.

### P0-J1 — canonical control availability presentation

Implemented on PR #111 current head `5dc1551ea0dcbdb3f1c155b04b719215d69a19ef`.

The browser now derives Pause/Resume/Stop availability from canonical Basic Chat snapshot flags instead of leaving every action enabled after each render:

- Pause disabled when paused or stopped;
- Resume enabled only while paused and never after Stop;
- Stop disabled after Stop;
- controls disabled while initial canonical state is unresolved;
- Stop remains available during an active send because Stop is a request that blocks future work, not immediate cancellation;
- control-request cleanup rerenders canonical state instead of blindly re-enabling the clicked control.

Added `tests/basic-chat-control-presentation-static.test.mjs`.

No backend control behavior changed.

### Exact-head CI #1071

AgentOS Tests #1071 (`34824296320`) completed FAILURE overall on exact current #111 head `5dc1551e...`.

Evidence classification:

- all new control-presentation tests PASS;
- accessibility/live-region tests PASS;
- Mission C Basic Chat V1 PASS;
- Windows-native Basic Chat lifecycle job PASS;
- Ubuntu full suite: 317 tests, 315 pass, 1 fail, 1 skip;
- sole failing assertion: `closest supported CLI signal path exits only after lock removal`, actual process signal `SIGINT` versus expected `null` in `tests/basic-chat-lifecycle.test.mjs:251`;
- npm audit skipped because the Ubuntu test step failed.

This is the known host-lifecycle signal class and is outside the frontend presentation changes. It is not masked or repaired from frontend code.

Therefore current evidence is:

- **control-presentation frontend slice: exact-head PASS assertions**;
- **Windows lifecycle job: exact-head PASS**;
- **overall workflow: FAIL**;
- **no exact-head overall PASS or overall GREEN claim**.

## 6. Current claim matrix

| Capability / UX | Evidence class | Allowed treatment |
|---|---|---|
| Main fallback manager | PROVEN on main | Only at explicit local-fixture scope |
| Basic Chat | BETA/RC draft | Draft governed local chat, not shipped main |
| Plain-language status/errors | PROVEN on prior exact heads | Draft implementation claim with lineage scope |
| Evidence summary | BOUNDED draft evidence | `What happened`, not full timeline |
| Pause | Bounded capability | Prevents new work; do not imply active cancellation |
| Stop | Bounded request semantics | `Stop requested`; active action may finish |
| Green completion check | Runtime-backed on Basic Chat lineage | Completion check only |
| Henry/PRS in Basic Chat | NOT EVIDENCED as canonical field | No PASS display |
| Durable authority revoke | NOT EVIDENCED in Basic Chat | No revoke control or revoked claim |
| Jack permission card | CONTRACT COMPLETE / implementation blocked | Read-only design contract; interactive actions blocked on canonical authority mutations |
| Controlled Windows mutation | AMBER / blocked by runtime assurance | Do not expose as generally available |
| Accessibility/live-region baseline | PROVEN at #111 head `72693c68...` | Static/code claim only |
| Control availability presentation | FRONTEND ASSERTIONS PASS at current head | No overall workflow PASS because unrelated lifecycle signal test is red |
| Physical responsive/browser acceptance | NOT YET PROVEN | No production-ready claim |
| Recovery projection | CONTRACT ONLY | No live state until canonical read path exists |

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

### P0-K1 — lifecycle dependency tracking

- do not alter runtime lifecycle code from the frontend branch;
- consume subsequent exact-head CI to determine whether the Linux SIGINT/null failure persists or is transient;
- keep frontend slice classification separate from whole-workflow status;
- require exact overall CI PASS before claiming the current #111 head is fully test-green.

### P0-H2 — physical/browser narrow-layout acceptance

Execute when a trustworthy runnable draft target/browser harness exists. Until then remain BLOCKED.

### P0-E3 — authority-field change detection

On every `cont`, inspect current #104 authority/admission contracts for new canonical fields covering expiry, lifetime, consequences or revoke semantics.

Only if those fields exist may the frontend proceed toward a read-only Jack adapter or interactive permission actions.

### P0-I2 — canonical recovery read path

Find a proven read-only way for Basic Chat to correlate its current task to privacy-safe recovery events without:

- guessing that `lastTaskId` is another identifier type;
- adding a second persistence layer;
- manufacturing event continuity;
- losing the original failure after recovery.

If no canonical read path exists, retain the contract-only recovery UX.

### P0-G1 — Founding-Beta readiness

Only after trust/control/evidence semantics and runtime entry gates stabilize:

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
- recovery event schemas are not yet a proven Basic Chat read model;
- Local/Cloud/Mixed not reliable across full product;
- mainstream cost/capacity data not yet consistently available;
- Linux Basic Chat CLI signal lifecycle assertion remains unstable/red on current exact head.

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
- control availability matches canonical state;
- responsive/browser acceptance has runtime evidence;
- current exact-head full CI is green for the intended release lineage;
- Level 2 runtime/governance entry gates independently clear.

## 15. Protected HOLD

No merge/approval/ready/rebase/deployment/credentials/production writes/autonomy/unrestricted Windows mutation/synthetic authority/Green/PRS state/beta activation.

## 16. Next `cont` execution order

1. fresh-scan main, #104, #110, #111, current CI and Overseer#49;
2. reconcile whether the Linux CLI-signal lifecycle failure persists on current/new head;
3. inspect #104 for new authority expiry/revoke/consequence fields;
4. seek a canonical read-only recovery projection for Basic Chat;
5. execute browser/narrow acceptance only if a trustworthy runnable target exists;
6. implement the next smallest truthful frontend slice that uses canonical state only;
7. exact-head verify and consume failures;
8. fresh-scan again;
9. replenish this batch and cycle record;
10. log durable checkpoint to Overseer#49.

**Core principle:** make AgentOS feel like one trustworthy AI system, not a pile of AI infrastructure.
