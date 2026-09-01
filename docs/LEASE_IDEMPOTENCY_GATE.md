# Lease and Idempotency Promotion Gate

A lease implementation is not by itself proof of distributed exclusivity.

## Required before write-capable autonomous execution

1. Atomic acquisition in the actual persistence backend.
2. Unique task identity and idempotent completion recording.
3. Owner-bound renewal and release.
4. Expiry/recovery behaviour.
5. Duplicate-runner test against the production-like adapter.
6. Durable audit events for acquisition, renewal, expiry, completion and rejection.
7. Commit-scoped CI evidence for the implementation.
8. Independent PRS/Green Agent assurance before promotion.

The in-memory `LeaseStore` is a deterministic reference implementation and test seam. It must not be represented as a distributed lock or used as evidence of production concurrency safety.
