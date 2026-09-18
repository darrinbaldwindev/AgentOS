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

## CORE-002 safe run inspection

- [x] CORE-002-I1: Add a local-only run inspector that returns a compact non-secret read model for one workspace/agent/run, its append-only event types, and its Overseer recommendation state.
- [x] CORE-002-I2: Reject missing/unknown runs and omit prompts, mission inputs, metadata payloads, credentials, raw URLs, workspace contents, and artifact payloads from the inspection result.
- [x] CORE-002-I3: Add direct run-inspector and demo integration coverage, then rerun the complete deterministic suite.
- [x] CORE-002-I4: Open a dependent review pull request that requires PR #3 and PR #4 to merge first; do not merge automatically.

## Version 1 M1 direct contract coverage

- [x] V1-M1-T1: Add deterministic fake-adapter coverage for AgentOS boot continuity/eligibility, Overseer bootstrap/activation, and boot event persistence.
- [x] V1-M1-T2: Add deterministic coverage for Overseer session/pipeline routing, available-model selection, provider adapter/executor fail-closed behavior, and bounded payload forwarding.
- [x] V1-M1-T3: Add a static no-live-side-effect regression check covering the eight boot-to-observation modules and rerun the complete local suite.
- [x] V1-M1-T4: Publish the bounded M1 test-coverage pull request for owner review; do not merge directly into `main`.
