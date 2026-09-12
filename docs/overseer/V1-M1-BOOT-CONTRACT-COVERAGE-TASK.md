# Version 1 M1 — Direct Boot-to-Observation Contract Coverage

**Status:** `VERIFIED — OWNER REVIEW PENDING`
**Branch:** `agent/overseer/v1-m1-contract-coverage`
**Base:** `e06f8f55795594fb6a4160e5ec24aa37308db3c4` at branch creation.
**Current rebase base:** `74d48a129467679c83f44ccc193a2df34e43e97a`.
**Pull request:** [#6 — test: cover Version 1 boot-to-observation contracts](https://github.com/darrinbaldwindev/AgentOS/pull/6)

## Objective

Add direct deterministic coverage for the canonical boot-to-observation contracts required by the Version 1 read-only repository observer roadmap. The scope is test-only and uses in-memory persistence plus fake capability, registry, router, provider, and execution seams.

## Covered contracts

| Test module | Direct coverage |
|---|---|
| `m1-boot-and-lifecycle.test.mjs` | AgentOS boot success, continuity failure, eligibility failure, bootstrap restore, activation, event persistence, and immutable return contracts. |
| `m1-session-routing-provider.test.mjs` | Offline/no-model session rejection, routed execution event persistence, stable free-preferred pipeline envelope, available-model registry filtering, router fail-closed behavior, provider adapter normalization, and provider-executor fail-closed behavior. |
| `m1-no-live-side-effects.test.mjs` | Static no-live-side-effect boundary across boot, bootstrap, session, pipeline, registry, router, provider adapter, and provider executor modules. |

## Safety boundary

No test uses a real repository, workspace, network request, provider SDK, credential, provider key, affiliate service, connector, Desktop binding, Git mutation, schedule, deployment, or production runtime. The provider path is a fake in-memory function and the state path is the existing in-memory persistence bridge.

## Verification

| Command | Result |
|---|---|
| `git diff --check` | Passed |
| Focused M1 test files | Passed |
| `node scripts/run-tests.mjs` | Passed after rebase onto current canonical `main` |
| `npm test` | Passed after rebase — 40 tests, 0 failures |

## Review handoff

The owner-review pull request is open and has been rebased onto current canonical `main`, then fully revalidated. It must be reviewed before merge; it does not authorize the M2 durable-state work, a repository adapter, or any external integration.
