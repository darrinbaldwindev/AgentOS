# AgentOS Vertical Execution Batch

## Project / control
- Repository: `darrinbaldwindev/AgentOS`
- Canonical portfolio mission: `darrinbaldwindev/Overseer#49`
- Active implementation PR: `AgentOS#104` — `agent/overseer/windows-worker-bridge`
- Purpose: bounded Level 2 execution manifest for fresh-scan -> execute -> verify -> rescan -> replenish cycles.
- Doctrine: `darrinbaldwindev/Overseer/.overseer/doctrine/VERTICAL-BATCH-EXECUTION.md`

## Fresh-scan checkpoint
- Reconciled: 2026-09-14 18:08+10:00 (Brisbane)
- Pre-batch PR head: `9f53df16ae37ee6a86e66d2a808ca7f62f203d76`
- PR state: OPEN / DRAFT / UNMERGED.
- Exact-head AgentOS Tests workflow `34816222109` concluded `success` on attempt 2.
  - Windows / Node 26 job `103900650178`: test suite PASS, npm audit PASS.
  - Ubuntu / Node 22 job `103900651331`: test suite PASS, npm audit PASS.
- Existing independent assurance remains controlling: project-file mutation is not overall GREEN; continuous kernel-enforced ownership across verification -> publish/recovery -> durable success receipt remains unresolved.
- Canonical authenticated transport / grant-source admission remains unresolved; no duplicate authority source may be invented.

## Governance boundaries
This batch does **not** authorize merge, approve, mark-ready, rebase, deploy, credential changes, production writes, unrestricted PowerShell, production runtime enablement, purchases, external contact, bypass of Green/PRS, or creation of duplicate scheduler/queue/registry/mission-ledger/authority/persistence/governance systems.

Evidence controls completion. Worker claims are leads only. Green and PRS must remain independent of the execution instance.

## Current vertical batch

| ID | Priority | State | Work item | Completion evidence |
|---|---:|---|---|---|
| A-OWN-01 | P0 | BLOCKED | Establish a continuous kernel-enforced project-file ownership fence held through final verification, publish/prepared recovery, and durable success-receipt persistence. | Adversarial exact-head tests must prove successor displacement/stale-owner publication cannot succeed; crash release/recovery proven; independent Green PASS required before promotion. |
| A-REC-02 | P0 | PENDING | After A-OWN-01 changes, run homogeneous recovery cases: crash before publish, crash after publish before receipt, crash during prepared recovery, stale-lock/successor takeover. | Exact-head deterministic tests plus durable mutation/recovery receipts; no false COMPLETED state. |
| A-IDEM-03 | P0 | PENDING | Exercise duplicate/replay protection across admitted task, claim, execution, result write and terminal receipt. | Duplicate delivery causes zero second mutation/adapter execution; exact task/mission/worker/result correlation retained. |
| A-CONC-04 | P0 | PENDING | Exercise shared-state concurrent-writer cases against the ownership primitive without creating a parallel lock/ledger. | Competing writer cannot publish under stale ownership; deterministic winner/loser evidence; recovery remains resumable. |
| A-AUTH-05 | P0 | BLOCKED | Bind remote admission to an existing canonical authenticated actor + grant source and preserve required capabilities through local-wake execution. | Evidence of real canonical source and fail-closed denial tests; no hard-coded substitute identity/grant source. |
| A-CI-06 | P0 | VERIFIED | Close exact-head cross-platform test/audit evidence for `9f53df16...`. | Workflow `34816222109` success; Windows/Node26 `103900650178` PASS; Ubuntu/Node22 `103900651331` PASS. Narrow CI verification only; not Green/PRS. |
| A-GREEN-07 | P0 | BLOCKED | Independent exact-head Green assurance for mutation/recovery semantics. | Only eligible after a real ownership-primitive change and relevant exact-head adversarial PASS evidence. |
| A-PRS-08 | P0 | BLOCKED | Independent PRS false-GREEN assurance: missing receipt, mutation-without-receipt, receipt-without-mutation, partial write, crash boundaries, stale lock, replay, concurrent writers, result-write failure, stale evidence, approval bypass, worker self-verification. | Independent PRS evidence on exact eligible head; no worker self-certification. |
| A-WIN-09 | P0 | HOLD | Physical Windows owner-laptop Level 2 acceptance. | Exact task/mission/wake/host/result correlation, bounded project-file mutation, tests, receipts, recovery and assurance on physical Windows. Runtime-changing head must be tested; predecessor evidence does not promote current head. |

## Execution order
1. Preserve the current fail-closed runtime and exact-head CI evidence.
2. Consume A-OWN-01 first when a canonical kernel-enforced ownership implementation becomes available; do not patch around it with check-then-act ownership.
3. Immediately expand into A-REC-02, A-IDEM-03 and A-CONC-04 as a homogeneous adversarial batch once the ownership gate is materially changed.
4. Work A-AUTH-05 independently when an existing canonical authenticated actor/grant resolver can be evidenced.
5. Request/consume independent Green, then PRS, only after exact-head implementation evidence exists.
6. Perform physical Windows acceptance only on the exact runtime-changing head that is intended to advance.

## Replenishment rules
- Every `cont`, `continue`, `continue autonomously`, or `continue autonomously vertically` triggers: fresh scan -> reconcile this file -> execute fullest safe useful batch -> verify -> second fresh scan -> replenish this same file -> durable checkpoint.
- If another agent/schedule moves PR #104 or this batch file, re-read and reconcile; never overwrite fresher verified evidence.
- A blocked P0 must remain blocked while independent eligible work continues.
- Do not call overall AgentOS Level 2 GREEN until independent Green + PRS + required physical Windows acceptance support that exact state.
