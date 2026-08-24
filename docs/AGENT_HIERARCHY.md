# AgentOS Agent Hierarchy

This document reconciles the original coordination roles with the newer Overseer-first runtime architecture.

## Authority model

### Project Owner
Human authority. Owns strategic forks, credentials, external activation, monetization decisions and release approval.

### Primary Coordinator — `architect-prime`
Project-level coordination role. Maintains canonical coordination records, reconciles specialist results, controls bounded task issuance and protects project scope. It is not itself the user's runtime Overseer.

### AgentOS Main / development agents
Implementation roles that build, test, inspect and evolve AgentOS. They may operate autonomously within the permissions and task boundaries provided by the coordinator/owner.

### Overseer — `agentos:overseer`
The permanent AgentOS system agent and eventual primary user-facing intelligence. Overseer supervises runtime work, maintains mission continuity, routes tasks to eligible models/agents, monitors execution, audits outcomes and provides the single conversational interface.

### Specialist agents
Task-scoped workers such as research or affiliate specialists. They execute bounded assignments and return evidence/results to the coordination layer. They do not become the canonical project authority.

### Model/provider workers
GPT, Claude, Gemini, OpenRouter, local models and other providers are execution engines. They are not AgentOS identities. The model powering an Overseer turn may change without changing the Overseer identity or mission.

## Canonical flow

```text
Project Owner
     |
     v
architect-prime (project coordination)
     |
     +---- development agents / AgentOS Main
     |
     +---- specialist agents
     |
     v
AgentOS runtime
     |
     v
Overseer (agentos:overseer)
     |
     +---- model/provider workers
     +---- tools
     +---- local workspace
     +---- GitHub continuity
```

## Important distinction

The coordination hierarchy and runtime hierarchy are related but not identical. `architect-prime` governs project coordination; Overseer governs the running AgentOS experience. This prevents the original specialist/coordination protocol from being discarded while allowing Overseer to become the Jarvis-like runtime interface.

## Continuity rule

Agent identity, mission state and canonical project records belong to AgentOS. Provider conversations are replaceable execution contexts and must not be the sole source of continuity.
