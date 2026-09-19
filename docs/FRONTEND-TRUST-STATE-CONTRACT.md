# AgentOS Frontend Trust-State Contract

**Status:** implementation-facing frontend contract; presentation layer only.  
**Authority:** none. This document does not define canonical runtime, authority, execution, Green or PRS state.  
**Rule:** the frontend may translate canonical evidence into human-readable states, but it must not synthesize success, authority or assurance.

## 1. Purpose

AgentOS needs one consistent user-facing vocabulary for work, permission, execution, verification and independent assurance.

The contract exists to prevent a common product failure: a friendly UI presenting a stronger claim than the runtime can prove.

For every visible state, the frontend must be able to answer:

1. What canonical evidence supports this label?
2. How fresh is that evidence?
3. What scope does the label apply to?
4. What should be shown if evidence is missing, stale or contradictory?

If those questions cannot be answered, the UI must fail closed to an unknown/needs-attention state rather than infer reassurance.

## 2. Separation of concerns

The frontend must keep these dimensions independent:

- **Intent** — what the user asked for.
- **Authority** — what AgentOS is allowed to do.
- **Execution** — what is currently happening or happened.
- **Evidence** — durable facts/receipts about actions/results.
- **Verification** — checks performed against the result.
- **Green** — governance disposition at its stated scope.
- **PRS / Henry** — independent assurance at its stated scope.
- **Recovery** — interruption/retry/reconciliation facts.

A PASS in one dimension must never silently set another dimension to PASS.

## 3. Work-state vocabulary

| User-facing state | Minimum evidence requirement | Forbidden inference |
|---|---|---|
| Ready | canonical host/app state permits a new bounded request | host process merely exists |
| Preparing | a request is accepted for preparation but execution has not begun | queue record alone means work started |
| Waiting for permission | canonical authority/consent gate requires user decision | generic failure means permission required |
| Working | exact active task/run correlation and non-stale execution evidence | a historical active event |
| Pause requested | canonical control request accepted but pause boundary not confirmed | button click alone |
| Paused | canonical state confirms no new actions will start under the paused scope | local UI flag only |
| Stop requested | canonical stop request accepted | button click alone |
| Stopping | runtime reports stop in progress / current bounded action may still finish | assumption based on elapsed time |
| Stopped | runtime confirms stopped scope and no further actions are authorised/active as defined by contract | frontend timer or optimistic state |
| Recovery required | canonical interrupted/uncertain state requires reconciliation | any ordinary failure |
| Blocked | canonical policy/dependency/runtime blocker prevents progress | user has not typed recently |
| Unable to confirm state | evidence is missing, stale, contradictory or unreachable | converting unknown to Ready/Stopped/Complete |

### Copy rule

Never show `Stop immediately` unless the exact runtime can guarantee immediate termination for the displayed scope.

Preferred transitional copy:

- `Stop requested`
- `Stopping — the current action may still be finishing`
- `No further actions authorised`
- `Unable to confirm stop — review status before continuing`

## 4. Authority / Jack vocabulary

| User-facing state | Meaning |
|---|---|
| No permission needed | current action is within an already-proven no-consent boundary |
| Permission needed | canonical authority/consent policy requires a decision |
| Allowed once | authority is limited to the displayed action |
| Allowed for this job | authority is limited to the displayed job/scope |
| Temporarily allowed | authority has explicit expiry/condition |
| Denied | canonical decision denies the action |
| Revoked | canonical authority was revoked and no further covered actions may start |
| Expired | previously valid authority is no longer valid |
| Authority unknown | state cannot be proven; frontend must not permit execution on this basis |

### Jack permission card minimum fields

The frontend should not offer a consequential permission decision unless it can present, from canonical data or a deterministic mapping:

- requested action;
- reason it is needed;
- target/scope;
- duration or one-shot/job-bound semantics;
- explicit boundaries / what is not allowed;
- whether credentials are involved;
- whether external communication or publication is involved;
- reversibility where known;
- cost/capacity consequence where material and known;
- what will require another approval.

If durable `always allow` authority is not supported by canonical policy, the UI must not invent it.

## 5. Execution / Isla vocabulary

Isla represents work being performed, not proof that the work succeeded.

Useful execution states:

- Preparing
- Started
- Running step N
- Waiting on dependency
- Waiting for you
- Pausing
- Paused
- Stopping
- Stopped
- Interrupted
- Recovering
- Recovered
- Finished execution — verification pending

### Key rule

`Finished execution` is not equivalent to `Verified`, Green PASS, PRS PASS or overall completion.

## 6. Verification vocabulary

| State | Required treatment |
|---|---|
| Not checked | clearly neutral; never render as failure or success |
| Checking | show what is being checked if known |
| Check passed | state exact check/scope and evidence link/receipt where available |
| Check failed | state failed check and next safe action |
| Verification unavailable | distinguish tool/system unavailability from a failed result |
| Verification stale | evidence applies to a predecessor head/run/state rather than current target |

A generic `VERIFIED` badge is prohibited unless the UI simultaneously makes the verified object and scope obvious.

Preferred wording:

> Verified: 12 tests passed for this exact result.

Not:

> VERIFIED

## 7. Henry / PRS assurance vocabulary

Henry represents independent assurance, not the executor checking itself.

States:

- Not required / not applicable at this scope
- Not requested
- Pending
- PASS at stated scope
- FAIL at stated scope
- Stale for current state/head
- Unavailable

The frontend must preserve the independent origin of Henry/PRS evidence. It may not generate a Henry PASS from execution success or a local verification step.

## 8. Green vocabulary

Green is a distinct governance disposition.

Allowed frontend treatment:

- `Green check pending`
- `Green PASS — [scope]`
- `Green FAIL — [scope]`
- `Green evidence is stale for this version`
- `Green unavailable`

Never turn a bounded Green PASS into a product-wide `AgentOS is safe` statement.

## 9. Evidence Timeline contract

The default timeline is human-readable and ordered by user meaning. Raw events/IDs are expandable, especially in Tech Head.

Recommended event families:

1. **You asked** — normalized intent.
2. **Willow planned** — proposed bounded next step.
3. **Jack checked** — authority/permission decision and scope.
4. **Isla started** — correlated execution start.
5. **Action performed** — human-readable action/target/effect.
6. **Change recorded** — durable mutation/result receipt where applicable.
7. **Verification ran** — what was checked and outcome.
8. **Green checked** — scoped governance result when applicable.
9. **Henry checked** — independent PRS result when applicable.
10. **Recovery occurred** — interruption, preserved state and recovery result.
11. **Finished / needs attention** — final bounded state.

### Timeline integrity rules

- preserve failures; do not rewrite history after successful recovery;
- preserve original timestamps/ordering where canonical evidence provides them;
- mark missing gaps rather than silently closing them;
- reject or visibly flag correlation mismatch;
- distinguish historical/predecessor evidence from current evidence;
- never reorder events to make the job look cleaner than it was.

## 10. Freshness and correlation

Any positive user-facing state that depends on a run/task/version must be bound to the exact target identifiers available in canonical evidence.

Examples include:

- mission ID;
- task ID;
- run ID;
- wake/correlation ID;
- worker/host identity;
- code/version/head identity;
- receipt/evidence ID.

If the UI cannot prove the displayed evidence belongs to the current target, use `stale`, `historical` or `unable to confirm` instead of carrying forward a PASS.

## 11. Local / Cloud / Mixed execution

Render execution placement only when canonical evidence supports it.

- **Local** — all displayed work for the relevant scope is proven local.
- **Cloud** — all displayed work for the relevant scope is proven remote/cloud.
- **Mixed** — the job intentionally spans both and evidence supports the split.
- **Location unknown** — placement cannot be proven.

Do not infer `Local` from a localhost frontend URL alone.

## 12. Cost and capacity

Frontend cost/capacity labels must match the precision of available evidence.

Allowed examples:

- `Estimated: one higher-capability run`
- `Capacity estimate`
- `Exact provider cost unavailable`

Do not display a precise dollar cost when the runtime cannot calculate it reliably.

## 13. Failure and recovery

Failure copy should answer four questions:

1. What failed?
2. What, if anything, may already have changed?
3. What evidence/state was preserved?
4. What is the next safe action?

Recovery success must not erase the prior failure from the Evidence Timeline.

Recommended states:

- `Interrupted — result is uncertain`
- `Recovery required`
- `Recovering from the last confirmed boundary`
- `Recovered — verification pending`
- `Recovery failed — manual review required`

## 14. Restricted Mode

Restricted Mode is a product presentation of a canonical policy posture, not a frontend-only toggle.

Until a stable canonical Restricted Mode contract exists, prototypes may show the concept only as non-functional/product-direction UI.

A real toggle must enumerate its effective boundaries in plain language, such as what actions, connectors, execution placements, credentials or background work become unavailable.

## 15. Mode-specific disclosure

The truth model is identical across Simple, Essentials and Tech Head.

### Simple

Show:

- plain-language work state;
- permission decision and scope;
- what happened;
- whether checked/assured;
- one safe next action.

Hide by default:

- raw IDs;
- provider/model identifiers;
- scheduler internals;
- MCP/API terminology;
- raw traces.

### Essentials

Add:

- job steps;
- execution location;
- capacity/cost summary;
- evidence detail;
- policy summary.

### Tech Head

Add:

- raw correlation IDs;
- exact provider/model/capability;
- canonical event names;
- policy details;
- logs/traces;
- machine-readable evidence/export.

Changing mode must never change the underlying authority or assurance state by itself.

## 16. Accessibility contract

Trust state cannot be color-only.

At minimum:

- status text is programmatically exposed;
- async changes use appropriate live regions without chatty duplicate announcements;
- permission controls are keyboard operable;
- focus moves predictably for dialogs/sheets;
- error text is associated with the affected action;
- icons/characters have meaningful accessible labels only when they convey state;
- decorative mascot art is hidden from assistive technology;
- evidence timeline remains readable as ordered text;
- reduced-motion preference is respected.

## 17. Negative acceptance assertions

Frontend tests should explicitly fail if protected overclaims appear without the required evidence path.

Candidate forbidden primary-copy assertions include:

- `Stop immediately`
- generic `VERIFIED` with no scope/object
- `Safe` derived solely from worker success
- `Henry PASS` derived from local execution
- `Green PASS` derived from worker verification
- `Local` derived solely from browser origin
- `Always allow` when canonical durable authority is absent
- `Completed` when required verification/Green gating is still pending

## 18. Implementation guidance

Prefer pure presentation adapters:

`canonical facts -> validated presentation model -> UI`

Avoid:

`UI local state -> inferred canonical truth`

A presentation model may cache data for rendering if architecture permits, but should carry provenance/freshness so stale cache cannot be mistaken for current truth.

## 19. Founding-Beta acceptance use

This contract should be tested with Wave 0 participants using comprehension questions rather than only usability preference:

- What is AgentOS doing now?
- What did you allow it to do?
- What can it not do under that permission?
- Did the work actually finish?
- Was it checked?
- Was it independently assured?
- If you press Stop, what do you expect to happen?
- If something fails, can you tell what may already have changed?

A user who cannot answer these after using the interface has exposed a frontend trust defect even if the runtime behaved correctly.

## 20. Current implementation status

This contract is an implementation artifact, not evidence that the described full UI exists.

As of the 2026-09-14 Frontend Overseer fresh scan:

- current `main` contains the fallback component/prototype lane;
- Basic Chat exists on open draft branches;
- current Level 2 Windows-worker work remains open/draft and does not support broad autonomous Windows-control claims;
- the next safe implementation target is the freshest coherent Basic Chat lineage after a new branch/head reconciliation.
