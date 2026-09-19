# AgentOS Frontend Overseer — Vertical Cycle 004

**Date:** 2026-09-14 Australia/Brisbane  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Frontend contract PR:** #110 — OPEN / DRAFT / UNMERGED  
**Frontend implementation PR:** #111 — OPEN / DRAFT / UNMERGED  
**Current #111 head after this cycle:** `a639753edfbb1e9e52bea4da38597f0800279921`  
**Current #104 API head observed:** `9f53df16ae37ee6a86e66d2a808ca7f62f203d76`  
**Status:** ACTIVE / AMBER. No overall GREEN.

## 1. Fresh-scan reconciliation

- `main` remains unchanged at `6e94e00f...`; the full mainstream AgentOS frontend is still not on main.
- PR #111 remains the draft Basic Chat frontend lane.
- PR #104 has moved substantially since the previous frontend cycle and remains OPEN/DRAFT/UNMERGED. Its live body still records an independent Green FAIL on the project-file mutation ownership boundary. Controlled mutation therefore remains unavailable for mainstream frontend claims.
- `Overseer#49` remains P0 Level 2, Level 5 strategic end-state.

## 2. Stop versus Revoke contract discovery — P0-F1

### Basic Chat Stop — evidenced behavior

Current Basic Chat `control('stop')` persists `stopped: true`, causes future `send()` calls to fail with `CHAT_STOPPED`, and exposes `stopped` in the snapshot. The in-progress `wakeLocal()` call is serialized inside the current queue and no cancellation token/abort path is passed into `wakeLocal()`.

Therefore the frontend may truthfully say:

- `Stop requested`;
- `No new actions will start`;
- `The current action may still finish`.

It must not say:

- `Stopped` immediately after the control write;
- `Execution terminated`;
- `Nothing else can happen`;
- `Authority revoked`.

### Canonical runtime control

`src/dispatch/control.mjs` has `pause`, `resume`, and terminal `kill` for a runtime instance. It does not expose a durable authority-revocation operation. `kill` is runtime lifecycle control, not authority revocation.

### Revoke — current evidence boundary

Fresh default-branch search found no canonical `revoke`/`revoked` authority operation. Current remote-bridge authority work contains admission/grant evidence but the frontend still lacks a proven canonical revoke endpoint and durable revocation state.

Therefore `Revoke` remains a product requirement, not an implemented frontend control.

### Required contract before frontend can say `No further actions authorised`

A canonical authority service must expose at minimum:

1. authority/grant identifier;
2. revocation request identifier;
3. actor/issuer and authenticated requester;
4. scope/capabilities being revoked;
5. effective timestamp;
6. durable status: requested / applied / failed / unknown;
7. linkage to queued/in-flight work affected by the revocation;
8. audit/evidence pointer;
9. stale/freshness semantics;
10. explicit behavior for already-running actions.

Without those fields, the frontend must fail closed to `Authority state unavailable` or `Revocation not supported here` rather than synthesizing success.

### Required contract before frontend can say `Execution stopped`

A canonical execution path must expose a confirmation event or state proving the relevant execution has exited or cannot perform further side effects. A local boolean `stopped` flag that only blocks future sends is insufficient.

Minimum evidence:

- execution/task identity;
- stop/kill request identity;
- request timestamp;
- worker/runtime acknowledgement;
- terminal execution state or confirmed cancellation boundary;
- post-stop side-effect boundary;
- durable audit/evidence pointer;
- recovery state when confirmation is unavailable.

## 3. Accessibility and narrow-layout implementation — executed

Highest-value safe frontend-only work was performed on PR #111 branch.

### CSS changes

`ui/basic-chat.css` now adds:

- 44px minimum touch targets for buttons;
- explicit `:focus-visible` treatment for buttons, textarea and summary controls;
- wrapping job controls;
- mobile/narrow layout at 600px where composer row stacks and Send becomes full-width;
- `min-height` rather than fixed viewport height to avoid clipping under mobile browser chrome;
- reduced-motion preference handling;
- slightly larger minimum composer height.

These are presentation-only changes and do not modify runtime state, authority, Green, PRS, scheduling, persistence or execution.

### Regression tests

Added `tests/basic-chat-accessibility-static.test.mjs` to guard:

- viewport declaration;
- job-control labelling;
- status/alert semantics;
- 44px touch target baseline;
- keyboard-visible focus styles;
- narrow-layout stacking and control wrapping;
- reduced-motion preference handling;
- composer presence on narrow layouts.

Current exact implementation head after these commits: `a639753edfbb1e9e52bea4da38597f0800279921`.

Fresh exact-head CI had not yet appeared at the time of this checkpoint. No PASS is claimed until the exact head has completed required checks.

## 4. Current P0 truth matrix

| Area | Current status | Frontend rule |
|---|---|---|
| Mainstream app shell | Not on main | Do not claim shipped |
| Basic Chat | Draft lineage | May describe only with draft/bounded scope |
| Pause | Bounded | Prevents new actions; do not imply in-flight cancellation |
| Stop | Request/future-send block | Use `Stop requested`; current action may finish |
| Runtime kill | Canonical runtime primitive | Do not present as authority revocation |
| Authority Revoke | Not canonically exposed | Do not render a working Revoke action |
| Green | Completion gate in bounded Basic Chat path | Present separately from PRS/Henry |
| Henry / PRS | No canonical Basic Chat field | Never infer PASS |
| Evidence summary | Implemented draft projection | Keep scoped to existing snapshot/last task evidence |
| Full Evidence Timeline | Not yet justified | Wait for canonical per-job event read path |
| Jack permission card | Contract incomplete | Do not synthesize duration/reversibility/consequence fields |
| Project-file mutation | AMBER / Green FAIL on ownership | Do not expose as generally safe/available |
| Accessibility baseline | Implemented on #111 head | Requires exact-head CI and browser/physical verification before VERIFIED claim |
| Responsive behavior | Static implementation only | Requires browser/runtime evidence before broad claim |

## 5. Replenished execution queue

### P0-H1 — exact-head CI for accessibility slice

- inspect workflow for `a639753e...`;
- if failure is caused by the new frontend/static test, fix on the same branch;
- if failure is inherited/runtime-only, classify precisely and do not hide it;
- retain Windows lifecycle evidence separately from Linux/general suite evidence.

### P0-H2 — browser/physical narrow-layout acceptance

When a browser-capable execution surface is available, verify at minimum:

- 360px and 390px viewport widths;
- no horizontal scrolling;
- composer remains visible/reachable;
- Pause/Resume/Stop wrap without overlap;
- Send remains reachable;
- focus indicator is visible on keyboard navigation;
- technical/evidence details can be opened without losing composer;
- status/error announcements do not steal focus.

Until then mark responsive behavior as static-code evidence only.

### P0-H3 — live-region review

Inspect whether conversation `aria-live="polite"` causes repeated reading of the full history when new messages render. If so, move announcements to a bounded status region rather than live-reading the full transcript. Do not degrade transcript accessibility.

### P0-E2 — Jack contract gap report to runtime owner

Required missing canonical permission-card fields remain:

- user-facing reason;
- duration/expiry;
- one-shot vs this-job semantics;
- reversibility;
- credential involvement;
- external communication/publication consequence;
- cost/capacity where relevant;
- durable approval/deny/revoke lifecycle status.

No frontend approval action until canonical mutation endpoint and durable authority evidence exist.

### P0-C3 — evidence projection expansion only when schema permits

Do not expand `What happened` into a full timeline until exact canonical events can be correlated to the current Basic Chat task. Preserve historical failures and recovery events rather than summarizing them away.

### P0-G1 — beta onboarding remains gated

Prepare only after current trust loop is stable. Beta recruitment remains HOLD while Level 2 mutation ownership is AMBER and current PR #104 Green evidence remains FAIL.

## 6. Acceptance rules

Frontend work is not VERIFIED solely because source code exists. Required evidence tiering:

1. static source/test evidence;
2. exact-head CI;
3. browser/runtime evidence;
4. physical Windows evidence where OS behavior matters;
5. independent Green/PRS evidence for runtime/governance semantics.

No lower tier may be promoted into a higher-tier claim.

## 7. Protected HOLD

No merge, approval, ready transition, rebase, deploy, credential changes, production writes, production autonomy, unrestricted Windows mutation, synthetic Jack authority, synthetic Green/PRS, or overall GREEN.

## 8. Next vertical order

1. fresh scan again;
2. consume exact-head #111 CI for `a639753e...`;
3. fix frontend-caused failures if any;
4. inspect live-region behavior and implement only if source evidence justifies it;
5. keep Jack/Revoke blocked until canonical runtime contract exists;
6. expand evidence UI only from canonical read paths;
7. update canonical frontend batch and Overseer#49 with exact evidence;
8. continue to the next safe P0 rather than waiting on runtime blockers.
