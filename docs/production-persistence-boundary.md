# Production Persistence Boundary

AgentOS wake execution now has an explicit persistence interface for leases and idempotent completions.

## Reference adapter

`src/dispatch/shared-reference-persistence.mjs` composes the existing in-memory lease and idempotency stores. It is suitable for deterministic tests and single-process execution only.

## Shared GitHub adapter

`src/dispatch/github-contents-persistence.mjs` provides a shared persistence implementation backed by the GitHub Contents API. Lease and completion records are stored as repository content and updates/deletes use the returned content SHA as a conditional compare-and-swap boundary. The adapter is asynchronous and is compatible with the wake cycle's persistence interface.

The adapter is **implemented and deterministically verified**, but it is not yet approved for autonomous production writes. GitHub Contents persistence also introduces repository commits for state changes, so a production deployment should use a dedicated state repository or otherwise isolated state path/branch with deliberately scoped write permissions rather than allowing the wake workflow to mutate the application source branch.

## Production requirement

A production adapter MUST provide atomic conditional semantics in a backing store shared by competing runners. In particular:

- lease acquisition must allow only one owner for an active task;
- lease renewal and release must be owner-conditional;
- completion writes must be durable and idempotent;
- competing runners must observe the same state;
- failure recovery must not permit duplicate completion after a successful prior completion.

GitHub-hosted runner local memory/filesystem are not sufficient because runners are ephemeral and isolated. Do not promote the reference adapter to production or enable write-capable autonomy on its basis.

## Promotion gate

Before production promotion, the shared provider must pass actual competing-runner and failure-recovery verification, followed by fresh CI and independent Green Agent/PRS assurance. A deterministic fake-provider test is necessary but is not by itself evidence of live distributed behavior.

The wake workflow must remain read-only until this gate is satisfied. No owner-controlled production credential or write permission is granted implicitly by implementing the adapter.