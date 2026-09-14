# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Cycle:** Frontend vertical cycle 002  
**Fresh scan:** 2026-09-14 16:31 Australia/Brisbane  
**Reconciled main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Frontend contract PR:** #110, draft  
**Frontend implementation PR:** #111, draft  
**Current #111 head:** `36fbe7ba3379e0f693b1247b20e494cd0b34e188`  
**Current #104 API head:** `a4d1a1baa104d76ae7667d5e079df4ffe87688a0`  
**Status:** ACTIVE — Level 2 / Founding-Beta trust and usability are P0.

## 1. Mission

Make AgentOS feel like one trustworthy AI system rather than a developer dashboard over multiple technical subsystems.

The frontend translates canonical AgentOS intent, authority, execution, evidence, recovery, Green and PRS state into a product ordinary users can understand. It must never become an alternate scheduler, queue, authority store, mission ledger, persistence layer, memory system, Green system, PRS system or source of truth.

North-star interaction model:

> Chat for intent. Palette for speed. Inbox for attention. Jobs for repetition. Jack for authority. Isla for execution. Henry for proof.

The immediate product objective is not the broadest interface. It is the smallest coherent Everyday / Founding-Beta loop that makes a real governed job understandable from request to evidence.

## 2. Governance boundaries

This batch does not authorize merge, approve, mark-ready, rebase, deploy, credential changes, production writes, production autonomy, unrestricted PowerShell, authority bypass, Green bypass, PRS bypass or product claims unsupported by exact evidence.

Frontend rules:

- canonical runtime state controls work state;
- canonical authority controls permissions;
- canonical evidence controls evidence presentation;
- Green controls Green disposition;
- PRS controls Henry/independent assurance disposition;
- predecessor evidence is historical, never silently promoted to a newer head;
- unknown state fails closed in the presentation layer;
- mockups and specs are labelled as design work, not capability;
- no generic reassuring badges when the exact verified object/scope cannot be named.

## 3. Fresh-scan state

### Main

`main` remains `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`.

Current main still does not contain a coherent end-user AgentOS shell. The explicit frontend implementation on main is primarily the self-contained fallback/prototype lane under `agents/ui/...`. `package.json` continues to expose local runtime/test scripts rather than a complete browser application build/dev surface.

Therefore the Basic Chat/Everyday frontend must still be described as draft lineage work, not a current-main shipped capability.

### Basic Chat lineage

The coherent Basic Chat experience remains on stacked draft lineages derived from the V1 chat work and Windows lifecycle repairs.

Frontend PR #111 is stacked on `work/batch-windows-boundary` / PR #102 rather than rebasing or merging those runtime branches. This preserves the backend lineage and keeps the frontend change bounded.

PR #111 predecessor exact head `d42b86aca13d6222a88cc1363d16b1b9d4f383ff` completed AgentOS Tests run #985 successfully. That evidence certifies that exact frontend presentation head only.

Cycle 002 added a further frontend-only status-mapping change. The new #111 exact head is `36fbe7ba3379e0f693b1247b20e494cd0b34e188`; AgentOS Tests run #989 was queued at the last check. Do not borrow #985 PASS for the new head.

### Level 2 dependency

PR #104 remains OPEN, DRAFT and UNMERGED. API metadata reports head `a4d1a1baa104d76ae7667d5e079df4ffe87688a0` while its body contains a checkpoint narrative referring to another exact implementation checkpoint. Treat API head as current branch identity and checkpoint claims as scoped historical evidence until reconciled.

The PR still records unresolved project-file mutation ownership, authenticated admission and current-head acceptance/assurance. Its own body states that mutation remains AMBER and must not be enabled. The frontend therefore must not offer broad file mutation or imply dependable autonomous Windows editing.

## 4. Evidence classes for current frontend

### PROVEN — current main scope

- self-contained fallback/recovery React component exists;
- its explicit no-provider/no-credential/no-persistence boundary is documented in code;
- local fixtures/prototype and accessibility-oriented interaction patterns exist.

### PROVEN — exact draft frontend head only

At #111 predecessor head `d42b86...`:

- primary Basic Chat copy was changed from engineering-first to ordinary-user wording;
- technical `DRY_RUN`, autonomy and Green details remained available through disclosure;
- Stop copy preserved the runtime caveat that an action already in progress may finish;
- regression assertions rejected `Stop immediately` and generic `VERIFIED` overclaims;
- exact-head AgentOS Tests run #985 succeeded.

### ACTIVE / awaiting exact-head verification

At #111 head `36fbe7ba...`:

- raw user-visible enum labels are replaced with a presentation-only mapping;
- active `sending` state now wins over stale previous state so the UI cannot revert to an earlier status during an in-flight request;
- STOPPED is not inferred from the frontend `stopped` flag;
- stopped presentation is `Stop requested — no new actions will start; the current action may still finish`;
- unknown states render `Unable to confirm status`;
- test assertions lock this fail-closed wording.

This head is ACTIVE until exact-head CI passes.

## 5. Current ordinary-user experience

### What works in the draft Basic Chat slice

- large conversation surface;
- persistent composer;
- conversation restore;
- Pause / Resume / Stop controls;
- bounded local governed wake path;
- clear local/test/background-off summary;
- technical-details disclosure;
- ordinary-user task prompt;
- fail-closed status presentation in current frontend work.

### What is still missing

- first-run onboarding;
- preflight intent review for consequential actions;
- Jack permission card;
- explicit temporary-authority visibility;
- Evidence Timeline;
- independent Henry/PRS presentation;
- minimal Inbox;
- persistent Jobs surface based on canonical mission/job state;
- recovery-required screen;
- connector permission centre;
- Restricted Mode UI;
- device trust;
- Local / Cloud / Mixed execution placement;
- cost/capacity presentation;
- complete responsive acceptance;
- browser-based end-to-end beta acceptance.

## 6. Shared product architecture — Simple / Essentials / Tech Head

All three modes use the same canonical data and the same product shell. They differ only in density and progressive disclosure.

### Shared surfaces

1. Chat — dominant intent surface.
2. Current work — one understandable job card.
3. Attention — Inbox entry point for things requiring a user decision.
4. Authority — Jack presentation based on canonical policy/grant state.
5. Evidence — human-readable timeline derived from canonical evidence.
6. Assurance — Green and Henry/PRS shown separately.
7. Control — Pause / Stop / Revoke only when supported by canonical behavior.
8. Settings — mode/profile/cost/connector controls as supported.

### Simple

- no raw IDs, model names, cron, policy objects or runtime enums by default;
- very large controls;
- plain-language status;
- Jack explains permissions and blocks;
- Henry explains whether the result was actually checked;
- Evidence is labelled `What happened`.

### Essentials

- mainstream target;
- current step, scope, evidence, cost and location visible when known;
- compact technical disclosure available;
- useful filtering in Inbox/Jobs without exposing backend implementation details.

### Tech Head

- same human summary first;
- expandable raw runtime/provider/model/policy/correlation/evidence data;
- machine-readable receipt/export surfaces where canonical data exists;
- never substitutes raw logs for the plain-language state.

## 7. P0 trust/control contracts

### Work state

Frontend vocabulary must be derived from canonical state and remain conservative:

- Ready
- Preparing
- Waiting for permission
- Working
- Checking the result
- Pause requested
- Paused — no new actions will start
- Stop requested — no new actions will start; current action may still finish
- Recovery required
- Needs attention
- Finished — completion check passed
- Unable to confirm status

Do not display `Stopped` until the runtime supplies sufficient evidence to confirm termination/no active execution at the relevant scope.

### Authority / Jack

Jack answers:

- what AgentOS wants to do;
- why;
- exact target/scope;
- duration;
- reversibility;
- credential/external-contact implication;
- cost/capability implication if known;
- what remains prohibited;
- what requires a new approval.

Preferred actions when canonical authority supports them:

- Allow once
- Allow for this job
- Deny
- View details

Do not invent `Always allow` or durable permission persistence from frontend state.

### Verification

Worker execution success is not generic `Verified`.

Allowed scoped examples:

- Completion check passed for this task.
- 12 tests passed for this exact run output.
- Green PASS at the stated completion scope.
- Henry / PRS PASS at the stated independent-assurance scope.

If evidence is stale for current head/state, say so explicitly.

### Stop / Pause / Revoke

Pause and Stop are execution/control requests. Revoke is authority withdrawal. Do not merge them conceptually.

Required states eventually include:

- Pause requested
- Pausing after current safe boundary
- Paused
- Stop requested
- Stopping / active action may still finish
- No further actions authorised
- Execution stopped, only when proven
- Unable to confirm stop

`Revoke` remains BLOCKED for UI implementation until canonical revocation semantics are exposed to the frontend contract.

## 8. Evidence Timeline minimum viable design

The smallest coherent timeline should adapt existing canonical evidence rather than create a new event store.

User-facing event order:

1. **You asked** — normalized request.
2. **AgentOS prepared** — bounded intended step when evidence exists.
3. **Jack checked** — authority decision/scope when canonical authority evidence exists.
4. **Isla started** — execution start / placement when known.
5. **Action performed** — human-readable operation + target.
6. **Change recorded** — receipt / affected objects when applicable.
7. **Completion check** — Green result and evidence scope.
8. **Henry checked** — PRS independent assurance when applicable.
9. **Recovered** — preserve interruption/recovery evidence rather than rewriting history.
10. **Finished / needs attention** — bounded terminal presentation.

P0 rule: missing events must not be fabricated to make the story look complete. The timeline should show `Not available for this job` where necessary.

## 9. Smallest coherent Founding-Beta frontend

Wave 0 should require one complete loop, not a broad dashboard:

1. readiness/welcome state;
2. one dominant Chat;
3. clear intent restatement where consequential work is proposed;
4. Jack permission card when authority is required;
5. current work / Isla card;
6. truthful Pause / Stop behavior;
7. evidence summary/timeline;
8. Green completion-check result;
9. Henry/PRS status if independent assurance applies;
10. recovery / blocked presentation;
11. minimal attention queue derived from canonical attention states;
12. one obvious route back to Chat.

Wave 0 entry remains dependent on runtime Level 2 gates and must not be activated from frontend readiness alone.

## 10. Accessibility P0

Before Wave 0:

- keyboard operation for chat and controls;
- visible focus;
- descriptive accessible names;
- status announcements via appropriate live region without focus theft;
- errors associated with the affected operation;
- no color-only risk/verification information;
- 44px-class practical touch targets where feasible;
- reduced-motion support for future progress animation;
- evidence timeline available as ordered text;
- clear headings/landmarks;
- no mascot animation required to understand state;
- button disabled/busy state understandable to assistive technology;
- Stop/Pause state changes announced with truthful caveats.

## 11. Responsive P0

### Desktop

- Chat remains visually dominant;
- trust/current-work rail can collapse;
- Inbox/Jobs/Settings must not turn Chat into a small dashboard tile;
- evidence can expand without removing composer access.

### Narrow/mobile

- Chat first;
- current work, authority and evidence stack beneath/behind sheets;
- Stop/Pause reachable without horizontal scrolling;
- permission actions never depend on hover;
- Tech Head raw data collapsed by default;
- long evidence IDs wrap without breaking layout.

No responsive implementation claim exists yet.

## 12. Cycle 002 work executed

### F002-01 — consume #111 prior exact-head CI

**State:** VERIFIED for exact head `d42b86aca13d6222a88cc1363d16b1b9d4f383ff` only.

Evidence: AgentOS Tests run #985 completed SUCCESS.

### F002-02 — inspect canonical chat status contract

**State:** VERIFIED inspection.

`runtime/local-chat.mjs` supplies `READY`, `WORKING`, `VERIFYING`, `COMPLETE`, `BLOCKED`, `PAUSED`, `NEEDS_ATTENTION` plus `paused`, `stopped`, `ready`, `lastTaskId` and history. The current backend stop control sets `stopped` but does not prove immediate termination of an already-running action. Therefore frontend confirmation wording must remain conservative.

### F002-03 — fix stale-status-during-send presentation

**State:** ACTIVE pending exact-head CI.

Changed `ui/basic-chat.js` so `sending` maps directly to `Working` before any previous snapshot status is displayed. This fixes the previous render path that could overwrite a temporary working label with stale prior state.

### F002-04 — fail-closed user status mapper

**State:** ACTIVE pending exact-head CI.

Mapped canonical states to ordinary-user labels without modifying backend semantics. Unknown values become `Unable to confirm status`. `stopped` becomes Stop requested, not confirmed stopped.

### F002-05 — regression assertions

**State:** ACTIVE pending exact-head CI.

The Basic Chat server test now checks the served JS for completion/check/block/stop/unknown wording and ensures raw appended `· STOPPED`, `· PAUSED`, `Status: WORKING`, generic `VERIFIED` and `Stop immediately` patterns do not return.

### F002-06 — exact-head CI

**State:** ACTIVE.

AgentOS Tests run #989 queued for current #111 head `36fbe7ba3379e0f693b1247b20e494cd0b34e188` at last check. Do not promote until the run completes successfully.

## 13. Priority queue — maximum useful next batch

### P0-A — complete current status slice

1. Consume run #989 exact-head result.
2. If failure: inspect the failing job/test, repair only the frontend/test regression, rerun exact-head CI.
3. If success: mark #111 current presentation slice VERIFIED at its exact scope.
4. Inspect PR #111 diff again to ensure no runtime/control-plane files changed unexpectedly.
5. Update #111 body with exact-head evidence and remaining limits.

### P0-B — Basic Chat failure/recovery comprehension

1. Inspect `runtime/basic-chat-server.mjs` error payloads and current `local-chat` interruption behavior.
2. Inventory exact machine error strings that can reach an ordinary user.
3. Define a presentation-only error mapper for known cases: scheduler enabled, chat already running/recovery required, interrupted before response, safe-mode mismatch, unknown error.
4. Keep raw technical reason available through details.
5. Unknown errors must use `AgentOS could not confirm what happened` plus safe next action, not invented diagnosis.
6. Add regression tests ensuring raw stack/runtime jargon is not the sole user-facing explanation.

### P0-C — minimal Evidence Summary using existing canonical state

1. Identify which durable artifacts/events are already accessible to Basic Chat without adding storage.
2. Determine whether last task ID can safely link to an existing canonical run/evidence read path.
3. Build the smallest read-only `What happened` summary only if canonical evidence can be retrieved without a new frontend database.
4. Initial allowed fields: request, task identifier in technical details, completion-check state, blocked reason, timestamp if canonical.
5. Do not call this an Evidence Timeline until multiple canonical evidence events are actually available.
6. Add empty/unavailable states rather than synthetic events.

### P0-D — Green versus Henry/PRS presentation

1. Inspect canonical Green result object used by Basic Chat/local wake.
2. Identify whether PRS result is available on the same lineage.
3. Define explicit UI separation:
   - `Completion check` = Green;
   - `Independent assurance` = Henry/PRS.
4. If PRS is unavailable in this slice, show `Independent assurance not available for this job` rather than a neutral green tick.
5. Never inherit Henry PASS from Green PASS.

### P0-E — Jack permission contract against real authority seams

1. Inspect current authority/grant interfaces on #104/remote-bridge lineage and main.
2. Identify the smallest canonical authority data contract a frontend could read.
3. Draft adapter fields: action, target, scope, duration, consequence, credential use, external communication, reversibility, policy result.
4. Do not implement approval buttons until the canonical write/control endpoint exists for the relevant lineage.
5. Document missing backend fields explicitly for engineering.

### P0-F — Stop/Revoke backend dependency report

1. Document current Basic Chat Stop semantics precisely.
2. Determine whether active in-flight wake can be cancelled at a canonical safe boundary.
3. Determine what evidence exists to confirm no further actions can run.
4. Separate job stop from authority revoke.
5. Produce implementation-ready backend requirements for confirmed Stopped / Revoked UI states.

### P0-G — Founding-Beta first-run readiness

1. Draft a minimal readiness screen based only on proven beta scope.
2. Explain local/test-only limitations without engineering jargon.
3. State what AgentOS can currently do on the beta lineage.
4. State what it cannot yet do.
5. Provide one safe starter task based on bounded proven operations only.
6. Hold implementation behind runtime/acceptance evidence if claims cannot be kept current.

### P1-A — minimal Inbox architecture

1. Find canonical states representing permission required, blocked, verification failure, recovery required and completion.
2. Design Inbox as a filtered projection over canonical state, not a new queue/database.
3. Specify item identity/correlation and stale-event handling.
4. Do not implement until a reliable read contract exists.

### P1-B — Jobs architecture

1. Reconcile job terminology against mission/task canonical objects.
2. Determine which object represents repeatable/scheduled user work.
3. Avoid frontend-owned Saved Jobs persistence.
4. Define Simple/Essentials/Tech Head views over the same underlying record.

### P1-C — Palette

1. Define command categories that route to existing product actions rather than backend implementation commands.
2. Keep capability availability evidence-based.
3. Disabled/unavailable actions must explain why rather than silently disappear where comprehension benefits.

### P1-D — responsive/accessibility acceptance

1. Inspect current CSS.
2. Add keyboard/focus tests feasible in the current dependency-light architecture.
3. Audit live-region behavior: conversation and status must not create excessive repeated announcements.
4. Check control labels, target sizes and narrow viewport behavior.
5. Add `prefers-reduced-motion` contract if motion appears later.

### P1-E — characters as functional UI

1. Jack appears only at authority/policy boundaries.
2. Isla appears only for execution/current work.
3. Henry appears only for independent assurance.
4. Willow appears for plan/intent clarification.
5. No mascot should be needed to understand a state; text remains authoritative.

### P2 — later ecosystem

HOLD until Level 2 and Founding Beta are coherent:

- Connector Centre expansion;
- verified capability store;
- publisher identities;
- signed/versioned capability manifests;
- organisation allowlists;
- private capability registries;
- capability rollback/update UX.

## 14. Runtime/backend dependencies to report, not hide

Current important dependencies:

- no safe current-head general mutation claim from PR #104;
- authenticated admission/grant composition remains incomplete;
- Basic Chat stop flag does not prove immediate termination of an in-flight action;
- durable authority revocation contract is not evidenced in Basic Chat;
- PRS result is not yet evidenced as a Basic Chat presentation field;
- full user-facing evidence feed has not yet been reconciled to Basic Chat;
- execution placement data is insufficient for a truthful Local / Cloud / Mixed indicator across the product;
- cost/capacity data is insufficient for a truthful mainstream cost dashboard in this slice.

These are product requirements, not UI inconveniences. Do not mask them with animations or optimistic copy.

## 15. Founding-Beta acceptance questions

Wave 0 frontend must gather evidence for:

- Can an ordinary user describe a first real job without help?
- Can they explain what Jack is asking permission for?
- Can they tell whether an action is currently running, merely requested to stop, or actually stopped?
- Can they distinguish job completion from independent assurance?
- Can they recover from an interrupted/blocked task without reading logs?
- Can they identify what changed?
- Can they find why AgentOS refused an action?
- Can they attempt a second real task without being prompted?

Primary adoption signal remains spontaneous second real job use.

## 16. Completion criteria for this frontend phase

Do not call the Everyday/Founding-Beta frontend coherent until at minimum:

- Chat is dominant and ordinary-user readable;
- state presentation is fail-closed and tested;
- active work cannot display stale prior status;
- Stop semantics are truthful;
- permission presentation maps to canonical authority;
- evidence summary maps to canonical evidence;
- Green and PRS/Henry are visibly distinct;
- failures/recovery are understandable;
- keyboard/accessibility baseline is tested;
- responsive layout has browser/runtime evidence;
- Wave 0 technical entry gate is independently cleared by the runtime/governance workstreams.

## 17. Protected actions / HOLD

Remain unauthorized:

- merge #110 or #111;
- mark either ready;
- rebase runtime lineages;
- deploy any UI;
- enable production autonomy;
- add credentials;
- activate general Windows mutation;
- synthesize authority/Green/PRS state in frontend code;
- recruit/activate Founding Beta solely because frontend assets exist.

## 18. Next trigger rule

On `cont` / `continue autonomously`:

1. fresh-scan main, #104, #110, #111, exact-head CI and Overseer#49;
2. reconcile this batch against live state;
3. consume #111 CI first;
4. repair failures if any;
5. then execute P0-B failure/recovery comprehension and P0-C evidence-summary discovery in the same cycle where safe;
6. verify exact changed heads;
7. fresh-scan again;
8. replenish this same batch at maximum useful depth;
9. durably checkpoint substantive results to Overseer#49.

**Core rule:** evidence > claims; simple does not mean powerless; advanced does not mean confusing; governance the user cannot understand is incomplete product design.
