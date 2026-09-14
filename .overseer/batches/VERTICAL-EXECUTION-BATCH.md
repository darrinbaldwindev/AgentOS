# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Cycle:** Frontend vertical cycle 002 — replenished post-execution  
**Fresh-scan context:** 2026-09-14, Australia/Brisbane  
**Reconciled main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Frontend contract PR:** #110 — OPEN / DRAFT / UNMERGED  
**Frontend implementation PR:** #111 — OPEN / DRAFT / UNMERGED  
**Verified #111 head:** `d528f953201d299c823ffe12df1615f3396e278e`  
**Exact-head CI:** AgentOS Tests run #1000 — SUCCESS  
**Current #104 API head:** `a4d1a1baa104d76ae7667d5e079df4ffe87688a0`  
**Batch status:** ACTIVE  
**P0:** Level 2 / Founding-Beta trust, control and ordinary-user comprehension.

## 1. Mission

Translate AgentOS's canonical governed execution system into one coherent product for ordinary users without creating a second control plane.

> Chat for intent. Palette for speed. Inbox for attention. Jobs for repetition. Jack for authority. Isla for execution. Henry for proof.

The frontend owns comprehension and interaction quality. Runtime, authority, persistence, Green, PRS, scheduling, mission state and evidence remain canonical elsewhere.

Evidence > claims. Simple does not mean powerless. Advanced does not mean confusing.

## 2. Hard governance boundaries

This batch does not authorize merge, approval, ready transition, rebase, deployment, credential changes, production writes, production autonomy, unrestricted PowerShell or bypass of Jack/authority, Green or PRS.

Never create a duplicate scheduler, queue, worker registry, mission ledger, job database, authority system, persistence layer, memory system, Green system or PRS system.

Presentation rules:

- canonical runtime determines work state;
- canonical authority determines permission state;
- canonical evidence determines evidence presentation;
- Green determines completion-check disposition;
- PRS determines independent assurance / Henry disposition;
- unknown state fails closed;
- stale evidence is labelled historical/stale;
- mockups/specifications are never presented as implemented capability;
- no generic `VERIFIED` or reassuring green tick when the verified object and scope cannot be named.

## 3. Current repository reality

### Main

`main` remains `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`.

Current main still does not contain a complete mainstream AgentOS application shell. The explicit frontend on main remains concentrated in the self-contained fallback/prototype lane under `agents/ui/...`, while `package.json` exposes local runtime/test scripts rather than a settled full browser-app build surface.

Therefore the richer Everyday/Basic Chat experience remains draft-lineage work and must not be described as shipped current-main capability.

### Basic Chat / frontend implementation

PR #111 is stacked on the coherent Basic Chat Windows-repair lineage rather than rebasing or merging runtime work.

Current exact head `d528f953201d299c823ffe12df1615f3396e278e` modifies only:

- `ui/basic-chat.html`
- `ui/basic-chat.js`
- `tests/basic-chat-v1.test.mjs`

No frontend change in this slice modifies canonical runtime authority, scheduler, persistence, Green, PRS or execution semantics.

AgentOS Tests run #1000 completed SUCCESS against this exact current head.

### Level 2 runtime dependency

PR #104 remains OPEN / DRAFT / UNMERGED at current API head `a4d1a1baa104d76ae7667d5e079df4ffe87688a0`.

Its current evidence still records unresolved mutation ownership, admission and assurance limitations. Broad project-file mutation must therefore remain unavailable in mainstream frontend claims. The frontend cannot repair a missing runtime proof gate with copy or animation.

## 4. Cycle 002 — VERIFIED work

### F002-01 — ordinary-user Basic Chat primary copy

**VERIFIED** on exact current lineage.

Primary UI now leads with:

- `AgentOS Chat`
- `Working locally · Test actions only · Background work off`
- `What would you like AgentOS to do?`

Technical `DRY_RUN`, autonomy-disabled and Green-gate information remains available through progressive disclosure rather than being removed.

### F002-02 — truthful Stop language

**VERIFIED** for presentation scope.

The frontend does not claim immediate termination or infer confirmed stopped state from the existing Basic Chat control flag.

Current wording:

> Stop requested — no new actions will start; the current action may still finish.

This accurately reflects the current backend contract, where new work is blocked but an action already in progress is not proven immediately terminated.

### F002-03 — stale status during active send

**VERIFIED** by exact-head CI.

Previously the submit handler could briefly set `Status: WORKING` and then `render()` could replace it with the prior canonical snapshot state while the request was still running.

The presentation now gives active `sending` state precedence and shows `Working` throughout the in-flight request. No backend status is mutated.

### F002-04 — fail-closed status adapter

**VERIFIED** by exact-head CI.

Canonical chat states are translated to ordinary-user labels:

- READY -> Ready
- WORKING -> Working
- VERIFYING -> Checking the result
- COMPLETE -> Finished — completion check passed
- BLOCKED -> Needs attention — work was not marked complete
- PAUSED -> Paused — no new actions will start
- NEEDS_ATTENTION -> Needs attention
- unknown -> Unable to confirm status

The adapter is presentation-only. It does not create a second state machine.

### F002-05 — safe error comprehension

**VERIFIED** by exact-head CI.

The browser previously surfaced server/runtime error strings directly as the only user explanation.

The frontend now maps known errors to safe next actions while preserving the exact technical reason in a separate `Technical error details` disclosure.

Examples:

- paused -> resume before new work;
- stop requested -> restart local host before another job;
- scheduler conflict -> turn off scheduled checks;
- oversized message/request -> shorten and retry;
- unknown -> `AgentOS could not confirm what happened. Review the technical details before retrying.`

Unknown errors do not receive invented diagnoses.

### F002-06 — regression protection

**VERIFIED** by exact-head CI.

Tests now guard against presentation regressions including:

- `Stop immediately`;
- generic `VERIFIED`;
- raw appended `· STOPPED`;
- raw appended `· PAUSED`;
- hard-coded `Status: WORKING` path that can be overwritten by stale state;
- loss of technical error-detail disclosure;
- loss of safe next-action error copy.

### F002-07 — concurrency reconciliation

**VERIFIED process behavior.**

A test-file update received GitHub 409 because another commit changed the blob during this cycle. The stale write was not forced. The new blob was re-read, its newer change preserved, and the additional regression assertions were applied against the fresh SHA.

## 5. Current claim matrix

| Capability / UX | Evidence class | Allowed treatment |
|---|---|---|
| Main fallback manager | PROVEN on main | May describe only at its explicit self-contained/local-fixture scope |
| Basic Chat interface | BETA/RC draft evidence | May describe as draft governed local chat, not shipped main |
| Plain-language chat copy/status/errors | PROVEN on #111 exact head | Current draft implementation claim allowed with branch scope stated |
| Pause | Bounded draft capability | May say it prevents new work; active action caveat still required where applicable |
| Stop | Bounded request semantics | `Stop requested`; do not say execution definitely terminated |
| Green completion check | Runtime-backed on Basic Chat lineage | Present as completion check, not independent assurance |
| Henry / PRS in Basic Chat | NOT YET EVIDENCED as a frontend field | Do not show PASS unless canonical PRS evidence is available |
| Controlled Windows mutation | NOT YET SUPPORTABLE generally | Do not expose as mainstream available action |
| Evidence Timeline | PRODUCT DIRECTION / next implementation target | Build only as projection over canonical evidence |
| Jack permission card | PRODUCT DIRECTION with runtime dependency | Adapter/spec first; no synthetic approvals |
| Inbox / Jobs / Palette | PRODUCT DIRECTION | Design against canonical sources only |

## 6. Shared Simple / Essentials / Tech Head architecture

All three modes use one shell and one truth source. Progressive disclosure changes density, not facts.

### Shared in every mode

- dominant Chat;
- current work state;
- attention entry point;
- Pause/Stop access when supported;
- authority summary;
- completion-check summary;
- independent-assurance summary when available;
- evidence summary;
- execution location when known;
- cost/capacity when known.

### Simple

- large controls;
- plain language;
- no raw IDs/providers/policies by default;
- `What happened` instead of logs;
- Jack explains boundaries;
- Isla explains current work;
- Henry explains independent assurance.

### Essentials

- mainstream target;
- current step, scope, evidence, cost/location visible where real;
- compact technical details on demand;
- Inbox/Jobs filtering without backend jargon.

### Tech Head

- same human summary first;
- raw IDs, models/providers, policies, receipts, correlation, traces and diagnostics expandable;
- raw data never becomes the sole explanation.

## 7. Smallest coherent Founding-Beta frontend

Wave 0 requires one trustworthy real-job loop:

1. readiness / beta scope;
2. dominant Chat;
3. intent restatement for consequential work;
4. Jack permission card where authority is required;
5. current work / Isla state;
6. truthful Pause / Stop;
7. `What happened` evidence summary;
8. Green completion-check result;
9. Henry/PRS independent assurance if available;
10. recovery / blocked state;
11. minimal attention queue derived from canonical state;
12. obvious return to Chat.

Do not activate beta recruitment merely because frontend assets are ready. Level 2 runtime entry gates remain controlling.

## 8. P0 next queue — execute before broader UI expansion

### P0-C1 — canonical `What happened` evidence discovery

**NEXT.**

- inspect the existing durable artifacts/events produced by `wakeLocal` and Basic Chat;
- identify the canonical read path available from the Basic Chat server without creating new storage;
- determine whether `lastTaskId` can safely correlate to task/run/mission/evidence records;
- inventory fields that are genuinely user-relevant: request, action, target, result, check state, timestamp, receipt/evidence pointer;
- identify unavailable fields explicitly;
- do not create synthetic timeline events.

### P0-C2 — smallest Evidence Summary implementation

Eligibility: only after C1 confirms a canonical read path.

Initial surface may be `What happened`, not yet a full Evidence Timeline.

Minimum truthful states:

- no job yet;
- evidence available;
- completion check pending;
- completion check passed;
- work blocked / not marked complete;
- evidence unavailable;
- evidence stale for current state.

Technical IDs remain hidden in Simple and expandable in Essentials/Tech Head.

### P0-D1 — Green versus Henry/PRS reconciliation

- inspect the exact Green result object available from local wake;
- inspect whether PRS result is durably accessible on the current Basic Chat lineage;
- define two separate presentation channels:
  - `Completion check` = Green;
  - `Independent assurance` = Henry / PRS;
- if PRS is absent, show `Independent assurance not available for this job` rather than neutral success;
- never inherit Henry PASS from Green PASS.

### P0-E1 — Jack permission adapter discovery

- inspect authority/grant contracts on current AgentOS runtime/remote bridge;
- identify canonical fields for requested action, target, scope, duration, consequence, credentials, external contact, reversibility and policy result;
- report missing backend fields;
- do not wire approval actions until a canonical mutation endpoint exists.

### P0-F1 — Stop / Revoke runtime dependency report

- document what current Stop does and does not prove;
- identify whether active in-flight wake cancellation exists;
- identify evidence required to claim `Execution stopped`;
- separate Stop from authority Revoke;
- specify runtime contract needed for `No further actions authorised` and confirmed `Stopped`.

### P0-G1 — beta readiness onboarding

After claim matrix is stable:

- one-page readiness screen;
- local/test/bounded scope in plain language;
- one proven starter task;
- clear unavailable capabilities;
- no pricing distraction;
- no unsupported autonomous-computer-control claims.

## 9. P1 queue — everyday usability after P0 trust loop

### Inbox

Build as a filtered projection over canonical permission-required, blocked, verification-failed, recovery-required and completion states. No new queue/database.

### Jobs

Reconcile terminology with canonical mission/task/schedule objects before implementation. Saved Jobs must not become frontend-owned persistence.

### Palette

Expose user actions/capabilities, not implementation commands. Capability availability must be evidence-based.

### Responsive / accessibility

- inspect current CSS against desktop/narrow layout;
- keyboard/focus behavior;
- live-region noise;
- button busy/disabled semantics;
- screen-reader truthful Stop/Pause announcements;
- touch target sizing;
- reduced-motion readiness;
- ordered-text evidence fallback.

### Character-function discipline

- Willow = planning/clarification;
- Isla = current execution;
- Jack = authority/risk/boundaries;
- Henry = independent assurance.

Characters never replace authoritative text.

## 10. Runtime dependencies that frontend must expose, not disguise

- project-file mutation remains blocked from general claim by current Level 2 assurance gaps;
- authenticated admission/grant composition remains incomplete;
- Basic Chat stop does not prove immediate termination of an in-flight action;
- Basic Chat does not yet expose proven durable authority revocation;
- PRS/Henry state is not yet established as a canonical frontend field;
- full evidence projection into Basic Chat is not yet reconciled;
- Local / Cloud / Mixed placement is not yet reliable across the product;
- mainstream cost/capacity data is not yet available for a truthful dashboard.

## 11. Accessibility acceptance for Wave 0

Required:

- full keyboard operation;
- visible focus;
- descriptive labels;
- useful live status without focus theft;
- errors associated with the affected operation;
- no color-only risk/assurance;
- touch-appropriate targets;
- ordered textual evidence;
- no mascot required for comprehension;
- truthful state announcements for Pause/Stop/verification.

## 12. Responsive acceptance for Wave 0

Desktop: Chat dominant, current-work/trust rail collapsible, evidence expandable without losing composer.

Narrow/mobile: Chat first; authority/work/evidence stack; controls reachable without horizontal scrolling; permissions do not rely on hover; Tech Head raw data collapsed by default.

No responsive implementation claim exists until browser/runtime evidence supports it.

## 13. Founding-Beta product questions

Measure whether testers can:

- give a first real job without coaching;
- explain what Jack is asking to allow;
- distinguish working, stop-requested and actually stopped;
- distinguish completion check from independent assurance;
- recover from interruption without reading logs;
- identify what changed;
- understand why work was blocked;
- attempt a second real job unprompted.

Primary early adoption signal: spontaneous second real job.

## 14. Completion rule for this frontend phase

Do not call the Founding-Beta frontend coherent until:

- Chat is ordinary-user readable;
- status is fail-closed and exact-head tested;
- active work cannot show stale prior status;
- Stop language matches runtime guarantees;
- error/recovery paths provide safe next actions;
- permission UI is backed by canonical authority;
- evidence UI is backed by canonical evidence;
- Green and Henry/PRS are visibly separate;
- accessibility baseline is verified;
- responsive behavior has browser/runtime evidence;
- Level 2 runtime/governance entry gates independently clear.

## 15. Protected HOLD

No merge or ready transition for #110/#111; no rebase; no deployment; no credentials; no production writes/autonomy; no unrestricted Windows mutation; no synthetic authority/Green/PRS state; no beta activation solely from frontend readiness.

## 16. Next `cont` execution order

1. fresh-scan main, #104, #110, #111, CI and Overseer#49;
2. reconcile this batch;
3. execute P0-C1 canonical evidence discovery;
4. implement P0-C2 only if a real read path exists;
5. execute P0-D1 Green-versus-Henry reconciliation;
6. if evidence path blocks, move immediately to P0-E1 Jack contract discovery rather than starving the cycle;
7. verify exact changed heads and CI;
8. second fresh scan;
9. replenish this same batch at maximum useful depth;
10. log the checkpoint durably to Overseer#49.

**Core principle:** make AgentOS feel like one trustworthy AI system, not a pile of AI infrastructure.
