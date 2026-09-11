# AgentOS Marketing Claims Register — 2026-09-12

**Status:** CURRENT MARKETING CONTROL DOCUMENT

## Purpose

Prevent marketing copy, social content, landing pages, creator briefs and referral material from outrunning repository/runtime evidence.

Use one of these states:

- **VERIFIED** — supported by current repository/runtime evidence within a defined scope.
- **IMPLEMENTED / NOT FULLY VERIFIED** — code exists but final independent/runtime acceptance is incomplete.
- **PRODUCT DIRECTION** — approved positioning or packaging direction, not a shipped-capability claim.
- **HYPOTHESIS / BENCHMARK REQUIRED** — plausible value claim requiring measured evidence.
- **DO NOT CLAIM** — misleading or unsupported in current state.

## Current claims

| Claim | State | Safe wording | Notes |
| --- | --- | --- | --- |
| AgentOS is designed to be provider/model agnostic | VERIFIED / ARCHITECTURAL | "AgentOS is designed to work across AI providers rather than locking you to one." | Architecture direction is explicit; exact provider integrations remain capability-specific. |
| AgentOS can prefer free/included AI first | VERIFIED / PRODUCT+UX DIRECTION | "AgentOS is designed to use included/free AI first when that policy is selected." | Current docs explicitly define free-first/included-AI-first policy. |
| AgentOS makes the most of free, local and paid AI | PRODUCT DIRECTION | "AgentOS is designed to make the most of free, local and paid AI." | Local implementation breadth remains incomplete. |
| AgentOS runs effectively using free AI alone | HYPOTHESIS / BENCHMARK REQUIRED | "AgentOS is being designed to work effectively with free AI." | Promote to stronger wording only after benchmark evidence. |
| AgentOS saves time | HYPOTHESIS / BENCHMARK REQUIRED | "AgentOS Operator is designed to save time." | Measure task-time reduction before quantitative claims. |
| AgentOS reduces unnecessary AI spend | HYPOTHESIS / BENCHMARK REQUIRED | "Designed to reduce unnecessary AI spend." | Requires routing/cost benchmark for stronger claims. |
| $99/year is less than $2/week | VERIFIED ARITHMETIC | "$99 a year — less than $2 a week." | $99 / 52 ≈ $1.90. |
| $99 Operator saves more than it costs | DO NOT CLAIM | "It only needs to save a small amount of time or AI spend each week to justify less than $2/week." | No guaranteed ROI claim until evidence exists. |
| AgentOS always chooses the cheapest AI | DO NOT CLAIM | "AgentOS can consider suitability, user preference, privacy, availability and cost." | Cheapest is not always suitable. |
| AgentOS always chooses the best AI | DO NOT CLAIM | "AgentOS chooses from the AI available to you based on the job, your preferences and your limits." | Avoid absolute optimisation claim. |
| AgentOS replaces all AI subscriptions | DO NOT CLAIM | "You don't have to replace your favourite AI. AgentOS is designed to help you make better use of it." | Replacement depends on user needs. |
| AgentOS works with every AI | DO NOT CLAIM | "AgentOS is provider-neutral by design and can integrate supported providers/capabilities." | Integration set is finite and evolving. |
| AgentOS provides Night Shift | PRODUCT DIRECTION / IMPLEMENTATION GATED | "Night Shift is designed to let approved work continue during permitted hours." | Do not imply fully shipped until runtime evidence proves it. |
| AgentOS works while the user's computer is off | DO NOT CLAIM GENERALLY | "Each job should show whether the local computer is required or whether it runs remotely." | Depends on worker/location. |
| AgentOS has a governed Windows worker | IMPLEMENTED / NOT FULLY VERIFIED | "AgentOS is developing governed Windows-worker capability." | Draft PRs exist; physical Windows acceptance remains a gate. |
| Remote physical Windows execution is proven | DO NOT CLAIM | None | PR #91 explicitly says NOT PROVEN. |
| AgentOS provides Green/assurance controls | VERIFIED / ARCHITECTURAL+BOUNDED IMPLEMENTATION | "AgentOS uses evidence and assurance gates rather than trusting worker self-report alone." | Avoid claiming universal completion assurance outside proven scope. |
| Henry cryptographically proves outcomes | DO NOT CLAIM | "Henry checks evidence and outcomes." | No broad cryptographic-proof claim. |
| Free / $39 / $99 are different AgentOS products | DO NOT CLAIM | "One AgentOS. Different entitlement envelopes." | Same control plane and governance invariants. |
| $99 Operator is recommended | PRODUCT/COMMERCIAL DIRECTION | "$99 Operator — Recommended." | Owner direction. |
| $39 is the normal expected sale | DO NOT CLAIM INTERNALLY/EXTERNALLY | "$39 Co-worker is the lower-commitment paid step." | $99 is expected/recommended destination. |
| Ollama is bundled in AgentOS today | DO NOT CLAIM | "Ollama is the current recommended local-inference candidate for hybrid installs." | Implementation not established in main. |
| Libra is bundled in AgentOS today | DO NOT CLAIM | "Libra is being evaluated as an optional subordinate worker." | Licensing and architecture review required. |
| Content360 is an AgentOS core dependency | DO NOT CLAIM | "Content360 can be used as a replaceable specialist marketing/distribution tool." | Keep replaceable integration boundary. |

## Core approved marketing language

Preferred:

> **Put AI to work.**

> **One platform. Every AI.**

> **Make the most of AI.**

> **You already have AI. AgentOS helps you make the most of it.**

> **Free AI is more powerful when it works together.**

> **Use free AI. Use local AI. Use the AI you already pay for. AgentOS helps put it all to work together.**

> **$99 a year — less than $2 a week.**

> **AgentOS Operator is designed to save time and reduce unnecessary AI spend.**

> **Instead of figuring out which AI to use, I just give AgentOS the job.**

## Review rule

Before publishing a new strong claim:

1. identify the exact capability/value being claimed;
2. identify current implementation evidence;
3. identify independent verification evidence where required;
4. define scope/limitations;
5. assign a claims-register state;
6. only then write public copy.

If evidence changes, update this register before scaling the claim through Content360, ads, affiliates or creators.
