# AGENTOS-P0-GOVERNED-EXECUTION-001

Base: `main` @ `fd88a05754adf44dc5feb22952b2658c121b7207`.

Purpose: close the smallest pre-execution governance gap without adding a second scheduler, worker runtime, authority engine, policy engine, capability registry, persistence layer, Green Agent or PRS system.

## Implemented

- Added `runtime/execution-preflight.mjs` as a composition boundary over existing primitives.
- Reuses canonical dispatch authority via `authoriseDispatch`.
- Reuses canonical runtime-shell eligibility via `assertExecutionEligible`.
- Requires explicit required-capability grants rather than treating discovery/availability as authority.
- Supports existing human-gate approval for `EXPLICIT_APPROVAL`; `PRE_AUTHORIZED` remains an explicit bounded mode.
- Reuses existing tool policy when a tool is named.
- Rejects production scope / production-write constraints in this bounded slice.
- Reserves budget only after every pre-execution gate passes.
- Reconciles attempted execution budget on both success and execution failure.

## Deterministic acceptance tests

`tests/execution-preflight.test.mjs` covers:

1. runtime ineligibility blocks before execution;
2. missing required capability grant blocks before execution;
3. explicit human approval blocks until resolved with `approve`;
4. tool-policy denial blocks before execution;
5. production scope blocks before budget reservation or execution;
6. budget reservation occurs only after admission and reconciles on success;
7. attempted execution failure still reconciles consumed budget.

## Exact-head CI

Draft PR #108 was opened at head `8fc99ee5522967673365194311e1f4ab48e7744a` and triggered exact-head GitHub Actions.

- AgentOS Tests #830: **SUCCESS**.
- Project Overseer Wake #342: **SUCCESS**.

A later documentation-only commit records this evidence, so the implementation/test tree certified by those runs remains `8fc99ee5522967673365194311e1f4ab48e7744a`.

## Reconciliation check

PR #95 independently demonstrates that JavaScript truthiness can create false authority grants and hardens the existing autonomy helper to require explicit booleans. This preflight slice does not replace that autonomy helper. Its own admission checks use exact string modes, explicit array membership and the existing dispatch authority policy. Future hot-path integration must preserve #95's strict Boolean semantics where autonomy authority is composed.

## Boundaries

This slice is intentionally not yet wired into `runtime/local-wake.mjs` because the strongest local-wake/Green/persistence path lives on active draft lineages and blindly editing current main would duplicate or conflict with those repairs. The next step is reconciliation against the strongest #84/#87/#91/#94/#95 lineages before integrating the preflight into a canonical execution path.

No provider, OAuth, MCP, filesystem, shell, browser, scheduler, dispatch, credential, deployment or production-autonomy capability was activated. No merge, approval, ready transition or rebase is authorized by this work.

## Acceptance evidence required before integration

- Exact implementation-head CI: satisfied on `8fc99ee...`.
- Independent review should confirm this module composes existing authority/policy primitives rather than becoming a competing policy engine.
- Integration into local wake must preserve Green-before-COMPLETED and durable receipt semantics from the stronger draft lineage.
