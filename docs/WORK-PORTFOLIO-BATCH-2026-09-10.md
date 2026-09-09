# Portfolio execution batch — evidence and integration boundaries

Execution report, not governance approval. Source snapshot:
`docs/evidence/portfolio-pr-snapshot-2026-09-10.json` records all 27 open AgentOS
PR heads/bases and available head-associated workflows plus portfolio PR search.
CI association is not proof of standalone branch execution: PR workflows may test
synthetic merge commits. No merge, rebase, approval, ready transition or deployment.

## AgentOS exact local baselines and repairs

| Surface | Exact baseline | Local suite | Observation |
|---|---|---:|---|
| main | e20ecf3bb9c03d1166397af8c204ccb07289d3f3 | 257 passed | Release fixes are still drafts, not main capabilities |
| bridge #91 | 5cc27c96d48e18419cc678fd03b37c9e1c7ccd70 | 355 passed | CI Tests #562 success; eight added negative cases expose reportable false completion |
| host #93 | c50b2e805535aa30b7d46245074ca2c62f63601b | 303 passed | CI #554 success; empty-lock publication-window ownership theft reproduced |
| autonomy #78 | 9cfe7aa38b2ffccd4872f0ba69ffbd6a4f4c6b80 | 261 passed | CI #420 success; 16 non-Boolean authority grants reproduced |

Bridge repair: require Green task identity, honor independently supplied
wake/host/worker/code/config identity, reject competing completion events for the
same task. Existing reconciliation still never authorizes rerun or certifies
assurance. Updated full suite 363 passed. Optional absent assignment identities
remain an assurance gap: internal correlation is not independent host attestation.

Autonomy repair is on `work/autonomy-strict-authority`, based on #78: explicit
Boolean grants and production context, 281 tests pass. Host repair is on
`work/host-lock-fail-closed`, based on #93: existing locks require recovery rather
than unsafe PID/unlink takeover, 304 tests pass. The latter withholds automatic
stale-lock restart; normal close/restart remains covered. No cross-lineage merge.

## Draft-family reconciliation

- #82 -> #84 -> #87 -> #92 -> #93 is the V1 repair progression. #83 remains open
  with failing Tests #477 despite passing Overseer Wake #261. A passing wake
  workflow cannot replace the failed test suite. #84 supersedes its broken path.
- #91 branches from #87, not #93. It retains scheduler enabled in the install
  default and lacks #92/#93 first-run/lifecycle fixes. Do not install it as the
  combined novice/physical acceptance candidate.
- #71 and #80 retain earlier bounded evidence on divergent bases. Their Windows
  workflow/laptop reports do not prove remote-to-Windows execution of #91.
- Budget #56/#67 and elastic #55/#66/#69 are overlapping generations. Select one
  canonical lineage before integration; do not duplicate their primitives.
- #74 Green, #76 ledger, #78 autonomy, #86 watchdog and #88 integration health are
  separate slices. CI pass does not establish their combined runtime behavior.
- Older #26–30 contain registry/provider/passport/commercial work, with no runs
  returned for those exact heads. Absence of returned CI is not a failure verdict.
- Main contains neither Basic Chat UI nor an implemented Night Shift/Morning Brief
  surface. PR #91 has a bounded deterministic worker, not arbitrary remote AI work.

## Frontend / novice path

Inspected #93 local-chat/server, HTML, JS and CSS. Large chat uses a flex shell;
composer is separate and conversation scrolls. Existing tests cover first-run,
state restore and close/restart, not a full novice browser usability session.
No claim of physical owner-laptop verification is made here.

Concrete gaps: jargon (`DRY_RUN`, bounded turn, Green), no useful-job picker beyond
a deterministic local check, no Everyday/Essentials/Tech Head switch, and no
Willow/Isla/Jack/Henry introduction flow. JS sets WORKING then render replaces it
with the previous state while sending. The fixed 100vh shell and minimum history
height need small-screen/keyboard testing; visual usability remains untested.

Implementation-ready next slice: retain routes and large composer; expose the
actual supported local check as an example with an honest result; show sending
state until response; explain unavailable AI rather than imply arbitrary work.
Add progressive technical details rather than duplicate frontend authority state.
Port host/first-run and bridge changes only through an authorized integration
candidate, then rerun exact-head lifecycle, concurrent worker and browser checks.

## Commercial and onboarding reconciliation

Current owner direction supersedes older $29-default copy: Free -> $39/year
challenger -> $99/year Operator -> additional subscriptions/BYO AI. $39 remains
an experiment; no billing, entitlement or pricing activation is authorized.
Existing marketing pricing validation brief already records this challenger;
older product/commercial reconciliation still describes $29 as working ladder.
Keep $29 only as the experiment control/historical assumption.

| Requirement | Existing place to extend | Acceptance boundary |
|---|---|---|
| Limited $39 Night Shift; broader $99 delegation | capability passport, existing policy/router, mission budget and scheduler config | Plan controls capacity, never grants authority or removes Green/PRS |
| Autonomy Hours / Night Shift | existing scheduler tick plus autonomy policy | Window only gates when; explicit opt-in, timezone/DST, pause, expiry, resource budget and approval remain required |
| Morning Brief | projection of existing mission ledger, task/results, receipts and blockers | Count only durable correlated completion; show interrupted/blocked/unknown work and cost; no new ledger |
| Four roles in week one | existing chat history/task lifecycle events | Task-triggered first introduction; Henry only when actual assurance applies; do not invent verification |
| 30-day nurture | existing scheduler and user preference state | Opt-in and deduplicated contextual reminders; no new mail/scheduling service |
| Day 31+ prompts | fresh demonstrated value/evidence plus preference state | No periodic pressure without a new useful reason; failed work is not an upgrade success |
| Member referrals | separate campaign attribution from creator affiliates | Genuine successful-value event, consent and fraud/cost validation before activation |
| Upgrade boundaries | same registry/authority/budget/Green path at every tier | Tier change cannot expand previously authorized task scope or resurrect stale claims |

No hard-coded capacity limits are approved in this batch. Needed tests include
cross-midnight/DST windows, paused at pickup, expiry after claim, downgrade with
in-flight reservations, quota-limited fallback, reminder deduplication and a
blocked run never producing an aha/referral event. These are integration targets,
not claims that the feature currently exists.

## Evidence status

IMPLEMENTED + LOCALLY TESTED: the three bounded defect repairs.
CI: baseline runs captured; new repair CI must be tied to published heads.
ASSURED: not asserted by this execution instance. PRS independence remains open.
REMOTE PHYSICAL EXECUTION: NOT PROVEN. Authenticated remote transport, installed
build identity, Windows recovery behavior, fresh capability/evidence provenance
and the integrated RC remain blockers. No overall GREEN.
