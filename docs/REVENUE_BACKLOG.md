# AgentOS Revenue Implementation Backlog

## P0 — foundation

- [ ] Define canonical `billing.account` and `billing.entitlement` interfaces.
- [ ] Map existing capability identifiers to commercial plans without hard-coding plan names in runtime logic.
- [ ] Define usage event schema for model calls, agent runs, Skill-Agent runs and autonomous executions.
- [ ] Add cost/usage accounting separate from provider selection.
- [ ] Define customer-visible usage and quota reporting.

## P1 — paid product

- [ ] Implement plan-aware capability gate integration.
- [ ] Implement metered credits/usage limits.
- [ ] Add premium autonomous execution controls.
- [ ] Add business/team workspace entitlement primitives.
- [ ] Add billing webhook/event abstraction.

## P1 — Skill-Agent commerce

- [ ] Define Skill-Agent package manifest.
- [ ] Add permissions/capability declarations.
- [ ] Add version and compatibility metadata.
- [ ] Add security scanning status.
- [ ] Add creator ownership/license metadata.
- [ ] Define one-time, subscription and usage pricing models.
- [ ] Add marketplace listing/review state.

## P2 — marketplace

- [ ] Marketplace catalogue.
- [ ] Search/discovery.
- [ ] Purchase/licensing.
- [ ] Creator dashboard.
- [ ] Revenue-share ledger.
- [ ] Refund/dispute lifecycle.
- [ ] Reputation based on verified usage.

## P2 — business revenue

- [ ] Private Skill Agents.
- [ ] Team workspaces.
- [ ] RBAC/approval policies.
- [ ] SSO/enterprise identity.
- [ ] Audit/export controls.
- [ ] Dedicated capacity options.
- [ ] Business integrations catalogue.

## P3 — outcome economics

- [ ] Per-task pricing experiments.
- [ ] Outcome-based pricing where objectively measurable.
- [ ] Automated gross-margin monitoring.
- [ ] Provider cost optimisation that remains independent of commercial attribution.

## Guardrails

- Provider commission must never influence worker ranking.
- Billing must never grant capabilities that authority policy does not allow.
- Provider credentials must never enter repository state.
- Marketplace agents must be permission-scoped and auditable.
- Customer data ownership and retention rules must be explicit.
- Paid tiers must increase capability rather than intentionally degrading lower-tier model quality.
