# AgentOS Decision — Primary Intelligence Subscription

**Date:** 2026-08-27
**Decision:** When the project owner purchases a subscription to an AI model/agent provider for AgentOS, that subscribed provider becomes the **Primary Intelligence** for AgentOS.

## Operating rule

- The subscribed provider is the default intelligence/orchestration layer for AgentOS.
- Free-tier models and agents remain available as secondary/supporting workers where accessible.
- Secondary agents may be used for research, implementation, testing, critique, validation, specialist work, and independent second opinions.
- AgentOS must remain provider-agnostic so the primary provider can be changed without redesigning the operating system.
- A future subscription change should update the Primary Intelligence designation rather than hard-code a permanent provider dependency.

## Current state

The current intended subscription strategy is **ChatGPT/OpenAI as the primary intelligence**, with Manus and other available free AI tiers used as secondary agents/workers until their capabilities justify a paid subscription.

## Architectural implication

AgentOS should maintain an explicit provider role/state such as:

`PRIMARY_INTELLIGENCE`

and distinguish it from:

`SECONDARY_WORKER`
`REVIEWER`
`SPECIALIST`
`FALLBACK`

This decision should be incorporated into future AgentOS routing, delegation, Overseer, continuity, and provider-management work.

**Status:** DECIDED
**Owner approval:** User-directed decision
