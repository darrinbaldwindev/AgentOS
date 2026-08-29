# AgentOS Revenue Architecture

**Status:** Strategic baseline
**Date:** 2026-08-29

## Objective

Make monetisation a first-class AgentOS subsystem without allowing commercial incentives to corrupt worker selection, governance, safety, or technical quality.

## Revenue channels

### 1. AgentOS subscriptions

Recurring tiers unlock progressively broader capability access:

- model and external-agent slots;
- intelligent Overseer selection;
- multi-model and multi-agent orchestration;
- preconfigured Skill Agents;
- user-created Skill Agents;
- autonomous execution;
- scheduling and monitoring;
- project and GitHub provisioning;
- advanced governance and business controls.

Existing entitlement identifiers remain the source of truth. Revenue plans map to capabilities rather than being hard-coded throughout the runtime.

### 2. Metered execution

Some expensive or variable-cost operations should support usage-based charging in addition to subscriptions:

- autonomous development runs;
- deep research jobs;
- large document processing;
- high-volume automation;
- premium external-provider execution.

Use credits/usage records rather than exposing provider token economics directly to customers.

### 3. Skill-Agent marketplace

Allow creators to publish reusable AgentOS Skill Agents. Candidate commercial models:

- one-time purchase;
- monthly subscription;
- usage-based execution;
- bundled marketplace access.

Platform revenue can come from a transparent marketplace take rate while the creator receives the majority of the sale.

Marketplace requirements:

- versioning;
- creator identity;
- capability declaration;
- permission scopes;
- automated security checks;
- human review for higher-risk agents;
- audit history;
- ratings/reputation based on actual usage;
- license and refund rules.

### 4. Business / enterprise automation

Higher-value customers can pay for:

- private agents;
- team workspaces;
- project-specific Overseers;
- persistent memory/continuity;
- integrations;
- approval workflows;
- audit logs;
- SSO/RBAC;
- governance policies;
- higher autonomy limits;
- dedicated capacity.

### 5. Partner ecosystem revenue

Provider integrations, implementation partners and commercial referrals may produce revenue, but partner economics must remain isolated from execution ranking.

## Commercial neutrality rule

The worker router must never rank a provider higher because AgentOS earns more money from that provider. Selection is based on task suitability, eligibility, availability, reliability, user policy, quality and applicable cost controls.

This preserves the existing entitlement architecture rule that commercial attribution must not become a hidden capability-selection criterion.

## Product architecture

```text
Customer
   |
   v
Entitlement / Billing
   |
   +--> Capability Gate
   |
   +--> Usage Meter
   |
   +--> Marketplace
   |
   v
AgentOS Orchestrator
   |
   +--> Worker Registry
   +--> Capability Router
   +--> Overseer
   +--> Skill-Agent Runtime
   |
   v
Providers / Agents / Tools
```

Billing controls access and records consumption. It must not become the source of truth for technical execution authority.

## Initial product ladder

### Free

Useful standalone AgentOS experience with constrained model/agent slots and user-selected resources.

### Pro

Intelligent worker selection, broader model/agent access, preconfigured Skill Agents, automation and multi-model workflows.

### Pro+

More autonomous execution, more Skill Agents, project automation, deeper continuity and higher usage limits.

### Business

Team collaboration, governance, integrations, private agents, auditability and enterprise controls.

### Marketplace

Separate ecosystem revenue from subscriptions. Creators can monetise Skill Agents while AgentOS earns a transparent platform share.

## Success metrics

Track:

- conversion Free -> paid;
- paid retention;
- average revenue per account;
- gross margin after provider/inference costs;
- usage per paid account;
- Skill-Agent attach rate;
- marketplace GMV;
- marketplace take rate;
- creator earnings;
- automation execution volume;
- successful task completion;
- autonomous-run approval rate;
- cost per completed outcome.

## Important commercial principle

Do not optimise AgentOS for subscription count alone. The strongest long-term revenue model is likely a combination of recurring platform revenue + usage/outcome revenue + marketplace revenue + business automation, with the product charging for valuable work rather than merely for access to a chatbot.
