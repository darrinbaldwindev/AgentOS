# AgentOS Free-First Commercial Model

**Status:** Architecture decision
**Date:** 2026-08-29

## Principle

AgentOS must be useful at the free level. Users must not be forced to purchase a model, agent subscription or API key merely to obtain a functional AgentOS experience.

Paid intelligence is an **optional capability upgrade**.

## Three user paths

### 1. Free-first

AgentOS uses whatever free/limited workers are legitimately available to the user. The system routes work within those limits and explains constraints without manufacturing a paywall.

### 2. Bring-your-own subscription

If a user already subscribes to a supported model or agent, AgentOS should offer the appropriate supported connection path. A consumer subscription is never assumed to include API access.

### 3. Capability upgrade

When a meaningful workload or capability gap is detected, AgentOS may recommend a paid subscription or API connection for a specific reason, such as higher capacity, autonomous execution, specialised research, coding, automation or application building.

## Recommendation rules

AgentOS may recommend an external paid service only when:

1. A real capability or capacity gap is detected.
2. The recommended service materially improves the identified workload.
3. The recommendation explains the expected benefit.
4. Existing connected/free workers are considered first.
5. The user can connect an existing subscription where supported.
6. API and consumer subscription requirements are clearly distinguished.
7. A cheaper or free alternative is shown when materially viable.
8. Commercial relationships are disclosed.
9. Affiliate/reward economics never change the technical worker ranking.
10. AgentOS can recommend a one-month trial when a short-term capability spike makes that economically sensible.

## Recommendation output

A recommendation should expose:

- capability gap
- affected workload/projects
- recommended provider
- why it is a fit
- estimated usage/benefit
- subscription vs API distinction
- setup method
- approximate cost, when verified
- free/cheaper alternatives
- one-month trial suitability
- affiliate/referral/reward availability, if verified
- commercial disclosure
- confidence

## Example

> **Capability upgrade recommended: Claude**
>
> You have 8 architecture/review tasks queued. Your current workers can complete them, but an additional technical-review worker is likely to reduce turnaround time and provide independent review.
>
> **Try for one month:** Yes
> **Connect existing account:** If supported
> **API:** Separate billing may apply
> **Alternative:** Use your existing Gemini/Codex workers
> **Commercial relationship:** Disclose if an affiliate/partner link is used

## Commercial separation

The system maintains two independent scores:

- `worker_score`: capability, reliability, availability, latency, cost and task fit.
- `commercial_score`: affiliate, referral, reward, partner and marketplace economics.

`commercial_score` MUST NOT be used to increase `worker_score` or override technical selection.

## Provider connection states

A provider may be:

- `free_available`
- `subscription_available`
- `api_available`
- `oauth_available`
- `mcp_available`
- `connected`
- `health_failed`
- `inactive`

The registry must not infer an API entitlement from a consumer subscription.

## Revenue philosophy

AgentOS should monetize value above the minimum viable free experience through its own premium features, Skill Agents, automation, business capabilities and marketplace services. External affiliate/referral revenue is supplementary and must never compromise user trust or technical neutrality.
