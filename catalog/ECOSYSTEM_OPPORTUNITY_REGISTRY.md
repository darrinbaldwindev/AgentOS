# AgentOS Ecosystem Opportunity Registry

## Purpose

This registry is the discovery/acquisition layer for external AI, developer, automation, infrastructure, commercial and startup opportunities. It feeds capability classification and entitlement/routing decisions without making any provider a permanent dependency.

The canonical strategic source is `logs/2026-08-30-chatgpt-overseer-ecosystem-research.md`.

## Control-plane position

```text
ChatGPT Overseer ecosystem research
        ↓
Ecosystem Opportunity Registry
        ↓
Capability classification
        ↓
Provider Entitlement Registry
        ↓
Model Registry / Worker Registry
        ↓
Capability Router
        ↓
Interface Worker / Provider
        ↓
Evidence → Verification → State/Log
```

The existing commercial architecture remains authoritative for separating technical model capability, user/provider entitlement, and commercial opportunity. This registry adds the missing discovery/acquisition layer.

## Source hierarchy

1. Canonical ChatGPT Overseer ecosystem log
2. Current repository architecture and registries
3. Current official provider/product evidence
4. Project-local historical research
5. Third-party claims only as candidates requiring verification

A search miss is not evidence of absence. Conflicts must be recorded and reconciled.

## Lenny's Product Pass

Lenny's Product Pass is treated as an **acquisition source**, not as a provider. Its individual products are represented as separate ecosystem opportunities so AgentOS can evaluate each capability independently.

The initial 12 priority opportunities are tracked in `ecosystem_opportunity_registry.json` and the onboarding source document `docs/LENNYS_PRODUCT_PASS_AGENTOS_ONBOARDING.md`.

## Sumo App

Sumo App is recorded as a candidate from prior ChatGPT Overseer context. No capability, pricing, entitlement, automation interface or commercial status is asserted by this entry. It requires current-source research before it can affect routing or activation.

## Integration lifecycle

`discovered → candidate → ready_for_activation → active → verified`

Failure states are `blocked` and `expired`.

A product is not `active` merely because it appears in a bundle or subscription. A product is not `verified` merely because an onboarding document exists.

## Worker/interface rule

AgentOS should route to a capability and then select the best eligible interface worker. Possible interfaces include API, local runtime, CLI, browser, desktop app, MCP/tool and workspace integrations.

If no supported automation interface exists, the product remains a research/capability option and must not be represented as an executable worker.

## Commercial separation

Commercial relationships must remain separate from capability routing. Affiliate/referral/partner status may be used for commercial disclosure and revenue analysis, but must not override capability fit, entitlement, health, privacy, user consent, cost or policy.

## Activation gate

Before activation:

- verify current official terms
- verify entitlement/access
- determine interface
- define permissions
- define adapter/worker
- run a bounded safe test
- capture evidence
- independently verify the result
- update state and logs

No registry entry authorizes purchase, enrollment, credential use, external outreach or referral routing.
