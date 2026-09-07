# AgentOS Product / Commercial Reconciliation — 2026-09-07

**Status:** RECOMMENDATION / HYPOTHESIS / VALIDATION REQUIRED  
**Scope:** Product/commercial design only; no runtime, scheduler, credential, provider, permission or production activation changes.

## Why this reconciliation exists

Recent AgentOS work now spans several related but not yet fully reconciled concepts:

- `docs/AUTONOMY_SCALE.md` defines graduated autonomy levels 0–5 and correctly separates autonomy from permission/authority.
- `docs/AUTONOMY_RUNTIME.md` defines scheduler-independent autonomous continuation and later scheduled execution.
- `docs/AUTONOMY_MILESTONES.md` defines measurable autonomy progression.
- `docs/COMMERCIAL-ACCESS-MODEL.md` defines Free as a limited taste and $29/year / $99/year as paid AgentOS plans.
- Marketing/product research now adds **Autonomy Hours / Night Shift**, the 30-day Willow/Isla/Jack/Henry onboarding journey, AI-budget controls and the current working commercial progression **Free → $29/year → $99/year → subscriptions/BYO AI**.

The current documents contain useful principles but also a few tensions that should be resolved before UI, entitlement and autonomy implementation harden them into incompatible assumptions.

## Invariants to preserve

1. **One AgentOS.** There must not be separate safety/governance/control planes for Free, $29 and $99.
2. **Views are not plans.** Everyday / Essentials / Tech Head control presentation, density and technical exposure; commercial tier controls entitlement/capacity/scope.
3. **Autonomy is not permission.** Time, autonomy level, authority, policy, capability, budget and approval are independent dimensions whose intersection determines effective execution rights.
4. **Scheduling is not authority.** Heartbeats, Night Shift and other windows decide *when* work may be attempted, not *what* AgentOS may do.
5. **Trust controls are universal.** Stop/pause, revocation, privacy, core approvals and basic evidence/assurance must not be weakened by tier.
6. **Free must demonstrate AgentOS rather than feel broken.** Limits should constrain capacity, complexity, persistence, breadth and unattended scope rather than disable the core product idea.
7. **Willow / Isla / Jack / Henry are AgentOS roles, not premium-only characters.** Free users should encounter all four during the 30-day value-discovery journey.
8. **No private chain-of-thought exposure.** Technical views receive execution traces, decision summaries, evidence and diagnostics.

## Reconciliation of the commercial ladder

The current working commercial hypothesis is:

### Free — Taste / Assistant

- Deliberately limited but genuinely productive.
- Primarily interactive/on-demand.
- Core AgentOS role flow is visible in constrained form.
- Limited complexity, persistence, capacity, connections and free/premium AI resource pool.
- No general unattended autonomy by default.
- May include tightly bounded demonstrations of scheduled/autonomous behaviour where safe and explicit.

### $29/year — Co-worker

- Natural first paid progression.
- More AI capability and capacity.
- Multi-step delegation.
- More memory/context and connected tools.
- Repeatable workflows.
- **Basic scheduled delegation / Night Shift** within conservative limits.
- Morning Brief and queued approvals are appropriate candidate features.

### $99/year — Operator

- Intended mainstream destination for serious regular use.
- Broad/high-quality capability pool and higher capacity.
- More simultaneous/complex jobs.
- Multiple autonomy windows and recurring work.
- Per-Context-Space schedules.
- Higher permitted autonomy ceilings, subject to user authority and policy.
- Advanced recovery, routing, assurance and monitoring.

### Additional subscriptions / BYO AI / specialist services

- For users needing larger quotas, premium providers, specialist tools, teams, business controls or higher-scale execution.
- Mission Autonomy / very high autonomy should not be assumed to belong automatically to $99; it may require explicit advanced entitlement, configuration and evidence.

## Important correction to `COMMERCIAL-ACCESS-MODEL.md`

The current document says $29/year and $99/year both receive "Full governed capability" for autonomy and primarily differentiates them through intelligence/resources. That is no longer sufficient as the working commercial hypothesis.

**Recommended interpretation:** both paid tiers use the same complete AgentOS control plane, but may have different **entitlement ceilings** for capacity, persistence, autonomy windows, concurrency, integrations, routing, recurring work and advanced controls.

This does **not** create different AgentOS products. It creates different authorised resource/scope envelopes around the same governed system.

A safe mental model is:

> Same AgentOS core → different entitlement envelope → same governance invariants.

## Autonomy scale × commercial entitlement

Do not hard-map every plan permanently to one autonomy number yet. Instead define a plan-specific maximum/available range which is then intersected with user-selected autonomy and authority.

Working hypothesis for validation:

| Commercial tier | Typical user mode | Candidate autonomy availability |
| --- | --- | --- |
| Free | Interactive / assisted | Levels 0–1, with tightly bounded demonstrations of higher behaviour where explicitly allowed |
| $29/year | Guided / scheduled co-work | Levels 0–3 within conservative autonomy-window and resource limits |
| $99/year | Operator / recurring work | Levels 0–4 within broader schedules, contexts and capacity |
| Advanced subscription / specialist entitlement | Mission/portfolio use | Level 5 only where explicitly authorised, implemented and independently verified |

This table is **not final pricing policy**. It is a product hypothesis intended to resolve the current contradiction between "same control plane" and "autonomy is a meaningful upgrade driver."

## Autonomy Hours / Night Shift

### Core rule

**WHEN AgentOS may work and WHAT AgentOS may do are separate controls.**

A Night Shift such as `22:00–06:00` grants a temporal execution window only. Effective execution still requires:

**Time Window → Selected Autonomy Level → User Authority → Policy → Capability → Risk → Budget → Approval → Execution → Evidence → Assurance**

### Mainstream product concept

**Night Shift** should be treated as a human-friendly preset over a general **Autonomy Hours** engine.

Candidate presets/modes:

- Anytime
- Night Shift
- Selected Hours
- Only When I Start It
- Never Work Without Me

Later/advanced options may include:

- Work Shift
- Weekend Shift
- Idle Mode
- local-compute-only windows
- device/resource-aware windows

### Safe default

Default new-user behaviour should remain **manual / only when explicitly started**. Night Shift and Anytime require explicit opt-in.

### Window-end default

For mainstream users:

> **Finish the current safe step, checkpoint progress, then stop. Do not begin a new step after the window closes.**

More technical behaviour can be exposed in Essentials/Tech Head.

## Tonight's Queue

A strong candidate Willow interaction is a pre-shift plan:

> **Tonight AgentOS plans to:** research supplier prices; process documents; prepare a report; draft follow-ups.

The user should be able to see the intended scope, estimated resource/budget envelope and important authority restrictions before starting Night Shift.

This improves informed consent and makes autonomy legible to non-technical users.

## Overnight operation model

### Willow
Plans, orders and reprioritises safe queued work.

### Isla
Executes authorised branches.

### Jack
Enforces time window, authority, policy, risk, budgets and approvals. Blocked branches are parked rather than allowing unrelated safe work to stall.

### Henry
Checks completed work, normalises evidence and prepares the Morning Brief.

No character gains extra authority merely because the user is absent.

## Approval queue and resume

Required unattended behaviour:

1. Reach an approval boundary.
2. Save durable workflow/checkpoint state.
3. Queue the blocked action for user review.
4. Continue independent safe branches.
5. Surface the approval in the Morning Brief.
6. On approval, **resume from the preserved checkpoint** rather than restarting the workflow.

This `pause → preserve → approve → resume` capability should be treated as a core autonomy requirement.

## Morning Brief

Candidate mainstream summary:

- Jobs completed
- Documents/items processed
- Deliverables prepared
- Henry assurance status
- Jack approvals waiting
- Safely stopped/failed jobs
- Clear next actions

Marketing should not fabricate productivity, savings or assurance metrics. Only measured execution evidence may populate these values.

## Autonomy Authority Profiles

Candidate reusable profiles:

### Night Shift — Safe

Allowed examples:
- research/read
- document processing
- data analysis
- report creation
- drafts
- monitoring

Approval examples:
- external communications
- external writes
- publishing
- purchases
- production changes

Never unattended by default:
- permanent destructive actions
- credential/security changes
- unrestricted filesystem access
- spending beyond explicit limits
- other explicitly high-risk actions

Profiles simplify configuration but remain subordinate to the canonical policy/authority system.

## Autonomy Budget

Budget should mean more than token spend. Candidate controls include:

- premium AI spend per task/window/day/month
- maximum jobs per window
- maximum runtime
- maximum concurrency
- browser/action ceilings
- free/local preference
- provider ceilings
- project/Context Space budgets

Routing should **not** default blindly to local AI. The default should balance suitability, quality, privacy, availability, reliability, user preference and cost.

Candidate user-facing modes:

- Prefer free/local
- Balanced
- Prefer best available

## Free capability pool and Night Shift

Free/local resources can make scheduled work economically useful, but AgentOS must not use language implying exploitation of provider quotas.

Preferred internal/product language:

- `free allowance optimisation`
- `available included/free capacity`

Avoid `quota harvesting`.

Provider terms, commercial-use restrictions and rate limits remain authoritative.

## Experience-view reconciliation

The current commercial document still uses **Basic** as the simple-view name, while newer marketing work prefers **Everyday** as the leading candidate and `Basic` remains present in implementation work such as draft PR #80.

Recommendation:

- **Do not rename runtime branches/code solely for marketing yet.** PR #80 should remain governed and unmodified by this document.
- Treat **Everyday** as the current marketing/UI candidate, still validation-gated.
- Keep **Basic** as an internal/legacy implementation label where necessary until naming is formally approved.
- Essentials and Tech Head remain the current higher-density view concepts.

## Current repository evidence relevant to this reconciliation

- Main contains `AUTONOMY_SCALE.md` with levels 0–5 and the invariant that autonomy does not grant permission.
- Main contains `COMMERCIAL-ACCESS-MODEL.md` with Free as a limited taste and both paid plans using the same AgentOS control plane.
- `AUTONOMY_RUNTIME.md` keeps dispatch semantics independent of the scheduler.
- `AUTONOMY_MILESTONES.md` already treats scheduled autonomous execution as a measurable milestone rather than a marketing claim.
- Draft PR #78 implements the first deterministic graduated-autonomy policy primitive, including time-bounded autonomy with fail-closed expiry, but explicitly does **not** enable scheduling, providers, credentials or production autonomy.
- Draft PR #80 implements a governed local Basic Chat vertical slice and explicitly keeps DRY_RUN, disabled autonomy and fail-closed safeguards.

## Next implementation/design gates

Before Night Shift can be represented as implemented:

1. Reconcile commercial entitlement with autonomy-level availability without weakening the shared control plane.
2. Extend the autonomy policy so temporal windows are an independent explicit input to effective authority.
3. Define durable checkpoint + blocked-branch + resume semantics.
4. Define approval queue behaviour for unattended execution.
5. Define Morning Brief evidence schema.
6. Define autonomy budget/resource ceilings.
7. Expose effective authority and schedule state in UI using progressive disclosure.
8. Add deterministic tests for window start/end, expiry, approval blocking, independent branch continuation, budget exhaustion and resume.
9. Preserve scheduler-disabled / autonomy-disabled safe defaults until an authorised activation decision and acceptance evidence exist.
10. Validate Free → $29 → $99 pricing and autonomy packaging with real users before treating it as final commercial policy.

## Marketing / claim guardrails

Do not claim:

- Night Shift is implemented until runtime evidence proves it.
- $99 is "enterprise-grade" without enterprise-level controls/evidence.
- Henry produces cryptographic proof unless cryptographic evidence has actually been implemented.
- overnight processing is inherently cheaper unless the cost difference is measured or tied to a verified provider pricing rule.
- AgentOS always saves money or always selects the cheapest/best model.

## Working product message

The strongest current commercial wording is:

**Free — AgentOS helps you.**  
**$29/year — AgentOS works with you.**  
**$99/year — AgentOS can work for you, on your schedule.**

Supported by:

**One platform. Every AI.**  
**Make the most of AI.**

## Evidence classification

- **FACT:** repository documents and draft PR states described above.
- **RECOMMENDATION:** Night Shift, Autonomy Hours, Tonight's Queue, Morning Brief, Authority Profiles and entitlement reconciliation.
- **HYPOTHESIS:** specific Free/$29/$99 autonomy packaging and conversion impact.
- **UNKNOWN:** final entitlement ceilings, user willingness to pay, economic sustainability and implemented runtime behaviour until tested.
