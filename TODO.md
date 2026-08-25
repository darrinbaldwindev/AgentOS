# AgentOS CORE-002 Testability TODO

- [x] CORE-002-T1: Add one documented, local-only deterministic test-runner command for all `tests/*.test.mjs` files.
- [x] CORE-002-T2: Reconcile the stale recovery-event status-count assertion with the current allowlisted `recovered` status contract, preserving explicit privacy and validation coverage.
- [x] CORE-002-T3: Add direct runner coverage for success/failure aggregation and confirm the full deterministic suite passes with no provider, credential, affiliate, workspace, or Git mutation.
- [x] CORE-002-T4: Publish the bounded testability evidence and open a pull request for owner review; do not merge directly into `main`.

## CORE-002 local deterministic demo

- [x] CORE-002-D1: Add a local-only CLI entry point that runs one bounded mock mission using the existing workspace, agent, run, tool, provider-handoff, and Overseer contracts.
- [x] CORE-002-D2: Render a compact non-secret summary of mission result, append-only event types, recovery status, and Overseer recommendation without mutating a workspace or calling an external adapter.
- [x] CORE-002-D3: Add direct deterministic tests for demo summary shape and failure/recovery visibility, then rerun the complete local test command.
- [x] CORE-002-D4: Publish a dependent pull request that explicitly requires PR #3 to merge first; do not merge either pull request automatically.
