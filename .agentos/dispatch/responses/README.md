# Dispatch Responses

External and internal agents return durable task responses here.

Responses are correlated to dispatch envelopes by exact `task_id`.

A response is actionable only when its status and evidence satisfy the task acceptance criteria. `completed` without evidence is invalid. Agents must not grant themselves authority through a response.

The first live protocol acceptance test is `agentos-e2e-001`.
