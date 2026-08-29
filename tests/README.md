# AgentOS test contract

The repository test command is `npm test`.

The vertical runtime tests exercise the mission facade, decision loop boundary, human gate, checkpoint lifecycle, and resume path without requiring a paid model/API.

Provider adapters are intentionally kept outside these deterministic tests. They can be added behind the worker contract once the core runtime is green.

## First acceptance scenario

1. Start a mission.
2. Overseer resolves requirements and selects a worker.
3. Worker executes.
4. Result is observed.
5. Mission completes without unnecessary verification.

## Safety acceptance scenario

1. Start a mission.
2. Routing/execution becomes blocked or unresolved.
3. Mission is checkpointed and enters `awaiting_human`.
4. Owner supplies a decision.
5. Mission resumes through the Overseer.
6. Successful completion transitions the mission to `completed`.
