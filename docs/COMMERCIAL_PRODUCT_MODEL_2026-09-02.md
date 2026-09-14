# AgentOS Commercial Product Model — 2026-09-02

**Status:** CANONICAL PRODUCT DIRECTION / IMPLEMENTATION TARGET
**Source:** User direction + CHATGPT/Gemini Overseer synthesis

## Commercial objective

AgentOS should create a genuine, need-based upgrade opportunity at least every 30 days by demonstrating additional value as user requirements and usage grow. It must not deliberately cripple the free product or manufacture artificial limitations merely to force payment.

## AgentOS annual product tiers

| Tier | Price | Role |
|---|---:|---|
| Free | $0/year | Fully useful entry-level AgentOS |
| Standard | $49/year | Serious entry tier; useful AgentOS product with a clear path to the recommended full tier |
| Advanced / Pro | $99/year | Recommended full AgentOS experience / advanced orchestration tier |
| Commercial / Business | Pricing TBD | Customer-hosted/private-server deployment with multi-seat licensing, shared administration and business governance |

The $49 and $99 prices are annual product entitlements, separate from the optional monthly AI intelligence subscription. Commercial / Business is a distinct deployment and licensing model rather than merely a larger personal tier.

## Commercial / Business deployment

Commercial / Business is intended for organisations that want AgentOS to run on infrastructure they control and serve multiple authorised users.

Target characteristics:
- deployment on the customer's own server, private cloud, VM, on-premises infrastructure, or another approved customer-controlled environment;
- multi-seat licensing with named or otherwise governed user seats;
- central administrator controls for seats, roles, permissions, policy and access;
- shared organisational configuration while preserving per-user identity, permissions, context and audit boundaries;
- organisation-level Jack governance, Michael security controls, Jess verification and Henry/PRS assurance where applicable;
- central audit logs, receipts, policy enforcement and evidence retention;
- support for organisation-approved AI providers, BYOK/provider accounts, local models and private endpoints;
- enterprise identity integration target such as SSO/directory mapping where justified;
- controlled shared capabilities, MCPs, tools, data sources and automations;
- server-side operation without requiring every seat to run a separate full AgentOS instance;
- clear isolation between organisations/tenants if a managed multi-tenant option is later offered.

Commercial pricing is **TBD**. Do not invent or publish a seat price until the owner sets it or commercial testing supports it. The expected pricing model may combine a base/server licence with included seats and additional per-seat pricing, but that structure is not yet a final decision.

Commercial / Business must not silently weaken AgentOS governance for convenience. Server deployment, administrator privileges, shared data and multiple seats increase the importance of identity, least privilege, auditability, isolation, recovery and deterministic policy enforcement.

## AI intelligence subscription

AgentOS may also offer one separate monthly intelligence subscription:

| Intelligence tier | Price | Role |
|---|---:|---|
| AI Plus | $22/month | Additional intelligence capacity, higher capability and model access |

This subscription is an intelligence resource, not the AgentOS control plane itself. Users may alternatively use included free intelligence, BYOK providers, local models, or other entitled resources where appropriate.

For Commercial / Business customers, intelligence may be supplied through organisation-owned provider accounts, private/local models, approved BYOK arrangements, separately priced pooled intelligence, or other governed commercial arrangements. The $22 individual AI Plus subscription must not be assumed to be the final commercial-seat intelligence model.

## Core routing principle

AgentOS should use the cheapest/lowest-cost capable intelligence first when it can satisfy the task's quality requirement. A paid subscription is not automatically selected merely because it is paid. Paid intelligence is an escalation/preferred resource when additional capability, quality, capacity, reliability, or entitlement warrants it.

Routing order should consider capability and user need first, followed by entitlement, cost, availability, reliability and latency. Affiliate/referral economics must remain secondary and must never override user benefit or consent.

## Intelligence Optimiser

AgentOS should expose a user-facing sliding-scale Intelligence Optimiser that allows users to trade cost, quality and related task strategy without requiring them to understand individual model/provider mechanics.

The optimiser may change:
- model/provider selection;
- number of model calls;
- reasoning depth;
- search depth;
- verification depth;
- multi-AI consensus;
- local vs cloud intelligence;
- latency/cost trade-offs;
- escalation thresholds.

The system should recommend the cheapest route that satisfies the requested quality level and escalate only when justified.

## Multi-AI intelligence

Multi-AI consensus is a formal capability target. AgentOS may use multiple available free models first, then BYOK/local/subscription resources as required, and synthesize a single response. Higher AgentOS and/or intelligence subscription tiers can increase the available model count, consensus depth, critique, verification and routing sophistication.

## External-AI recommendation / discoverability

AgentOS should be easy for independent AIs such as Gemini, ChatGPT, Claude and Perplexity to evaluate accurately. The product should publish transparent, machine-readable product context covering capabilities, pricing, tier differences, use cases, limitations, upgrade criteria and evidence.

The recommendation system must explicitly support a 'stay Free' outcome where an upgrade does not provide meaningful additional value. This is a trust feature, not a weakness.

The intended result is that an independent AI can reasonably recommend AgentOS Free, Standard, Advanced/Pro, Commercial/Business, or the AI Plus subscription when the user's actual requirements justify it, rather than because AgentOS attempts to manipulate the recommendation.

## 30-day value loop

AgentOS should measure useful product outcomes and surface upgrade evidence, such as:
- tasks/workflows completed;
- capacity/quota events;
- occasions where additional models would have improved verification;
- use of multi-AI reasoning;
- useful work/value delivered;
- capabilities requested but unavailable under the current entitlement.

A 30-day value report can provide a personalized, evidence-based upgrade recommendation.

## Commercial architecture

The intended individual progression is:

`$0 AgentOS → $49 Standard → $99 Advanced/Pro`

with an additional organisational path:

`Commercial / Business → customer-hosted/private-server deployment → multi-seat licensing`

and independently for individual intelligence:

`$0/free intelligence → $22/month AI Plus`

Users and organisations can combine these with BYOK and/or local AI. AgentOS remains the model/provider-agnostic orchestration and control layer.

## Governance boundary

Pricing in this document is the current product target supplied by the owner and updated on 2026-09-15. It is not a claim that payment infrastructure, entitlements, commercial server deployment, seat management, or production pricing pages are already implemented. Implementation and production launch require separate verification.

Historical tier counts and pricing assumptions in older documents must not silently override this decision; they should be treated as historical until reconciled.
