# Provider Adapter Contract

Provider adapters make external models, agents and specialist services pluggable without changing AgentOS identity or orchestration semantics.

## Lifecycle

Every adapter implements:

- `discover(context)` — determine whether the provider/service is available to this installation.
- `healthCheck(context)` — verify authentication/connectivity and return a health result.
- `capabilities(context)` — return capabilities actually available through the connected integration.
- `execute(task, context)` — execute a task after AgentOS authority/entitlement checks have approved it.

## Separation of concerns

The Worker Registry describes what workers exist. The adapter describes whether a worker is actually reachable. The capability router selects a worker. The authority layer decides whether execution is permitted.

A provider name, product name or subscription status must never be treated as proof of runtime access.

## Connection states

`unconfigured -> discovering -> available -> authenticated -> healthy`

Failure/degradation states are `degraded`, `offline` and `error`.

## Security

Adapters must obtain credentials from the runtime secret/configuration mechanism. Secrets must never be committed to AgentOS source, checkpoints, worker profiles or continuity snapshots.

## Provider neutrality

An adapter does not own the Overseer identity. The persistent `agentos:overseer` remains the system supervisory role regardless of which adapter supplies its current intelligence.

## Next step

Implement concrete adapters one provider at a time, beginning with integrations whose APIs/OAuth/MCP contracts are documented and whose runtime access can be verified. Do not claim a consumer subscription provides API access unless the provider explicitly supports that connection path.
