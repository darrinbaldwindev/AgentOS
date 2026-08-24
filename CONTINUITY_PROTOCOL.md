# AgentOS Continuity Protocol

## Purpose

AgentOS uses repository state as portable project memory. A model or agent joining the project must be able to reconstruct the current mission, decisions, work completed, blockers, and next action without relying on provider-specific chat history.

## Canonical sources

1. **Code and tests** — what currently exists.
2. **Event/state records** — what the runtime has observed and executed.
3. **Progress/change log** — what changed and why.
4. **Checkpoint** — the compact handoff state for the next agent.

## Agent handoff contract

Before stopping work, an agent should update the checkpoint with:

- `mission`: current project mission
- `phase`: current development phase
- `completed`: concrete completed work
- `in_progress`: current work
- `next`: one highest-priority next action
- `blockers`: known blockers
- `decisions`: durable architectural decisions
- `risks`: known technical/product risks
- `last_change`: latest meaningful change

## Provider independence

Provider conversation history is advisory, not canonical. An agent must reconstruct mission continuity from AgentOS state and repository artifacts. Provider-specific prompts, credentials, tokens, and secrets must not be stored in continuity records.

## Handoff semantics

A provider change does not create a new mission. It creates a new execution attempt or handoff within the existing mission/run lineage. Context snapshots carry only approved operational state.

## Overseer role

The default Overseer audits continuity, runtime health, policy decisions, provider failures, and change recommendations. It must not silently rewrite project intent. Recommendations require review unless an explicitly authorised automation policy says otherwise.

## Recovery rule

If the checkpoint conflicts with code or runtime state, code/runtime state wins. The agent should record the discrepancy and update the checkpoint rather than guessing.
