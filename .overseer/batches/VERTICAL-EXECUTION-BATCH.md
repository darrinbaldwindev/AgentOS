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
- Reconciled: 2026-09-15 05:03+10:00 (Brisbane).
- Pre-cycle repaired receipt-evidence head: `2c52de5820f1dfb0dc2536ec1a6887443b5a063d`; independent Jess/Michael checkpoint `Overseer#49/5668899858` records A-AG-06 PASS_BOUNDED and SG-08 / SG-01/02 still BLOCKED.
- Current substantive A-AG-05B head before this docs-only reconciliation: `a24270b5d1e90d946c6d0ecc52c9aa66736d02bb`.
- Exact-head AgentOS Tests `34884462139`: Ubuntu/Node22 full suite + npm audit SUCCESS; Windows/Node26 full suite + npm audit SUCCESS.
- PR state at substantive verification: OPEN / DRAFT / UNMERGED / runtime-disabled.
- New bounded evidence-consumer method `evidencePacketForCorrelation()` reuses the existing durable receipt projection and fails closed if the caller's expected mission/task/wake lineage differs from the persisted receipt. Deterministic regressions cover exact match plus cross-mission, cross-task and cross-wake borrowing denial.
- This closes only the expected-lineage mismatch sub-slice of A-AG-05B. It does not prove blanket replay/idempotency, conflicting replay, restart/reload replay closure, canonical freshness/expiry semantics, authenticated actor/grant binding, or continuous mutation ownership.
- SG-08 continuous ownership remains BLOCKED. SG-01/02 authenticated actor + canonical grant binding remain BLOCKED. Functional evidence does not promote either security gate.

## Governance boundaries
This batch does **not** authorize merge, approve, mark-ready, rebase, deploy, credential/security-policy changes, production writes, unrestricted PowerShell, runtime enablement, purchases/spend, external contact/publication, physical owner-host action, bypass of Green/PRS, or creation of duplicate scheduler/queue/registry/mission-ledger/authority/persistence/governance systems.

Core invariant: **NO MODEL DECIDES ITS OWN AUTHORITY.** Functional verification, security assurance and PRS assurance remain separate.

## Current vertical batch

### A-AG-01 — continuous project-file ownership fence
- state: BLOCKED
- risk_class: S2
- security_gates: SG-03, SG-08, SG-09, SG-10, SG-11, SG-14, SG-18, SG-19
- authority_required: scoped non-production branch/test write only when a real ownership primitive is being changed.
- objective: one crash-releasing kernel-enforced fence held continuously from final verification through publish/prepared recovery and durable success receipt.
- negative_tests: replacement-after-verification; successor/three-writer; stale identity; TOCTOU; crash/replay; duplicate mutation/result; prepared-recovery stale-owner.
- receipt_evidence: actor/task/file/pre-postimage/ownership/result lineage.
- green_required: yes
- prs_required: yes
- owner_boundary: merge/deploy/physical production
- security_disposition: BLOCKED
- blocker: current exact lineage still lacks independent evidence that ownership remains continuously valid through the whole sequence.
- next: keep single-threaded; do not parallelize or create a second lock/ledger.

### A-AG-02 — authenticated actor + canonical grant binding
- state: BLOCKED
- risk_class: S2
- security_gates: SG-01, SG-02, SG-03, SG-04, SG-09, SG-10, SG-11, SG-18, SG-19
- authority_required: real existing authenticated identity/grant read plus scoped tests.
- objective: bind an existing authenticated actor source and canonical grant resolver.
- negative_tests: host-as-auth; spoof actor; payload self-grant; absent/mismatch/cross-project/replayed grant.
- receipt_evidence: issuer/source/version/request/task/mission where the canonical source actually provides them.
- green_required: yes
- prs_required: yes
- owner_boundary: credentials/security policy
- security_disposition: BLOCKED
- blocker: current admission producer consumes caller-supplied authenticated actor context and injected grant evidence; no bindable canonical transport/grant source is yet evidenced.
- next: architecture discovery only until a real existing source is identified. No self-grant or duplicate authority registry.

### A-AG-03 — Basic Chat lifecycle/readiness
- state: VERIFIED (functional bounded scope)
- exact prior evidence: PR #111 `352c83fdbcff65dd9dc592fb3b8d65d4aa130969`, Tests `34863648579` SUCCESS.
- risk_class: S1
- security_gates: SG-03, SG-05, SG-10, SG-14, SG-18
- green_required: yes before promotion
- prs_required: conditional
- security_disposition: PASS_BOUNDED on prior sampled scope; no mutation/physical readiness implied.

### A-AG-04 — authority-evidence receipt persistence/reload
- state: VERIFIED (functional bounded scope)
- exact prior anchor: receipt persistence/reload lineage carried forward on PR #104.
- risk_class: S2
- security_gates: SG-02, SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch tests only.
- negative_tests: restart/reload retains exact authority evidence; duplicate durable receipt cannot replace original provenance; upstream binder denies missing/blank admitted authority evidence.
- receipt_evidence: exact `authority_evidence_id` + delivery/request/task/mission durable receipt lineage.
- green_required: yes
- prs_required: conditional
- owner_boundary: merge/deploy/runtime enablement
- security_disposition: PENDING_SG18 for any promoted capability.

### A-AG-05A — canonical required correlation + duplicate provenance
- state: VERIFIED (functional bounded scope)
- risk_class: S1
- security_gates: SG-10, SG-11, SG-14, SG-18
- objective: retain only evidence actually proved: required canonical mission/task/wake identity and duplicate durable receipt-ID first-write provenance.
- negative_tests: blank required IDs; duplicate durable receipt ID.
- receipt_evidence: immutable IDs/provenance/disposition.
- green_required: yes if promoted
- prs_required: conditional
- owner_boundary: merge/deploy
- security_disposition: PASS_BOUNDED on previously sampled scope.

### A-AG-05B — mismatch/replay/direct-adapter correlation closure
- state: SPLIT_REQUIRED / PARTIAL_FUNCTIONAL_VERIFIED
- substantive_head: `a24270b5d1e90d946c6d0ecc52c9aa66736d02bb`
- exact_tests: `34884462139` SUCCESS on Ubuntu/Node22 and Windows/Node26 including npm audits.
- risk_class: S2 parent item; this cycle's read-only evidence-consumer sub-slice is S1.
- security_gates: SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch/test write.
- objective: close previously overstated receipt replay/correlation scope without creating new persistence/authority layers.
- verified_this_cycle: existing durable receipt evidence can be consumed only against caller-supplied expected delivery/mission/task/wake lineage; exact lineage passes; cross-mission, cross-task and cross-wake borrowing fails `REMOTE_RECEIPT_EVIDENCE_CORRELATION_MISMATCH`.
- negative_tests_verified: exact expected mission/task/wake; cross-mission; cross-task; cross-wake.
- remaining_negative_tests: conflicting replay; restart/reload replay behavior; direct-adapter malformed receipt bypass beyond the already repaired forged artifact-ID case; stale/freshness only if a canonical freshness source exists.
- receipt_evidence: durable receipt ID + delivery/request/mission/task/wake/authority-evidence identity + exact head/run.
- green_required: yes for the new exact head before promotion.
- prs_required: conditional; completion-grade PRS remains ineligible while A-AG-01/A-AG-02 are blocked.
- owner_boundary: no new persistence/authority plane; merge/deploy/runtime enablement.
- security_disposition: PENDING_SG18 for this new sub-slice; parent remains SPLIT_REQUIRED.
- next: independent Green sample on unchanged substantive lineage; then inspect existing replay/direct-adapter paths before any further compatible change. Do not invent freshness semantics.

### A-AG-06 — bounded receipt provenance evidence projection
- state: VERIFIED / PASS_BOUNDED
- exact prior repaired head: `2c52de5820f1dfb0dc2536ec1a6887443b5a063d`.
- exact independent assurance: `Overseer#49/5668899858`; exact-head Linux/Windows tests PASS.
- risk_class: S1
- security_gates: SG-05, SG-10, SG-11, SG-14, SG-18
- negative_tests: noncanonical durable artifact ID -> `REMOTE_RECEIPT_EVIDENCE_ID_MISMATCH`; missing receipt; malformed required correlation; secret-shaped field exclusion.
- receipt_evidence: exact durable artifact ID plus bounded whitelisted projection.
- green_required: satisfied only for this bounded repaired projection scope at the cited head; does not transfer automatically to newer heads.
- prs_required: conditional
- owner_boundary: no new evidence authority; merge/deploy
- security_disposition: PASS_BOUNDED on the cited exact head only.

### A-AG-07 — physical Windows acceptance packet
- state: BLOCKED / OWNER_REQUIRED
- risk_class: S2
- security_gates: SG-03, SG-08, SG-10, SG-11, SG-14, SG-18, SG-20
- authority_required: explicit owner-authorized physical Windows action.
- dependencies: SG-08 closure, SG-01/02 closure, exact-head Green/PRS where required.
- negative_tests: wrong head; production root; missing receipt.
- receipt_evidence: exact head/host/root/test/result.
- green_required: yes
- prs_required: yes if promoted
- owner_boundary: physical Windows execution
- security_disposition: BLOCKED

## PRS / Green assurance
- Historical stale-owner false-GREEN evidence remains a defect baseline only and does not transfer to successor heads.
- Completion-grade ownership challenge remains BLOCKED on A-AG-01 + exact-head Green.
- Admission challenge remains BLOCKED on A-AG-02 + exact-head Green.
- A-AG-06 has independent bounded Green/security PASS only at `2c52de582...`.
- The new A-AG-05B expected-lineage sub-slice at `a24270b5...` requires independent exact-head Green before any security promotion; this execution context does not impersonate Green or PRS.

## Execution order / replenishment
1. Route the unchanged A-AG-05B substantive head/evidence to independent Green for the exact expected-lineage mismatch sub-slice; do not infer PASS from CI.
2. Inspect existing replay/conflicting-replay and direct-adapter pathways and add only compatible regressions at existing boundaries; keep stale/freshness semantics UNKNOWN/N/A unless a canonical source exists.
3. Keep A-AG-01 single-threaded and BLOCKED until a real continuous ownership primitive is available.
4. Keep A-AG-02 BLOCKED until a real canonical authenticated actor/grant source is evidenced.
5. Keep physical Windows acceptance owner-gated and downstream of software/security prerequisites.
6. Continue adjacent safe Level 2 work if a blocked primitive cannot move; never manufacture progress by widening authority.

No overall AgentOS GREEN is implied by this batch.
