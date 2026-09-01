# Idempotency Promotion Gate

Task identity must be stable for the full lifecycle. A task may have at most one durable terminal completion record.

## Required properties

- duplicate completion is rejected
- response is retained for reconciliation
- invalid task IDs fail closed
- terminal completion must be correlated to the task ID
- distributed persistence must provide atomic conditional creation before multi-runner production use

The current `IdempotencyStore` is a deterministic in-process reference implementation. It is not production evidence of distributed idempotency.
