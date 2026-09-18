# AgentOS Product Surface Consolidation Contract

**Owner direction:** 2026-09-18  
**Status:** ACTIVE PRODUCT DIRECTION  
**Scope:** product surface, frontend information architecture, onboarding, marketing, integrations, documentation and future feature admission

## Purpose

AgentOS should preserve broad underlying capability while reducing the number of decisions, concepts and controls an ordinary user must understand.

The product is entering a consolidation phase. New headline features are not the default growth strategy. Existing and planned capabilities should first be absorbed into a small, coherent product surface.

Product principle:

> **More capability underneath, fewer decisions on the surface.**

This document is a product/UX contract. It does not grant runtime authority, production readiness, Green PASS, PRS PASS, provider entitlement, credentials, production autonomy or deployment permission.

## Six canonical user-facing pillars

### 1. Chat & Projects
User intent, conversations, projects, jobs, results and history.

Primary question answered: **What do I want AgentOS to do, and where does that work belong?**

Capabilities such as Basic Chat, Projects, Recent Jobs, task history and project context should converge here rather than appearing as unrelated top-level features.

### 2. Workers & AI
Model/provider/tool selection, worker routing and capability selection.

Primary question answered: **Who or what is AgentOS using to do the work?**

Ordinary users should not need to manually orchestrate ChatGPT, Claude, Gemini, Perplexity, Manus, Codex, Cursor, Devin, Replit, Base44, AgentMail or Tavily for routine work. AgentOS should route by capability, health, authority, cost and policy while preserving user override where appropriate.

### 3. Automations
Scheduled, recurring, overnight, event-triggered and condition-triggered work.

Primary question answered: **When should AgentOS do this?**

The user-facing model should be natural-language and outcome-oriented. Internal scheduler, wake, correlation, replay and recovery mechanics remain governed infrastructure rather than headline product concepts.

### 4. Connections
Providers, applications, files, services and external systems connected to AgentOS.

Primary question answered: **What can AgentOS connect to?**

Connection state must remain distinct from capability health, commercial entitlement and execution authority.

### 5. Control & Cost
Permissions, approvals, personal policies, budgets, provider preferences, privacy and spend controls.

Primary question answered: **What is AgentOS allowed to do, and what may it cost?**

This pillar should provide plain-language user controls over read/change/send/publish/spend/schedule actions without exposing unnecessary internal governance complexity.

### 6. Evidence & Recovery
Status, receipts, verification, assurance, failures, retry/resume/recovery and durable evidence.

Primary question answered: **What happened, can I trust it, and what happens if something went wrong?**

Execution completion, verification, Green and PRS assurance remain distinct states even when presented simply.

## Complexity views

Simple / Essentials / Tech Head are presentation views over the same underlying truth and authority model.

### Simple
- appliance-like experience;
- large primary chat;
- minimum decisions;
- plain-language status;
- approvals only when necessary;
- technical diagnostics hidden by default.

### Essentials
- normal everyday operating view;
- Projects and Jobs visibility;
- Connections;
- approvals and cost;
- automation controls;
- concise evidence/recovery state.

### Tech Head
- deeper provider/capability health;
- routing detail;
- correlation and receipt identity;
- worker/execution diagnostics;
- recovery detail;
- Green and PRS evidence;
- advanced budget/policy information.

Changing view must never silently change authority, entitlement, capability, privacy, autonomy, budget or safety state.

## Priority consolidation work

The next product-surface work should preferentially strengthen the following:

1. **First-run success** — install -> connect one provider -> give AgentOS one real job -> receive a verified result.
2. **Projects + Jobs** — clear ownership and history for work.
3. **Permissions centre** — understandable read/change/send/publish/spend/schedule controls.
4. **Cost dashboard** — provider/mission cost visibility, budgets and free-first routing.
5. **Status / Attention Inbox** — running, waiting, blocked, completed, approval-required and cost-limit states in one place.
6. **Recovery centre** — safe resume, retry, inspect and recovery actions without manufacturing completion.
7. **Provider-routing transparency** — explain which capability/provider was chosen and why.
8. **Provider substitution transparency** — explain fallback/substitution and allow policy/user control.
9. **Guided connection onboarding** — especially for the twelve core integrations.
10. **Personal policy defaults** — examples include free-first routing, no spend without approval, draft-only communications and local-file privacy boundaries.
11. **Natural-language automation UX** — user intent on top of governed scheduler mechanics.
12. **Concise trust summary** — authority, cost, execution, verification and assurance shown separately.

## Feature admission gate

Before introducing a new headline user-facing feature, answer all of the following:

1. Which of the six canonical pillars does it strengthen?
2. What evidence-backed user workflow is currently blocked without it?
3. Can the capability instead be absorbed into an existing pillar/surface?
4. Does it duplicate an existing concept, control or status view?
5. Does it add a new permission, privacy, recovery, support or documentation burden?
6. Is its truth state backed by a canonical runtime/data source, or would the UI have to invent/simulate state?
7. Can Simple hide it while Essentials/Tech Head expose appropriate depth?
8. Does it preserve the existing authority/governance model rather than creating a second control plane?

If there is no clear pillar and no evidence-backed blocked workflow, the default disposition is **DEFER / ABSORB / DO NOT ADD AS A HEADLINE FEATURE**.

## Explicit non-priorities during consolidation

Do not prioritize, solely for feature-count growth:

- more top-level dashboards;
- more agent personas;
- more developer toggles;
- more visible connector categories;
- duplicate status surfaces;
- alternate schedulers/automation concepts;
- duplicate project/job concepts;
- parallel permission or cost systems;
- provider-specific controls where capability-level policy can represent the need.

This does not prohibit useful capabilities. It requires them to fit the product coherently.

## Core integration relationship

The twelve owner-approved core integrations remain important capabilities, but the product should not require users to understand twelve separate operating models.

The Connections surface may show provider/account setup and health. Workers & AI should explain routing. Control & Cost should govern permissions/budgets. Evidence & Recovery should show outcomes. The providers themselves do not become twelve separate product pillars.

## Marketing boundary

Do not market AgentOS as the product with the largest feature count.

Prefer the value proposition that AgentOS coordinates many AI models, tools and agents while reducing the amount of orchestration the user must perform.

A useful expression of the product direction is:

> **AgentOS gives you more capability without making you manage more complexity.**

## Engineering / governance boundary

This consolidation contract does not supersede:
- canonical authority and consent;
- scheduler/local-wake ownership;
- mission/task/worker correlation;
- capability health;
- budget controls;
- durable receipts;
- Green;
- PRS;
- recovery and replay protections;
- owner-gated physical/production actions.

No UI mode or product-pillar decision may synthesize readiness, authority, verification or assurance that is not present in canonical evidence.
