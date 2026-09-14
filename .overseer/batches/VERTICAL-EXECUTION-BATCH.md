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
- Reconciled: 2026-09-15 06:15+10:00 (Brisbane).
- Pre-cycle docs head `d46d67414228231611cd6a34999163055315de57` had contradictory exact-head CI: `34884690804` was cross-platform SUCCESS, while later `34884807154` reproduced a Windows failure. The later failure controls and invalidated any blanket current-head verification claim.
- Receipt-regression head `62b961112766b5d8d8f5f033b0c32b3686632a74` added restart/reload expected-lineage denial plus direct-adapter malformed task/wake fail-close regressions. Its exact-head AgentOS Tests `34890361429` completed SUCCESS on Ubuntu/Node22 and Windows/Node26.
- Windows shared-state investigation reproduced `EPERM` during concurrent lock-directory acquisition, then exposed a second `EPERM` during atomic `agentos.json` replacement under the eight-process scheduler regression. No authority or ownership semantics were widened.
- Current substantive repair head before this docs-only reconciliation: `74fe4e8edeae851e06d75e663c04d4b0c15419d4`.
- Exact-head AgentOS Tests `34891305730`: Ubuntu/Node22 full suite + npm audit SUCCESS; Windows/Node26 full suite + npm audit SUCCESS. The previously failing multi-process scheduler regression, local-persistence concurrency suite and project-file-writer suite all completed successfully on this exact head.
- Shared local persistence now treats Windows lock-directory `EPERM` as bounded contention only at the existing lock seam, and retries transient Windows atomic replacement failures (`EPERM`/`EACCES`/`EBUSY`) only while the existing mutation lock remains continuously held. Retry exhaustion fails closed as `LOCAL_STATE_ATOMIC_REPLACE_FAILED`.
- This is shared-state concurrency evidence, not proof of SG-08 project-file continuous ownership. A-AG-01 remains BLOCKED. SG-01/02 authenticated actor + canonical grant binding remain BLOCKED.

## Governance boundaries
This batch does **not** authorize merge, approve, mark-ready, rebase, deploy, credential/security-policy changes, production writes, unrestricted PowerShell, runtime enablement, purchases/spend, external contact/publication, physical owner-host action, bypass of Green/PRS, or creation of duplicate scheduler/queue/registry/mission-ledger/authority/persistence/governance systems.

Core invariant: **NO MODEL DECIDES ITS OWN AUTHORITY.** Functional verification, security assurance and PRS assurance remain separate.

## Current vertical batch

### A-AG-01 — continuous project-file ownership fence
- state: BLOCKED
- risk_class: S2
- security_gates: SG-03, SG-08, SG-09, SG-10, SG-11, SG-14, SG-18, SG-19
- authority_required: scoped non-production branch/test write only when this single-threaded primitive is being changed.
- objective: one crash-releasing kernel-enforced fence held continuously from final verification through publish/prepared recovery and durable success receipt.
- negative_tests: replacement-after-verification; successor/three-writer; stale identity; TOCTOU; crash/replay; duplicate mutation/result; prepared-recovery stale-owner.
- receipt_evidence: actor/task/file/pre-postimage/ownership/result lineage.
- green_required: yes
- prs_required: yes
- owner_boundary: merge/deploy/physical production
- security_disposition: BLOCKED
- blocker: current exact lineage still lacks independent proof that ownership remains continuously valid through final verification -> publish/prepared recovery -> durable success receipt -> release. Cross-platform test success alone cannot promote SG-08.
- next: keep single-threaded; route an unchanged eligible ownership lineage to independent Green/PRS only after the actual primitive is proven. Do not create a second lock/ledger.

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
- authority_required: none for read-only readiness projection.
- negative_tests: scheduler-enabled fail-close; autonomy fail-close; lifecycle/restart; no self-Green injection.
- receipt_evidence: exact task/mission/wake evidence projection only.
- green_required: yes before promotion
- prs_required: conditional
- owner_boundary: no mutation/physical readiness inferred.
- security_disposition: PASS_BOUNDED on prior sampled scope.

### A-AG-04 — authority-evidence receipt persistence/reload
- state: VERIFIED (functional bounded scope)
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
- authority_required: scoped test-only evidence work.
- negative_tests: blank required IDs; duplicate durable receipt ID.
- receipt_evidence: immutable IDs/provenance/disposition.
- green_required: yes if promoted
- prs_required: conditional
- owner_boundary: merge/deploy
- security_disposition: PASS_BOUNDED on sampled scope.

### A-AG-05B — mismatch/replay/direct-adapter correlation closure
- state: SPLIT_REQUIRED / PARTIAL_FUNCTIONAL_VERIFIED
- current_verified_test_lineage: `62b961112766b5d8d8f5f033b0c32b3686632a74`, Tests `34890361429` SUCCESS cross-platform.
- risk_class: S2 parent item; read-only evidence-consumer regressions are S1.
- security_gates: SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch/test write.
- objective: close previously overstated receipt replay/correlation scope without creating new persistence/authority layers.
- verified: exact expected delivery/mission/task/wake lineage passes; cross-mission/cross-task/cross-wake borrowing fails closed; malformed durable task/wake fields fail closed through the direct adapter; after restart/reload the exact lineage remains consumable while stale expected mission lineage is denied.
- negative_tests_verified: exact expected lineage; cross-mission; cross-task; cross-wake; malformed durable task; malformed durable wake; restart/reload exact lineage; restart/reload stale expected lineage.
- remaining_negative_tests: conflicting replay semantics where not already covered by the canonical claim/recovery store; freshness/expiry remains UNKNOWN/N/A unless a real canonical freshness source exists.
- receipt_evidence: durable receipt ID + delivery/request/mission/task/wake/authority-evidence identity + exact head/run.
- green_required: yes on an unchanged eligible lineage before promotion.
- prs_required: conditional; completion-grade PRS remains ineligible while A-AG-01/A-AG-02 are blocked.
- owner_boundary: no new persistence/authority plane; merge/deploy/runtime enablement.
- security_disposition: PENDING_SG18; parent remains SPLIT_REQUIRED.
- next: inspect existing claim/recovery replay coverage before adding any further semantics; do not invent freshness.

### A-AG-06 — bounded receipt provenance evidence projection
- state: VERIFIED / PASS_BOUNDED
- exact prior repaired head: `2c52de5820f1dfb0dc2536ec1a6887443b5a063d`.
- risk_class: S1
- security_gates: SG-05, SG-10, SG-11, SG-14, SG-18
- authority_required: none; read-only evidence projection.
- negative_tests: noncanonical durable artifact ID; missing receipt; malformed required correlation; secret-shaped field exclusion.
- receipt_evidence: exact durable artifact ID plus bounded whitelisted projection.
- green_required: satisfied only for the cited bounded prior scope; does not transfer automatically to newer heads.
- prs_required: conditional
- owner_boundary: no new evidence authority; merge/deploy
- security_disposition: PASS_BOUNDED on the cited exact head only.

### A-AG-07 — physical Windows acceptance packet
- state: BLOCKED / OWNER_REQUIRED
- risk_class: S2
- security_gates: SG-03, SG-08, SG-10, SG-11, SG-14, SG-18, SG-20
- authority_required: explicit owner-authorized physical Windows action.
- negative_tests: wrong head; production root; missing receipt.
- receipt_evidence: exact head/host/root/test/result.
- green_required: yes
- prs_required: yes if promoted
- owner_boundary: physical Windows execution
- security_disposition: BLOCKED
- dependencies: SG-08 closure, SG-01/02 closure, exact-head Green/PRS where required.

### A-AG-08 — Windows shared-state persistence contention / atomic replacement
- state: VERIFIED_EXACT_HEAD (functional bounded scope)
- substantive_head: `74fe4e8edeae851e06d75e663c04d4b0c15419d4`
- exact_tests: AgentOS Tests `34891305730` SUCCESS on Ubuntu/Node22 and Windows/Node26 including npm audits.
- risk_class: S2
- security_gates: SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch implementation/test only; no new authority.
- objective: preserve the existing local persistence single-writer contract under real Windows contention without creating a second persistence mechanism.
- negative_tests: concurrent independent state handles; stale CAS rejection; failed atomic batch invisibility; abandoned lock not stolen; eight real scheduler processes cannot execute one delivery twice; bounded failure if Windows atomic replacement remains unavailable.
- receipt_evidence: exact branch head + workflow run + cross-platform full-suite result.
- green_required: yes before any capability promotion.
- prs_required: conditional; this does not substitute for A-AG-01 ownership assurance.
- owner_boundary: merge/deploy/runtime enablement; no production writes.
- security_disposition: PENDING_SG18 despite functional exact-head success.
- note: the first Windows fix closed lock-acquisition `EPERM` but exposed atomic-replacement `EPERM`; the second bounded retry retained the existing lock continuously and made both concurrency paths pass. This is not an SG-08 ownership claim.

## PRS / Green assurance
- Historical stale-owner false-GREEN evidence remains a defect baseline only and does not transfer to successor heads.
- Completion-grade ownership challenge remains BLOCKED on A-AG-01 + exact-head Green.
- Admission challenge remains BLOCKED on A-AG-02 + exact-head Green.
- A-AG-08 has functional exact-head CI only; SG-18 remains PENDING and PRS status is not promoted by this executor.

## Execution order / replenishment
1. Preserve A-AG-01 as the single-threaded SG-08 critical primitive; independently challenge the current ownership sequence without conflating A-AG-08 persistence success with ownership proof.
2. Keep A-AG-02 BLOCKED until a real canonical authenticated actor/grant source is evidenced; no substitute authority source.
3. Inspect canonical remote claim/recovery coverage for any still-uncovered conflicting replay case before adding A-AG-05B semantics; freshness remains UNKNOWN/N/A without a canonical source.
4. Route unchanged eligible A-AG-08/A-AG-05B evidence to independent Green only after exact-head eligibility is confirmed; then PRS only where prerequisites are satisfied.
5. Keep physical Windows acceptance owner-gated and downstream of software/security prerequisites.
6. Continue adjacent Everyday frontend / Night Shift / Morning Brief / upgrade-boundary work only where it does not widen authority.

No overall AgentOS GREEN is implied by this batch.
