# Governed execution reconciliation — 2026-09-14

Scope: AgentOS Project Overseer vertical cycle 002. This is a lineage/contract reconciliation only; it does not merge, rebase, enable mutation, activate providers, or create another control-plane subsystem.

## Current concern ownership

| Concern | Strongest current lineage | Reuse rule |
|---|---|---|
| Runtime connectivity / execution eligibility | PR #112 runtime-shell consolidation | One canonical capability normalization/evaluation path. Provider/model identity must never imply eligibility. |
| Pre-execution composition | PR #108 `runtime/execution-preflight.mjs` | Treat as a composition helper over existing authority, consent, tool policy and budget primitives; do not make it a second authority/policy engine. |
| Remote/local task admission and durable claim/pickup | PR #91 | Reuse existing scheduler, local wake, claim store and persistence. No second queue/dispatcher. |
| Exact completion correlation | PR #94 | Preserve exact task/mission/wake/worker/evidence correlation before reportable completion. |
| Strict autonomy/effective-authority booleans | PR #95 | Preserve explicit Boolean semantics wherever autonomy policy is composed. Truthy strings/numbers/objects must never grant authority. |
| Host status / observational projection | PR #101 | Read-only projection only; must not become execution authority. |
| Windows/PowerShell governed execution and Level 2 file mutation | PR #104 | Existing governed boundary and worker lineage owns this lane. Mutation remains HOLD pending ownership repair and independent assurance. |
| Green completion gate | #82/#84/#87 and descendants | Final COMPLETED must remain impossible without required Green disposition on the applicable bounded path. |
| PRS independent assurance | existing PRS/AgentOS assurance path | Must remain independent of worker/execution claims; no inferred PASS. |

## PR #108 versus current shell consolidation

PR #108 is additive only if it consumes the canonical shell seam and does not independently decide connectivity from pre-evaluated booleans. Its useful responsibilities are:

1. call the runtime shell immediately before governed execution admission;
2. reuse `authoriseDispatch` for issuer/action authority;
3. require explicit task capability grants;
4. enforce consent/approval using the existing human gate;
5. reuse the existing tool policy;
6. reject bounded-slice production scope;
7. reserve/reconcile the existing mission budget around attempted execution.

It must not own scheduler pickup, worker registration, persistence, receipts, Green, PRS, mission-ledger state or provider routing.

## Additional gates that PR #108 does not replace

The strongest Level 2 path still needs the following after preflight:

- exact admitted-task selection and duplicate/replay protection from #91;
- durable result/receipt publication and failure-safe claim handling from #91;
- completion identity/correlation hardening from #94;
- strict Boolean autonomy/effective-authority semantics from #95 when autonomy is involved;
- governed Windows/PowerShell execution and mutation-specific verification from #104;
- Green-before-COMPLETED semantics from the V1 lineage;
- independent PRS assurance where required.

## Integration order

When the hot path is eventually reconciled, the smallest safe order is:

`physical/canonical capability evidence -> authority -> consent/approval -> explicit capability grants -> tool/risk policy -> budget reservation -> existing dispatch/worker -> mutation/execution -> durable receipt/result -> exact correlation -> Green -> PRS eligibility -> final completion`

Discovery, a provider registry entry, `tools/list`, a worker claim, or a pre-evaluated `eligible: true` value is not authority.

## Current false-green finding closed in PR #112

`runtime/agentos-boot.mjs` previously trusted `capabilityProbe.probe(...).evaluation.eligible` directly. Cycle 002 changes boot admission so unlabelled asserted eligibility without capability evidence is rejected before model routing. The historical local DRY_RUN fixture remains a bounded compatibility case and is explicitly classified as `legacy-dry-run-fixture`; it cannot imply local preference or physical capability proof.

This compatibility exception is not production readiness evidence. A later physical adapter mission must replace fixture capability assertions with real connectivity/workspace probes before autonomous execution eligibility is claimed.

## Protected boundaries

No merge, approval, ready transition, rebase, deploy, credential change, production write, unrestricted PowerShell, production autonomy, duplicate scheduler, duplicate worker registry, duplicate policy engine, duplicate persistence layer, duplicate Green or duplicate PRS is authorized by this reconciliation.
