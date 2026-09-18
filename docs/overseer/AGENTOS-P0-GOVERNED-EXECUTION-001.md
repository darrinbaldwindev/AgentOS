# AGENTOS-P0-GOVERNED-EXECUTION-001

Date: 2026-09-11 (AEST)
Base: `main` @ `e20ecf3bb9c03d1166397af8c204ccb07289d3f3`
Branch: `agent/overseer/integration-gap-001`
Governance: draft implementation only; no merge, approval, ready transition, rebase, deployment, credential change, production write, or autonomy activation.

## Mission

Close the smallest P0 governed-execution gap identified by `AGENTOS-INTEGRATION-GAP-001` without creating duplicate authority, policy, budget, worker, persistence, scheduler, Green or PRS systems.

## Implemented

Added `runtime/governed-execution-boundary.mjs`, a composition boundary that requires existing/injected governance primitives in fail-closed order before an execution callback can run:

`ActorContext -> authority -> consent -> capability eligibility -> policy -> risk -> budget reservation -> approval when required -> invoke -> durable receipt -> verification -> budget reconciliation`

The boundary deliberately does not implement its own policy engine, capability registry, worker runtime, scheduler, persistence layer, Green Agent or PRS. It composes those responsibilities and rejects construction when any required gate is absent.

Post-execution behavior is also fail-closed: a missing receipt or failed verification cannot return `VERIFIED`; attempted work is budget-reconciled as charged, while a pre-execution approval failure reconciles at zero.

## Tests

Added `tests/governed-execution-boundary.test.mjs` covering:

- context failure prevents invocation
- authority failure prevents invocation
- consent failure prevents invocation
- capability failure prevents invocation
- policy failure prevents invocation
- risk failure prevents invocation
- approval happens after risk + reservation and before execution
- approval denial reconciles budget at zero
- malformed risk decision fails before reservation/execution
- success requires receipt + verification + reconciliation
- missing receipt cannot produce verified completion
- failed verification cannot produce verified completion and preserves receipt evidence

## Evidence

Implementation commit: `869abbfb2160321368747715c9ec9424f964ce33`.
Test commit / exact tested code head: `53366824ec822fa7a20d46853f839b7e8e8cb61e`.
GitHub Actions `AgentOS Tests` run `34540717480` completed successfully on exact head `53366824ec822fa7a20d46853f839b7e8e8cb61e`.

This is deterministic composition evidence only. It does not yet prove the existing `runtime/local-wake.mjs` hot path is using this boundary, does not replace its synthetic boot eligibility fixture, and does not yet wire mandatory Green/PRS assurance into final local-wake completion.

## Next vertical step

Wire the canonical `runtime/runtime-shell.mjs` eligibility result and existing dispatch/authority/budget/worker primitives through this composition boundary on the bounded DRY_RUN local-wake path. Preserve existing scheduler and worker architecture. Add negative full-path tests proving a failed shell capability probe or approval gate prevents worker invocation and final `COMPLETED` persistence.

Do not add live providers, credentials, production writes, remote transport or production autonomy in that step.
