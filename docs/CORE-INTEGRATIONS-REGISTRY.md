# AgentOS Core Integrations Registry

**Owner-approved core set:** 2026-09-18  
**Status:** ACTIVE / DOCUMENTATION AND INTEGRATION SOURCE OF TRUTH  
**Authority boundary:** core inclusion does not grant execution or production authority

## Purpose

This registry records the owner-approved core program set for AgentOS. It exists so core/inclusion status is not inferred from scattered implementation PRs, provider observations or marketing material.

AgentOS remains provider/model/tool agnostic and free-first. External capability provides capability, never authority.

## Core programs

| Program | Provider | Core status | Current evidence class |
|---|---|---|---|
| ChatGPT | OpenAI | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Claude | Anthropic | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Gemini | Google | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Perplexity | Perplexity AI | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Manus | Manus | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Codex | OpenAI | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Cursor | Cursor | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Devin | Cognition | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Replit | Replit | CORE | APPROVED FOR CATALOGUE / explicit worker-profile lineage |
| Base44 | Base44 | CORE | APPROVED FOR CATALOGUE + BOUNDED CAPABILITY EVIDENCE |
| AgentMail | AgentMail | CORE | APPROVED FOR CATALOGUE + BOUNDED CAPABILITY EVIDENCE |
| Tavily | Tavily | CORE | APPROVED FOR CATALOGUE + BOUNDED CAPABILITY EVIDENCE |

## $99 AgentOS tier entitlement

**Owner decision — 2026-09-18:** the **$99 AgentOS tier includes access to all twelve core integrations**.

This means the AgentOS product entitlement for the $99 tier must not artificially withhold any of the twelve core integration surfaces solely because of AgentOS tiering. Subject to implementation readiness, the user may connect and use any core integration that is otherwise available, healthy, authorised and permitted by policy.

This decision does **not** mean that AgentOS purchases or bundles third-party subscriptions, API credits, paid provider plans, usage charges or external account entitlements. Where a core provider requires its own account, paid plan, credits or API billing, those remain separate unless a later explicit owner decision creates a bundled commercial arrangement.

The following remain independent of the $99 AgentOS entitlement:

- provider account availability;
- external subscription or API entitlement;
- credentials / authenticated connection;
- capability health;
- provider plan limits, quotas and rate limits;
- AgentOS authority and consent;
- policy/risk controls;
- spend/budget approval;
- execution approval;
- verification, Green and PRS;
- production eligibility.

Therefore, **“all core integrations included” means AgentOS integration access, not unlimited third-party usage or automatic authority.**

## Core product capability roles

The core set is intentionally complementary rather than twelve interchangeable providers. AgentOS sits above these products and routes work according to capability, health, entitlement, policy, cost and authority.

| Core product | Primary function | Practical AgentOS role |
|---|---|---|
| ChatGPT / OpenAI | General-purpose reasoning, writing, coding, analysis, multimodal work and tool use | Broad all-rounder worker for planning, drafting, coding, analysis and orchestration support |
| Claude / Anthropic | Long-context reasoning, document analysis, coding and careful instruction following | Deep review, large-document/codebase analysis, structured reasoning and independent second-opinion work |
| Gemini / Google AI | General reasoning, multimodal capabilities and Google-ecosystem integration | Google-oriented, multimodal and research-capable worker where its connected capabilities are healthy and authorised |
| Perplexity | Research-focused AI using current web information and citations | Fresh public-information research and source-backed synthesis |
| Manus | Multi-step autonomous digital task execution | Higher-autonomy worker for bounded missions while AgentOS retains authority and governance |
| OpenAI Codex | Software-engineering-focused code understanding, change, testing and debugging | Specialist coding worker for repository implementation and verification tasks |
| Cursor | AI-first code editor and codebase-aware development environment | Interactive developer execution surface for repository editing, refactoring and coding workflows |
| Devin | Autonomous software-engineering agent | Specialist worker for longer engineering missions under AgentOS governance |
| Replit | Cloud development, application execution and AI-assisted building | Rapid development, prototyping and cloud execution environment |
| Base44 | Natural-language application and UI building | Rapid prototype, UI and application-scaffolding capability; never an AgentOS control plane |
| AgentMail | Agent-focused email inbox and email actions | Governed communications capability for receiving, sending, replying to and managing agent email workflows |
| Tavily | Search and web-retrieval API for AI agents | Machine-oriented fresh web research and retrieval capability |

### Functional grouping

- **General intelligence:** ChatGPT, Claude, Gemini
- **Research and retrieval:** Perplexity, Tavily
- **Autonomous execution:** Manus
- **Software engineering:** Codex, Cursor, Devin, Replit
- **Rapid app building:** Base44
- **Communications:** AgentMail

A single mission may use multiple core products where justified. Example pattern: research via Perplexity/Tavily, synthesis via ChatGPT/Claude/Gemini, prototype via Base44, implementation via Codex/Cursor/Devin/Replit, and governed communication via AgentMail. AgentOS remains responsible for routing, authority, policy, budget, evidence, verification and assurance.

## Core does not mean unrestricted use

For every program, the following states remain independent:

- catalogue/core inclusion;
- account availability;
- entitlement/subscription;
- connection configured;
- credential availability;
- capability availability;
- capability health;
- authority;
- consent;
- policy/risk;
- budget;
- approval;
- execution;
- verification;
- Green;
- PRS;
- production eligibility.

No provider connection, subscription, successful API response, worker completion or healthy capability may promote another state automatically.

## Capability health

Health must be capability-specific. Supported states include:

`healthy`, `degraded`, `auth_required`, `permission_denied`, `plan_limited`, `quota_limited`, `rate_limited`, `unavailable`, `stale`.

A provider may have one healthy capability while another capability is limited or unavailable.

## Required lifecycle

A core program should progress through evidence-backed states such as:

`CORE -> DOCUMENTED -> CONNECTION AVAILABLE -> CAPABILITY VERIFIED -> GOVERNED USE -> PRODUCTION ELIGIBLE`

with holding states including:

`AUTH_REQUIRED | PERMISSION_DENIED | PLAN_LIMITED | QUOTA_LIMITED | RATE_LIMITED | UNAVAILABLE | STALE | SUSPENDED | DEPRECATED`.

## FAQ requirement

Every core program requires an extensive AgentOS FAQ before documentation readiness is considered complete.

Each FAQ must support one canonical truth model rendered at three depths:

- Everyday
- Advanced
- Tech Head

Minimum subject coverage includes purpose, use cases, free/paid options, connection method, account requirements, permissions, least privilege, read/write capabilities, privacy/data movement, secrets, multiple accounts, capability health, costs/budgets, routing/fallback, upgrade behaviour, autonomy/scheduling, approvals, recovery, replay/duplicate protection, evidence/receipts, Green/PRS, disconnection, troubleshooting, limitations and last-verified evidence.

The FAQ for the $99 tier must state clearly that all twelve core integration surfaces are included in AgentOS, while external provider accounts, subscriptions, API credits and usage charges may still apply.

## Commercial neutrality

Commercial relationships, affiliate economics, referral payments or marketing arrangements must never alter technical worker ranking, authority, verification or assurance decisions.

## Change control

Additions/removals from the core set require a later explicit owner decision and a dated durable update to this registry.

This document does not activate providers, credentials, subscriptions, paid plans, production writes, deployments or production autonomy.
