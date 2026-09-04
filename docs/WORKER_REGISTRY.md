# AgentOS Worker Registry

**Status:** Implemented baseline
**Date:** 2026-08-29

## Objective

AgentOS must be able to support external model/agent subscriptions without redesigning the orchestration layer each time a service is added or removed.

The registry is the stable capability catalogue. Provider adapters are replaceable execution integrations. The router chooses an eligible worker from capabilities, availability and task preferences.

## Initial worker catalogue

| Worker | Kind | Intended role |
|---|---|---|
| GPTChat | model | primary intelligence, orchestration, delegation |
| Claude | model | technical architecture and adversarial review |
| Gemini | model | research and long-context analysis |
| Perplexity | external agent | deep research and competitive intelligence |
| Manus | external agent | external execution, research and review |
| Codex | model-agent | engineering, testing and implementation |
| Cursor | external agent | repository implementation |
| Devin | external agent | autonomous software development |
| Replit | external agent | rapid application prototyping |

Inactive workers remain fully defined. Connecting a subscription changes availability; it does not require a new AgentOS integration design.

## Selection contract

Tasks express capabilities, for example:

```js
{
  capabilities: ['architecture', 'code-review'],
  preferredSubscriptionClass: 'technical-overseer'
}
```

The router then:

1. removes inactive workers;
2. removes workers without a matching capability;
3. scores capability matches and explicit preferences;
4. returns the best eligible worker;
5. returns `null` when no eligible worker exists.

Commercial attribution, affiliate revenue and partner ranking are intentionally excluded from selection.

## Subscription activation

A provider should eventually expose an adapter that can perform four lifecycle operations:

- `discover()` — determine whether the provider is connected;
- `healthCheck()` — verify authentication and basic reachability;
- `capabilities()` — report runtime-supported capabilities;
- `execute(task)` — execute a dispatched task through the provider.

The registry remains provider-neutral. Credentials and secrets must never be committed to the repository.

## Authority boundary

Being subscribed to a model or agent does not automatically grant autonomous execution authority. Entitlement and capability gates remain authoritative. The Worker Registry answers **what exists and what it can do**; the authority layer answers **whether AgentOS is allowed to invoke it**.

## Next integration stages

1. Provider adapter interface and health-state persistence.
2. Credential/environment discovery without storing secrets.
3. Runtime registration on boot.
4. Capability-aware dispatch integration.
5. Worker health and latency telemetry.
6. Fallback chains and multi-worker review.
7. Subscription lifecycle and temporary-worker activation/deactivation.
