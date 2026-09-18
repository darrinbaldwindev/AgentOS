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

## Commercial neutrality

Commercial relationships, affiliate economics, referral payments or marketing arrangements must never alter technical worker ranking, authority, verification or assurance decisions.

## Change control

Additions/removals from the core set require a later explicit owner decision and a dated durable update to this registry.

This document does not activate providers, credentials, subscriptions, paid plans, production writes, deployments or production autonomy.
