# AgentOS Frontend Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical portfolio coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Frontend Overseer  
**Purpose:** make the governed AgentOS system understandable, usable and trustworthy to the person sitting in front of it without creating a duplicate control plane.  
**Last fresh scan:** 2026-09-14, Australia/Brisbane context  
**Reconciled main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Relevant draft heads reviewed:** PR #104 open/draft/unmerged; PR #87 Basic Chat RC `90ebe42289990b3c6d054aac37b278eaf6554144`; PR #99 novice-chat feedback `5abda2dfdb5464adb412fea76f43939800d9b906`  
**Batch status:** ACTIVE

## 1. Mission

Translate canonical AgentOS runtime, authority, evidence, Green and PRS state into one coherent product experience.

Product interaction model:

> Chat for intent. Palette for speed. Inbox for attention. Jobs for repetition. Jack for authority. Isla for execution. Henry for proof.

The frontend presents canonical state. It must not become a hidden source of truth.

## 2. Governance boundaries

This batch does **not** authorize merge, approval, ready transition, rebase, deployment, credential changes, production writes, production autonomy, bypass of Jack/Green/PRS, or creation of duplicate scheduler, queue, worker registry, mission ledger, authority, persistence, memory, governance, Green or PRS systems.

Frontend state must be derived from canonical runtime/evidence/authority surfaces or explicitly marked mock/prototype/local-only.

Evidence > claims. PRODUCT DIRECTION must never be rendered as current capability.

## 3. Fresh-scan evidence summary

### Main branch

Current `main` is `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`.

The default branch does **not** contain a coherent end-user AgentOS application shell. Its explicit UI implementation is currently concentrated in:

- `agents/ui/components/IntegrationFallbackManager.tsx`
- `agents/ui/prototype/agentos_fallback_sample.html`
- fallback/local mock API, fixtures and tests

`package.json` exposes runtime/local scripts and tests but no browser application build/dev script.

The default branch does contain important canonical backend primitives that a future frontend should adapt rather than duplicate, including evidence, run inspection, pause/resume, recovery, verification, authority/control and Green-related code.

### Basic Chat lineage

A real Basic Chat surface exists in open draft lineages rather than current `main`.

PR #87 includes:

- `runtime/local-chat.mjs`
- `runtime/basic-chat-server.mjs`
- `ui/basic-chat.html`
- `ui/basic-chat.css`
- `ui/basic-chat.js`
- pause/resume/stop
- conversation restore
- loopback-only local operation

PR #87 remains OPEN, DRAFT and UNMERGED. Its UI therefore cannot be described as shipped/current-main capability.

PR #99 is a later novice-feedback repair on a stacked lineage. It reports pending-chat feedback and local host launch improvements, but browser layout and physical Windows acceptance remain unproven.

### Current Level 2 technical dependency

PR #104 remains OPEN, DRAFT and UNMERGED. It develops governed PowerShell/Windows-worker capability on the existing remote-bridge lineage. Its own body explicitly limits current bounded operation families and records unresolved mutation ownership, authenticated admission, exact-head physical Windows acceptance, independent Green and PRS proof.

Frontend work must therefore avoid presenting broad autonomous Windows control as a current capability.

## 4. What frontend exists today?

### PROVEN on current main

1. A self-contained `IntegrationFallbackManager` React component exists.
2. It explicitly states that it does not connect to providers, read credentials, redirect, or persist consent.
3. It contains keyboard handling, ARIA labels/live announcements, provider health presentation, local route preview and recovery-choice UI.
4. A static fallback prototype/sample and deterministic fixture/test support exist.

### PROVEN on draft branches only

1. Basic Chat HTML/CSS/JS exists in the V1 RC lineage.
2. The Basic Chat screen has a persistent composer, conversation history, status, Pause, Resume and Stop controls.
3. Its copy truthfully warns that pause/stop block new sends while a current bounded turn may finish first.
4. Conversation/lifecycle behavior has repository tests on those lineages.

### NOT YET SUPPORTABLE as current-main product claims

- full Everyday/Essentials application shell
- first-run onboarding
- global Palette
- Inbox
- user-facing Jobs centre
- coherent Evidence Timeline
- Jack permission experience
- Henry assurance experience
- Connector Centre
- Restricted Mode product surface
- device-trust UX
- Local / Cloud / Mixed execution UX
- mainstream cost dashboard
- full responsive application behavior
- end-to-end broad Windows control

## 5. Current frontend architecture

Current repository evidence shows two disconnected frontend directions rather than one settled app architecture:

1. `agents/ui/...` — integration fallback component/prototype lane.
2. `ui/basic-chat.*` on draft V1 lineage — dependency-light loopback Basic Chat surface coupled to the local chat server.

There is no evidence on `main` of a complete React/Vite/Next-style application shell, route system, shared design-system package or production desktop shell.

**Architecture rule:** do not create a second app/runtime authority merely to make UI development easier. The next coherent frontend should consume canonical local/runtime state through explicit read/control contracts.

## 6. First-time ordinary-user journey — current reality

On `main`, there is no evidenced ordinary-user journey from install -> onboarding -> chat -> permission -> work -> evidence -> verification.

On the Basic Chat draft lineage, the user can reach a bounded local chat surface, but the experience is still developer/RC oriented:

- title says `Basic Chat`;
- status line uses `Local · DRY_RUN · Autonomy disabled`;
- copy says `Green required before complete`;
- placeholder says `One bounded local check…`;
- no plain-language explanation of Jack or Henry;
- no permission-request card;
- no evidence timeline;
- no Inbox/Jobs/Palette shell;
- no guided first task/onboarding.

This is useful engineering acceptance UX, but not yet the smallest coherent mainstream AgentOS product.

## 7. Primary usability blockers

### P0 — trust/control

1. **No canonical user-facing trust-state contract.** Raw runtime concepts are not yet consistently translated into user states.
2. **Permission comprehension gap.** No evidenced ordinary-user preflight answering: what AgentOS wants to do, where, why, for how long, what changes, and what will require another approval.
3. **Evidence comprehension gap.** No coherent user-facing timeline separating intent, authority, execution, change, verification, recovery and assurance.
4. **Verification semantics gap.** `COMPLETE`, Green and PRS need exact UI meanings; worker success must not visually imply independent assurance.
5. **Stop/Revoke semantics gap.** Basic Chat copy is appropriately cautious, but the wider product needs states such as Stop requested, Stopping, No further actions authorised, Stopped, Unable to confirm stop.
6. **Recovery/failure UX gap.** Current fallback component handles a narrow streaming/provider case; broader job recovery is not a coherent end-user experience.
7. **Credential/connector boundary gap.** No evidenced Connector Centre showing scope, credential boundaries and revoke state.

### P1 — everyday usability

1. no first-run onboarding shell;
2. no global Palette;
3. no Inbox for attention;
4. no Jobs/Saved Jobs product surface;
5. no Personal/Work/Developer profile layer;
6. no searchable settings;
7. no tray/status surface;
8. no `Send to AgentOS` affordance;
9. no mainstream Morning Brief UI;
10. no Local / Cloud / Mixed execution indicator;
11. no plain-language capacity/cost dashboard.

## 8. Claim-discipline matrix

| UX/capability | State | Allowed frontend treatment now |
|---|---|---|
| Main fallback manager | PROVEN on main | May be described as self-contained/local fixture UI only |
| Basic Chat | NEARLY PROVEN / draft lineage | Prototype/RC wording only; never present as shipped main |
| Pause/Stop Basic Chat | NEARLY PROVEN / bounded draft | Preserve caveat that active bounded turn may finish |
| Governed Windows read/inspection worker | NEARLY PROVEN | May be shown only in explicitly bounded development/acceptance context |
| Controlled Windows mutation | NOT YET SUPPORTABLE | Do not expose as generally available action |
| Broad computer control | PRODUCT DIRECTION | Future-facing only |
| Evidence Timeline | PRODUCT DIRECTION | Implement UI contract/prototype against canonical evidence, label accordingly |
| Jack authority UX | PRODUCT DIRECTION backed by governance need | Build presentation contract; no synthetic approvals |
| Henry assurance UX | PRODUCT DIRECTION backed by PRS role | Build presentation contract; never self-certify |
| Inbox / Jobs / Palette | PRODUCT DIRECTION | May prototype without inventing canonical state |
| Local / Cloud / Mixed | PRODUCT DIRECTION | Only render when execution placement evidence exists |

## 9. Shared shell for Simple, Essentials and Tech Head

All modes should share the same underlying information architecture and canonical state. Progressive disclosure changes density, not truth.

### Shared in all modes

- large main Chat
- top-level AgentOS state: Ready / Working / Waiting for you / Paused / Recovery required / Unable to confirm
- persistent attention entry point (Inbox)
- persistent current-job access
- visible Pause/Stop access when applicable
- clear authority state
- human-readable verification state
- evidence summary
- execution-location summary when known
- cost/capacity summary when known

### Simple

- large controls and plain language
- hide provider/model/runtime identifiers by default
- permission requests framed as concrete consequences
- `What happened` instead of raw logs
- characters may teach role: Jack = permission/boundaries, Isla = doing, Henry = checking

### Essentials

- mainstream default
- job steps, permissions, evidence, cost/capacity and execution location visible
- compact technical detail available on demand

### Tech Head

- same shell plus raw IDs, providers/models, capabilities, policies, traces, correlation, exact evidence, diagnostics and machine-readable exports

## 10. Smallest coherent Everyday / Founding-Beta frontend

Wave 0 does **not** require every long-term surface. It needs one coherent loop:

1. **Welcome / setup readiness** — explain local bounded beta and limitations.
2. **Large Chat** — one obvious place to state intent.
3. **Intent preview** — AgentOS restates what it understands before consequential work.
4. **Permission card (Jack)** — action, scope, target, duration, reversibility, credential boundary, cost/capability implication where known.
5. **Current job card (Isla)** — plain-language state with Pause/Stop semantics tied to runtime truth.
6. **Evidence summary / timeline** — requested -> authorised -> started -> actions/changes -> verification -> assurance.
7. **Assurance result (Henry)** — independently distinguish unchecked / checking / verified / failed / unavailable.
8. **Recovery/failure card** — what happened, what is preserved, what can safely happen next.
9. **Attention centre** — a minimal Inbox can initially be a filtered view over canonical attention-required states rather than a new database.
10. **Basic Jobs view** — only if canonical persistent mission/job state is available; otherwise defer rather than invent frontend persistence.

The first Founding-Beta release should prefer one complete real-job loop over a broad but cosmetic dashboard.

## 11. Frontend trust-state model

The frontend requires a presentation-only contract that can be derived from canonical state.

### Work state

- Ready
- Preparing
- Waiting for permission
- Working
- Pausing requested
- Paused
- Stop requested
- Stopping
- Stopped
- Recovery required
- Blocked
- Unable to confirm state

### Verification state

- Not checked
- Checking
- Check passed
- Check failed
- Verification unavailable

### Independent assurance state

Green and PRS must be presented separately from execution success:

- Not requested / not applicable
- Pending
- PASS at stated scope
- FAIL at stated scope
- Stale for current head/state
- Unavailable

Never collapse worker success + Green + PRS into one generic green tick.

### Authority state

- No authority required
- Permission required
- Allowed for this action
- Temporarily allowed until [time/condition]
- Revoked / no further actions authorised
- Expired
- Denied
- Authority unknown -> fail closed in UI

## 12. Evidence Timeline — minimum event vocabulary

Presentation order should answer what the user cares about rather than dump raw logs:

1. **You asked** — normalized intent.
2. **AgentOS planned** — bounded next action/step.
3. **Jack checked** — authority decision and scope.
4. **Isla started** — execution began with environment/placement summary.
5. **Action performed** — human-readable action, target and effect.
6. **Change recorded** — files/data touched with before/after or receipt links where available.
7. **Verification ran** — checks/tests/evidence.
8. **Henry checked** — independent assurance when applicable.
9. **Recovered** — interruption/retry/recovery without hiding prior failure.
10. **Finished / needs attention** — final bounded state.

Raw event IDs/logs are an expansion, especially in Tech Head.

## 13. Permission card — acceptance contract

Before any consequential action, the user should be able to answer:

- What does AgentOS want to do?
- Why is it needed for my request?
- What exactly can it touch?
- Is this one action, this job, or temporary ongoing authority?
- What cannot it do under this permission?
- Will it use credentials or communicate externally?
- Is the action reversible?
- What will I be asked about again?

Recommended actions depend on canonical policy but presentation should distinguish:

- Allow once
- Allow for this job
- Deny
- View details

Do not offer `Always allow` until a canonical durable authority primitive explicitly supports and safely scopes it.

## 14. Pause / Stop / Revoke language

### Never promise

- `Stop immediately` unless runtime proves immediate termination.
- `Stopped` while execution state is unconfirmed.

### Preferred stateful copy

- Pause requested
- Pausing after the current safe boundary
- Paused — no new actions will start
- Stop requested
- Stopping — the current action may still be finishing
- No further actions authorised
- Execution stopped
- Unable to confirm stop — review status before continuing

`Revoke` is an authority action, not merely a visual job-state change. The frontend must call canonical authority/revocation behavior when that exists; otherwise show the missing runtime dependency.

## 15. VERIFIED semantics

Frontend label `Verified` must have a scoped object and evidence source.

A valid presentation should read like:

> Verified: 12 tests passed for this exact run output.

or

> Henry PASS: file-change receipt and test result matched for this job at this scope.

Do not show a generic product-wide `VERIFIED` badge from a local worker success response.

If evidence belongs to a predecessor commit/run, label it stale or historical rather than current.

## 16. Character-function mapping

Characters should communicate function, not decorate the interface.

### Willow — Planner

Appears when AgentOS is clarifying intent, proposing a plan or explaining alternatives.

### Isla — Executor

Appears in current-job/progress context: what is being done now and what happened.

### Jack — Guardian

Owns user-facing permission, scope, risk, temporary authority and block explanations. Jack should be visually associated with `why approval is needed`, never with marketing reassurance.

### Henry — Assurer

Owns `did this actually work?` presentation. Henry must never inherit success from Isla automatically.

## 17. Accessibility requirements

P0 acceptance for Wave 0:

- keyboard-operable chat, permissions and job controls;
- visible focus;
- programmatic labels for all controls;
- status changes announced without moving focus unexpectedly;
- errors associated with affected controls;
- not color-only for risk/verification;
- pause/stop states understandable to screen-reader users;
- minimum target sizes suitable for desktop/touch;
- no animated agent/mascot behavior required to understand state;
- `prefers-reduced-motion` respected for any future progress animation;
- logical heading order and landmarks;
- dialogs trap/restore focus correctly if used;
- evidence timeline usable as ordered text, not only a visualization.

## 18. Responsive requirements

### Desktop

- chat remains the dominant pane;
- current job/trust state may occupy a collapsible side rail;
- Inbox/Jobs/Settings available without shrinking chat into a dashboard tile.

### Narrow/mobile

- chat remains first;
- job/evidence state becomes stacked cards/sheets;
- Pause/Stop remains reachable without horizontal scrolling;
- permission decision buttons do not rely on hover;
- Tech Head raw data can collapse behind details.

No claim of responsive implementation is currently supported; this is an acceptance requirement.

## 19. Copy requirements

Prefer ordinary-user concepts:

- `Background check` over heartbeat
- `What happened` / `Evidence` over execution log
- `AI choice` in Simple, model/routing policy only progressively
- `Waiting for permission` over blocked on authority gate
- `Needs your attention` over exception queue
- `Local` / `Cloud` / `Mixed` only when placement is actually known

Avoid displaying `DRY_RUN`, raw Green internals, scheduler vocabulary, provider APIs or MCP terminology in Simple unless explaining a fault in an expandable technical detail.

## 20. Backend/runtime dependencies to report rather than mask

BLOCKED/HOLD until canonical runtime evidence exists:

1. reliable Stop/Revoke semantics beyond bounded Basic Chat behavior;
2. durable authority scopes suitable for UI presentation;
3. authenticated admission for remote worker path;
4. safe controlled mutation ownership/recovery;
5. exact runtime correlation exposed through a stable read contract;
6. independent current-head Green/PRS state for relevant work;
7. canonical attention-required projection suitable for Inbox;
8. canonical persistent job projection suitable for Jobs;
9. canonical execution-placement evidence for Local/Cloud/Mixed;
10. canonical connector/credential metadata safe for frontend display.

Frontend must not create substitute storage for these.

## 21. Founding-Beta validation plan

Wave 0 remains HOLD until the technical entry gate clears.

When eligible, frontend research should measure:

- permission comprehension: can tester explain what was allowed?
- scope containment comprehension: can tester say what AgentOS cannot touch?
- Stop/Revoke comprehension and actual behavior;
- false-success detection: does UI distinguish execution from verification?
- recovery comprehension after interruption;
- evidence comprehension without raw logs;
- usefulness of first real job;
- whether tester attempts a second real job without prompting;
- time-to-first-success;
- number of times technical terminology blocks progress.

Primary adoption signal: unprompted second real job attempt.

## 22. Implementation candidates

### F-001 — Canonical frontend trust-state presentation contract
**State:** ACTIVE -> implementation document in this batch branch.  
**Goal:** define truthful work, authority, verification and assurance presentation states without creating canonical state.  
**Acceptance:** contract explicitly maps UI states to required evidence, reserves UNKNOWN/fail-closed behavior, and separates execution from Green/PRS.

### F-002 — Basic Chat terminology reconciliation
**State:** PENDING.  
**Target:** latest viable Basic Chat lineage, not current main.  
**Change:** replace developer-facing primary copy (`DRY_RUN`, Green jargon, bounded-local-check placeholder) with ordinary-user copy while retaining a Tech Head details path.  
**Dependency:** fresh reconcile latest Basic Chat stacked head before modifying; do not rewrite stale PR #87 blindly.

### F-003 — Basic Chat trust strip
**State:** PENDING.  
**Goal:** add presentation-only summary for execution location, authority requirement and verification status using real server state; no synthetic badges.  
**Dependency:** server must expose trustworthy fields.

### F-004 — Evidence Timeline projection
**State:** PENDING.  
**Goal:** derive user-facing evidence rows from canonical mission/run/evidence artifacts.  
**Dependency:** inspect exact schemas/current branch; establish a pure adapter with no writes.

### F-005 — Permission-card contract
**State:** PENDING.  
**Goal:** design and later implement Jack card against canonical authority/consent data.  
**Dependency:** authority payload must expose action/scope/duration/boundaries safely.

### F-006 — Stop/Revoke UI state machine
**State:** PENDING.  
**Goal:** bind controls to truthful asynchronous state; prevent premature `Stopped` indication.  
**Dependency:** runtime/control contract.

### F-007 — Accessibility acceptance suite
**State:** PENDING.  
**Goal:** deterministic DOM/static tests for headings, labels, live regions, disabled-state semantics and control copy on the actual Basic Chat target branch.

### F-008 — Founding-Beta onboarding shell
**State:** HOLD behind coherent Basic Chat/current-job/permission/evidence loop and technical entry gate.

## 23. Testing requirements

Each frontend implementation slice should include, as applicable:

- static/DOM tests for required labels and controls;
- negative tests that forbidden overclaim copy is absent;
- state transition tests including unknown/error states;
- keyboard behavior tests;
- persistence/reload tests only against canonical persistence;
- stale evidence/current-head mismatch tests;
- Pause/Stop asynchronous-state tests;
- recovery event ordering tests;
- screenshots only as supplementary evidence, never state proof;
- browser layout/physical Windows acceptance where relevant.

## 24. Current blockers / UNKNOWNs

- Exact latest Basic Chat integration target is spread across stacked open draft PRs and must be freshly reconciled before implementation.
- Current browser layout acceptance for PR #99 is explicitly unproven.
- Current physical Windows acceptance for relevant later Basic Chat heads is incomplete/branch-specific.
- PR #104 mutation safety remains blocked; frontend must not advertise controlled mutation as ready.
- Authenticated admission and exact current-head assurance remain open in PR #104.
- No proven canonical Inbox projection has yet been identified in this scan.
- No proven canonical user-facing Jobs projection has yet been identified in this scan.
- No full app-shell framework decision is evidenced on main.

## 25. Priority queue for next vertical cycle

1. Fresh-scan all Basic Chat descendants (#80/#87/#92/#93/#96/#97/#98/#99/#102) and identify the single latest coherent UI lineage without merging/rebasing.
2. Inspect `runtime/basic-chat-server.mjs`, `runtime/local-chat.mjs` and tests on that exact lineage; produce state-to-UI truth map.
3. Inspect canonical `runtime/evidence-model.mjs`, `runtime/run-inspector.mjs`, verification, recovery, authority and control primitives on the relevant target lineage.
4. Implement F-002 and F-007 on a new branch stacked from the exact latest Basic Chat head if safe; keep draft/unmerged.
5. Build a pure Evidence Timeline adapter only after schemas are known; add fail-closed stale/unknown tests.
6. Define the minimum Jack permission payload needed from runtime and report missing fields to the runtime Overseer instead of inventing them.
7. Define Henry/Green/PRS assurance rendering with exact scope/current-head freshness requirements.
8. Reconcile Simple/Essentials/Tech Head into one app-shell information architecture after the current-loop data contracts are stable.
9. Keep Founding Beta recruitment/activation on HOLD until the technical entry gate clears.

## 26. Cycle-001 execution record

**Fresh scan completed:** yes.  
**Created canonical batch:** yes, this file.  
**Executed safe work:** established evidence-based frontend/current-state reconciliation and frontend trust-state contract work; separated current-main from draft Basic Chat capabilities; defined truthful Wave-0 loop and acceptance semantics.  
**Protected actions performed:** none.  
**Overall AgentOS GREEN claimed:** no.  
**Next step:** create the dedicated frontend trust-state contract document, then durably report this Frontend Overseer activation/checkpoint to `Overseer#49`.
