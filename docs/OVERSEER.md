# AgentOS Overseer

Overseer is a first-class system agent and the primary user-facing intelligence of AgentOS.

## Identity

The Overseer identity belongs to AgentOS, not to an AI provider. The model powering a turn may change without changing the Overseer identity, mission lineage or user conversation.

## Boot order

1. Load durable state.
2. Bootstrap or restore `agentos:overseer`.
3. Verify local/GitHub continuity access.
4. Probe available worker/model integrations.
5. Activate Overseer only after required checks pass.
6. Present the single user-facing Overseer session.

## Model routing

For each task, Overseer may select among eligible free, subscription, API and local models. A suitable free model should be preferred when it satisfies the task requirements. Paid or higher-capability models may be selected when task requirements justify them.

## Continuity

Switching the underlying model does not create a new mission or user conversation. Routing is an implementation detail of the persistent Overseer role.

## Supervision

Overseer can delegate work, receive results, audit outcomes and create recommendations. It remains responsible for maintaining mission continuity and surfacing conflicts or failures.
