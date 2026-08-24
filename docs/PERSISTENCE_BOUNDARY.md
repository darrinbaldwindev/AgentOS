# AgentOS Persistence Boundary

AgentOS separates durable state into three classes.

## Canonical

Project-relevant state that another device or eligible agent must be able to reconstruct:

- source and tests
- mission continuity
- architectural decisions
- audit/change-log records

Canonical state may be synchronized through GitHub subject to repository policy.

## Operational

Useful runtime state that is durable locally but does not need to become repository state:

- process/runtime metadata
- local caches
- temporary execution indexes
- device-specific state

Operational state is local by default.

## Secret

Credentials, access tokens, private keys, secrets and equivalent sensitive material.

Secret state may be used by a local/provider integration but is never placed into continuity records or synchronized through the project repository.

## Reconstruction rule

A new device or agent should be able to reconstruct the project from canonical repository state. Operational state may be regenerated. Secrets must be provisioned through the host's secure credential mechanism.

## Device handoff

When moving from PC to mobile or another host:

1. synchronize canonical state;
2. verify repository integrity;
3. establish local credentials independently;
4. rebuild operational state;
5. run capability probes;
6. allow autonomous execution only if the agent passes the AgentOS eligibility contract.
