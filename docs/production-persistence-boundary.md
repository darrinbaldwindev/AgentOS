# Production Persistence Boundary

AgentOS wake execution now has an explicit persistence interface for leases and idempotent completions.

## Reference adapter

`src/dispatch/shared-reference-persistence.mjs` composes the existing in-memory lease and idempotency stores. It is suitable for deterministic tests and single-process execution only.

## Production requirement

A production adapter MUST provide atomic conditional semantics in a backing store shared by competing runners. In particular:

- lease acquisition must allow only one owner for an active task;
- lease renewal and release must be owner-conditional;
- completion writes must be durable and idempotent;
- competing runners must observe the same state;
- failure recovery must not permit duplicate completion after a successful prior completion.

GitHub-hosted runner local memory/filesystem are not sufficient because runners are ephemeral and isolated. Do not promote the reference adapter to production or enable write-capable autonomy on its basis.

## Promotion gate

Before production promotion, implement a shared conditional/atomic provider, wire it into the wake runner, add competing-runner and failure-recovery tests, and obtain fresh CI plus independent Green Agent/PRS assurance.
