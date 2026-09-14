# AgentOS Vertical Execution Batch

## Project / control
- Repository: `darrinbaldwindev/AgentOS`
- Canonical portfolio mission: `darrinbaldwindev/Overseer#49`
- Canonical execution procedure: `darrinbaldwindev/Overseer/.overseer/doctrine/PORTFOLIO-BATCH-ENGINE.md`
- Project profile: `darrinbaldwindev/Overseer/.overseer/profiles/PROJECT-BATCH-PROFILES.md#AgentOS`
- Security matrix: `darrinbaldwindev/Overseer/.overseer/security/AGENTOS-SECURITY-GATE-MATRIX.md`
- Active implementation PR: `AgentOS#104` — `agent/overseer/windows-worker-bridge`
- Purpose: bounded Level 2 execution manifest. Repository/runtime/CI evidence always outranks this file.

## Fresh-scan checkpoint
- Reconciled: 2026-09-15 03:08+10:00 (Brisbane).
- Pre-cycle exact head: `7f84f4f3fae841b18068bfe3d630ce36e8b1a07e`, Tests `34866176685` SUCCESS.
- Current A-AG-05 implementation head before this docs-only reconciliation: `393ff76bd8ae0dd56853d24451fe881ff07b191f`.
- PR state: OPEN / DRAFT / UNMERGED / runtime-disabled.
- First A-AG-05 attempt `8c1fe9440b20097f33c095f416de5f509c24913a` hardened the generic persistence adapter and failed exact-head Tests `34872492121` on Ubuntu and Windows. That enforcement point was too broad; the generic adapter was restored unchanged.
- Current implementation keeps correlation denial at the existing canonical `createRemoteExecutionReceipt` boundary. Missing/blank mission, task or wake identity is rejected before any durable receipt artifact exists; a complete canonical receipt persists normally; existing duplicate durable receipt provenance protection remains intact.
- Tests `34872702057` on `393ff76b...`: Ubuntu/Node22 full suite + npm audit PASS. Windows/Node26 first attempt FAILED; a rerun of only that failed job is queued/running. Therefore A-AG-05 is not VERIFIED yet.
- SG-08 continuous ownership remains BLOCKED. SG-01/02 authenticated actor + canonical grant binding remain BLOCKED. Functional evidence does not promote either security gate.

## Governance boundaries
This batch does **not** authorize merge, approve, mark-ready, rebase, deploy, credential/security-policy changes, production writes, unrestricted PowerShell, runtime enablement, purchases/spend, external contact/publication, physical owner-host action, bypass of Green/PRS, or creation of duplicate scheduler/queue/registry/mission-ledger/authority/persistence/governance systems.

Core invariant: **NO MODEL DECIDES ITS OWN AUTHORITY.** Functional verification, security assurance and PRS assurance remain separate.

## Current vertical batch

### A-AG-01 — continuous project-file ownership fence
- state: BLOCKED
- risk_class: S2
- security_gates: SG-03, SG-08, SG-09, SG-10, SG-11, SG-14, SG-18, SG-19
- objective: one crash-releasing kernel-enforced fence held continuously from final verification through publish/prepared recovery and durable success receipt.
- blocker: existing exact lineage still lacks independent evidence that ownership remains continuously valid through that whole sequence.
- next: keep single-threaded; do not parallelize or create a second lock/ledger.

### A-AG-02 — authenticated actor + canonical grant binding
- state: BLOCKED
- risk_class: S2
- security_gates: SG-01, SG-02, SG-03, SG-04, SG-09, SG-10, SG-11, SG-18, SG-19
- objective: bind an existing authenticated actor source and canonical grant resolver.
- blocker: current admission producer consumes caller-supplied authenticated actor context and injected grant evidence; no bindable canonical transport/grant source is yet evidenced.
- next: architecture discovery only until a real existing source is identified. No self-grant or duplicate authority registry.

### A-AG-03 — Basic Chat lifecycle/readiness
- state: VERIFIED (functional exact-head scope only)
- security_disposition: PENDING_SG18
- exact prior evidence: PR #111 `352c83fdbcff65dd9dc592fb3b8d65d4aa130969`, Tests `34863648579` SUCCESS.
- next: independent Green false-readiness/evidence-leakage sample on the exact eligible lineage.

### A-AG-04 — authority-evidence receipt persistence/reload
- state: VERIFIED_EXACT_HEAD (functional)
- exact prior anchor: PR #104 `7f84f4f3fae841b18068bfe3d630ce36e8b1a07e`, substantive `5e3d7c2ac6f515dceda832ef09b3087f20fb1d7b`, Tests `34866176685` SUCCESS.
- risk_class: S2
- security_gates: SG-02, SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch tests only.
- negative_tests: persistence restart/reload retains exact authority evidence; duplicate durable receipt cannot replace original provenance; upstream binder denies missing/blank admitted authority evidence.
- receipt_evidence: exact `authority_evidence_id` + delivery/request/task/mission durable receipt lineage.
- green_required: yes
- prs_required: conditional
- owner_boundary: merge/deploy/runtime enablement
- security_disposition: PENDING_SG18

### A-AG-05 — receipt replay/correlation adjacency
- state: ACTIVE / CI_PENDING
- implementation_head: `393ff76bd8ae0dd56853d24451fe881ff07b191f`
- risk_class: S2
- security_gates: SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch tests only.
- objective: homogeneous deterministic replay/correlation regressions around the stable receipt primitive without widening the generic persistence contract.
- implemented: canonical receipt construction now has regression evidence that missing/blank mission/task/wake correlation is rejected before persistence; complete canonical receipt persists; duplicate durable receipt cannot replace original authority provenance.
- CI: `34872702057`; Ubuntu PASS; Windows first attempt FAIL, failed-job rerun pending. Earlier broad persistence hardening attempt `34872492121` failed and was corrected rather than weakened around.
- acceptance remaining: Windows exact-head rerun must pass or expose a reproducible platform defect; stale-receipt freshness is not invented because no canonical freshness/expiry semantics are evidenced at this layer.
- negative_tests: missing mission/task/wake; duplicate durable receipt/provenance replacement; existing upstream replay/cross-task/cross-mission claim guards remain separate evidence.
- receipt_evidence: delivery/request/mission/task/wake/authority-evidence durable lineage + exact run IDs.
- green_required: yes
- prs_required: conditional
- owner_boundary: merge/deploy/runtime enablement
- security_disposition: PENDING_SG18

### A-AG-06 — local-wake correlation preservation
- state: VERIFIED (bounded prior scope)
- exact prior evidence: `a69562dfe19696b79474c1a3f01a10d67b8d8e90`, runs `34849679000` and `34849679095` SUCCESS.
- security_disposition: PENDING_SG18 before promotion.

### A-AG-07 — physical Windows acceptance packet
- state: BLOCKED / OWNER_REQUIRED
- dependencies: SG-08 closure, SG-01/02 closure, exact-head Green/PRS where required, explicit owner physical-host authority.
- no physical Windows action is authorized by this batch.

## PRS / Green assurance
- stale-owner false-GREEN baseline remains historical evidence only; it does not transfer to successor heads.
- successor ownership challenge remains BLOCKED on A-AG-01 + exact-head Green.
- admission false-GREEN challenge remains BLOCKED on A-AG-02 + exact-head Green.
- Basic Chat false-readiness/evidence-leakage sample is eligible only for an exact stable PR #111 lineage; this execution context does not impersonate Green or PRS.

## Execution order / replenishment
1. Finish exact-head Windows CI closure for A-AG-05; if it fails again, record the exact platform evidence gap and do not promote.
2. Keep A-AG-01 single-threaded and BLOCKED until a real ownership primitive is available.
3. Keep A-AG-02 BLOCKED until a real canonical authenticated actor/grant source is evidenced.
4. After A-AG-05 exact-head functional closure, route the unchanged eligible lineage to independent Green; PRS follows only where required and only on identical evidence lineage.
5. Keep physical Windows acceptance owner-gated and downstream of software/security prerequisites.
6. Continue adjacent safe Level 2 work if a blocked primitive cannot move; never manufacture progress by widening authority.

No overall AgentOS GREEN is implied by this batch.
