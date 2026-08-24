# AgentOS Provider Boundary

AI providers are execution dependencies, not AgentOS identities.

A provider adapter exposes:

- an identifier
- available models
- model metadata/capabilities
- execution

The Overseer router selects a model using the model registry. The provider executor then resolves the model's provider and invokes its adapter.

This boundary allows GPT, Claude, Gemini, OpenRouter, local models and future providers to be added without changing the Overseer identity, mission continuity or persistence model.

Provider failure must be treated as an execution failure. The system should preserve the mission and allow Overseer to retry or route to another eligible model rather than losing the conversation.
