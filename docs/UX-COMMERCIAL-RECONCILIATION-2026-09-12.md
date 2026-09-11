# AgentOS UX / Commercial Reconciliation — 2026-09-12

**Status:** CURRENT INTERPRETIVE NOTE  
**Applies to:** `docs/AGENTOS_UX_RESEARCH_2026-09-12.md` and active commercial/product work.

## Purpose

The UX research report contains strong interaction, safety, progressive-disclosure, autonomy and cost-control recommendations that remain useful.

However, its commercial recommendation that `$29/year` and `$99/year` should expose the same AgentOS capability set and differ mainly by models/capacity is **not current active packaging direction**.

The current commercial source of truth is:

`docs/COMMERCIAL-PRODUCT-SOURCE-OF-TRUTH-2026-09-12.md`

Active ladder:

> **Free -> $39/year Co-worker -> $99/year Operator -> optional add-ons/BYO AI**

## What remains valid from the UX research

Preserve these UX principles unless later evidence changes them:

- autonomy should be presented as a controllable service, not a technical setting;
- autonomy, timing, model policy and cost protection are separate controls;
- scheduled/background work should be off by default until explicitly enabled;
- consequential actions require appropriate approval/authority;
- free-first should be a first-class model policy;
- cost protection should pause/ask rather than silently exceed limits;
- users should see what AgentOS plans to do before unattended work begins;
- `Pause all background work` should remain prominent;
- mainstream views should use plain language rather than raw scheduler/model internals;
- progressive disclosure should separate Everyday / Essentials / Tech Head experiences;
- activity/evidence should be inspectable;
- no plan may weaken safety, authority, approval, evidence or assurance controls.

## Commercial correction

The current packaging direction does **not** mean separate AgentOS products.

The invariant remains:

> **Same AgentOS core -> different entitlement envelope -> same governance invariants.**

The `$39 Co-worker` and `$99 Operator` tiers may therefore expose different ceilings for:

- scheduled and recurring work;
- Night Shift scope;
- autonomy windows;
- queue depth;
- concurrency;
- persistence;
- integrations;
- routing/provider breadth;
- recovery/monitoring depth;
- AI/resource allowance.

This is entitlement differentiation, not a second runtime or second control plane.

## Operator direction

`$99/year Operator` is the recommended mainstream paid destination.

Primary message:

> **AgentOS can work for you, on your schedule.**

Supporting price message:

> **$99 a year — less than $2 a week.**

Operator should be materially stronger than Co-worker for recurring/scheduled/unattended work while remaining bounded by the same Jack/Henry/Green/PRS governance.

## Co-worker direction

`$39/year Co-worker` is a lower-commitment stepping stone.

Primary message:

> **AgentOS works with you.**

Co-worker should include enough scheduled/Night Shift capability to demonstrate value, but it must not be functionally identical to Operator with only lower model capacity.

## Free-AI alignment

The UX report's free-first direction aligns strongly with current marketing/product direction.

Preferred policy labels remain suitable:

- Use included AI only;
- Use included AI first;
- Use the strongest available AI.

Current marketing direction:

> **AgentOS helps you get more from the AI you already have — including free AI.**

The stronger claim that AgentOS runs effectively using free AI alone remains evidence-gated pending the Free-AI Effectiveness Benchmark.

## View naming

Where the UX research says `Basic`, treat that as the existing simple-view/internal implementation label.

Current marketing/UI candidate:

- **Everyday**
- **Essentials**
- **Tech Head**

Do not churn active runtime branches solely to rename `Basic` until naming is formally reconciled in implementation.

## Implementation interpretation

Any implementation task deriving commercial entitlement from the UX report should first read:

1. `docs/COMMERCIAL-PRODUCT-SOURCE-OF-TRUTH-2026-09-12.md`
2. this reconciliation note
3. the UX research report for interaction/safety detail

If they conflict on pricing or commercial entitlement, the commercial source of truth controls.

## Evidence boundary

This note does not claim Night Shift, broader Operator autonomy, Ollama, Libra, remote Windows execution or other future capabilities are implemented. Packaging direction and implementation state remain separate.
