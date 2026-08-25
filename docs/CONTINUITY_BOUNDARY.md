# AgentOS Continuity Boundary

AgentOS continuity is split into two layers:

1. **Local durable state** — the canonical runtime state survives process restart through the persistence contract.
2. **Portable project continuity** — GitHub/local workspace synchronization makes canonical project state portable between machines and environments.

A provider/model conversation is not the source of truth. The persistent AgentOS mission, run, event, artifact and project state is the source of truth.

## Consequence

Changing GPT, Claude, Gemini, OpenRouter or a local model must not create a new AgentOS identity or discard mission state.

The next implementation layer is a synchronization service that can safely reconcile local durable state with the project's GitHub continuity records without allowing provider chat history to become authoritative.
