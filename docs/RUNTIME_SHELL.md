# AgentOS Runtime Shell

The runtime shell is an integration boundary, not the AgentOS domain model.

## Responsibilities

- identify an agent/provider integration
- perform real capability probes
- require GitHub read + continuity read + handoff before autonomous execution
- prefer local workspace access when both workspace read/write are available
- expose GitHub/workspace adapters without coupling core modules to a provider or UI
- deny execution when required canonical-state access is unavailable

## Adapter boundary

Adapters are responsible for real connectivity checks. The core must never infer capability from a provider name, marketing tier, or prior success.

A shell may expose:

- `capabilityProbe`
- `workspaceAdapter`
- `githubAdapter`
- provider adapter(s)
- persistence adapter
- UI adapter

The core consumes contracts, not implementations.

## Execution authorization

`authorize(agentId)` performs a fresh capability inspection and returns either a local-preferred or GitHub execution mode. Missing required capabilities result in `AGENT_NOT_ELIGIBLE`.

## Local-first policy

If a trustworthy local workspace is available with read/write access, it is preferred for active work. GitHub remains the portable canonical synchronization/recovery surface.

## Future shell implementations

The same contract can be implemented by a desktop shell, mobile shell, CLI, web-controlled local runtime, or another host without changing AgentOS domain logic.
